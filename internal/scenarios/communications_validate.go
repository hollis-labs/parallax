package scenarios

import (
	"fmt"
	"time"
)

// ValidateCommunications verifies cross-family joins and the declared fixed clock.
func ValidateCommunications(s Communications, ops Scenario) error {
	if s.Version == "" || s.Generator == "" || s.Seed != ops.Seed || s.Clock != ops.Clock || s.OperationsVersion != ops.Version {
		return fmt.Errorf("communications identity mismatch")
	}
	clock, _ := time.Parse(time.RFC3339, s.Clock)
	ids := map[string]bool{}
	unique := func(id string) bool {
		if id == "" || ids[id] {
			return false
		}
		ids[id] = true
		return true
	}
	runs := map[string]Run{}
	for _, r := range ops.Runs {
		runs[r.ID] = r
	}
	contacts := map[string]Contact{}
	for _, c := range s.Contacts {
		if !unique(c.ID) {
			return fmt.Errorf("contact identity invalid")
		}
		contacts[c.ID] = c
	}
	convs := map[string]Conversation{}
	for _, c := range s.Conversations {
		if !unique(c.ID) || contacts[c.ContactID].ID == "" || runs[c.RunID].ID == "" {
			return fmt.Errorf("conversation relationship invalid")
		}
		convs[c.ID] = c
	}
	attachments := map[string]Attachment{}
	for _, a := range s.Attachments {
		if !unique(a.ID) || runs[a.RunID].ID == "" || a.Content == "" {
			return fmt.Errorf("attachment relationship invalid")
		}
		attachments[a.ID] = a
	}
	plans := map[string]ReviewPlan{}
	for _, p := range s.Plans {
		if !unique(p.ID) || runs[p.RunID].ID == "" || len(p.Steps) == 0 {
			return fmt.Errorf("plan relationship invalid")
		}
		plans[p.ID] = p
	}
	queues := map[string]ReviewQueue{}
	for _, q := range s.Queues {
		if !unique(q.ID) || runs[q.RunID].ID == "" {
			return fmt.Errorf("queue relationship invalid")
		}
		queues[q.ID] = q
	}
	chats := map[string]ChatSession{}
	for _, c := range s.ChatSessions {
		r := runs[c.RunID]
		if !unique(c.ID) || r.ID == "" || r.SessionID != c.SessionID || contacts[c.ContactID].ID == "" || attachments[c.AttachmentID].RunID != r.ID || plans[c.PlanID].RunID != r.ID || queues[c.QueueID].RunID != r.ID {
			return fmt.Errorf("chat relationship invalid")
		}
		chats[c.ID] = c
	}
	for _, c := range s.Cards {
		if !unique(c.ID) || chats[c.ChatID].ID == "" || c.Kind == "" || c.Title == "" {
			return fmt.Errorf("card relationship invalid")
		}
	}
	for _, m := range s.Messages {
		c := convs[m.ConversationID]
		stamp, err := time.Parse(time.RFC3339, m.Time)
		start, _ := time.Parse(time.RFC3339, runs[c.RunID].Started)
		if !unique(m.ID) || c.ID == "" || c.ContactID != m.ContactID || err != nil || stamp.After(clock) || stamp.Before(start) {
			return fmt.Errorf("message relationship/time invalid")
		}
		for _, id := range m.AttachmentIDs {
			if attachments[id].ID == "" || attachments[id].RunID != c.RunID {
				return fmt.Errorf("message attachment relationship invalid")
			}
		}
	}
	return nil
}
