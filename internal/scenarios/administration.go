package scenarios

import (
	"encoding/json"
	"fmt"
	"os"
)

type ReviewUser struct {
	ID        string   `json:"id"`
	ContactID string   `json:"contactId"`
	Name      string   `json:"name"`
	Email     string   `json:"email"`
	State     string   `json:"state"`
	RoleIDs   []string `json:"roleIds"`
}
type ReviewRole struct {
	ID            string   `json:"id"`
	Label         string   `json:"label"`
	PermissionIDs []string `json:"permissionIds"`
}
type ReviewPermission struct {
	ID          string `json:"id"`
	Label       string `json:"label"`
	Description string `json:"description"`
}
type ReviewSetting struct {
	Key         string `json:"key"`
	Label       string `json:"label"`
	Value       string `json:"value"`
	Source      string `json:"source"`
	SourceLabel string `json:"sourceLabel"`
	Editable    bool   `json:"editable"`
	Pending     bool   `json:"pending"`
	Reason      string `json:"reason"`
}
type Administration struct {
	Version       string             `json:"version"`
	Generator     string             `json:"generator"`
	Clock         string             `json:"clock"`
	Seed          uint64             `json:"seed"`
	CurrentUserID string             `json:"currentUserId"`
	Users         []ReviewUser       `json:"users"`
	Roles         []ReviewRole       `json:"roles"`
	Permissions   []ReviewPermission `json:"permissions"`
	Settings      []ReviewSetting    `json:"settings"`
}

func GenerateAdministration() Administration {
	c := GenerateCommunications()
	a := Administration{Version: "administration/v1", Generator: "parallax/v4", Clock: c.Clock, Seed: c.Seed, CurrentUserID: "USER-001"}
	a.Permissions = []ReviewPermission{{"PERMISSION-READ", "Inspect records", "Fixture records may be presented; this label performs no authorization."}, {"PERMISSION-DRAFT", "Draft preferences", "Local drafts may be reviewed without saving."}, {"PERMISSION-REVIEW", "Review intents", "Inspect a proposed action without executing it."}}
	a.Roles = []ReviewRole{{"ROLE-REVIEWER", "Fixture reviewer", []string{"PERMISSION-READ", "PERMISSION-DRAFT", "PERMISSION-REVIEW"}}, {"ROLE-OBSERVER", "Fixture observer", []string{"PERMISSION-READ"}}}
	for i, contact := range c.Contacts {
		role := "ROLE-REVIEWER"
		state := "identified"
		if i > 0 {
			role = "ROLE-OBSERVER"
		}
		if i == 2 {
			state = "locked"
		}
		a.Users = append(a.Users, ReviewUser{fmt.Sprintf("USER-%03d", i+1), contact.ID, contact.Name, contact.Email, state, []string{role}})
	}
	a.Settings = []ReviewSetting{{"workspace_label", "Workspace label", "Fixture review lab", "default", "Bundled default", true, false, ""}, {"transport", "Message transport", "disabled", "env", "Fixture environment declaration", false, false, "Locked by the fixture environment; no live transport exists."}, {"review_window", "Review window", "14 days", "file", "Bundled review.toml", true, false, ""}, {"density", "Directory density", "comfortable", "override", "Authored local override", true, true, ""}}
	return a
}
func ValidateAdministration(a Administration) error {
	c := GenerateCommunications()
	if a.Version != "administration/v1" || a.Generator != "parallax/v4" || a.Clock != c.Clock || a.Seed != c.Seed {
		return fmt.Errorf("artifact identity mismatch")
	}
	contacts := map[string]bool{}
	for _, v := range c.Contacts {
		contacts[v.ID] = true
	}
	permissions := map[string]bool{}
	roles := map[string]bool{}
	users := map[string]bool{}
	for _, p := range a.Permissions {
		if p.ID == "" || permissions[p.ID] || p.Label == "" {
			return fmt.Errorf("invalid permission")
		}
		permissions[p.ID] = true
	}
	for _, r := range a.Roles {
		if r.ID == "" || roles[r.ID] || len(r.PermissionIDs) == 0 {
			return fmt.Errorf("invalid role")
		}
		roles[r.ID] = true
		for _, id := range r.PermissionIDs {
			if !permissions[id] {
				return fmt.Errorf("unknown permission")
			}
		}
	}
	for _, u := range a.Users {
		if u.ID == "" || users[u.ID] || !contacts[u.ContactID] || u.Name == "" {
			return fmt.Errorf("invalid user")
		}
		users[u.ID] = true
		if u.State != "identified" && u.State != "locked" {
			return fmt.Errorf("unknown user state")
		}
		for _, id := range u.RoleIDs {
			if !roles[id] {
				return fmt.Errorf("unknown role")
			}
		}
	}
	if !users[a.CurrentUserID] {
		return fmt.Errorf("unknown current user")
	}
	keys := map[string]bool{}
	for _, s := range a.Settings {
		if keys[s.Key] || s.Key == "" || s.SourceLabel == "" {
			return fmt.Errorf("invalid setting")
		}
		keys[s.Key] = true
		if s.Source != "default" && s.Source != "env" && s.Source != "file" && s.Source != "override" {
			return fmt.Errorf("unknown provenance")
		}
		if !s.Editable && s.Reason == "" {
			return fmt.Errorf("unexplained lock")
		}
	}
	return nil
}
func WriteAdministration(path string) error {
	a := GenerateAdministration()
	if err := ValidateAdministration(a); err != nil {
		return err
	}
	b, err := json.MarshalIndent(a, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(path, append(b, '\n'), 0644)
}
