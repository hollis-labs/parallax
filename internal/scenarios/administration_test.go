package scenarios

import (
	"encoding/json"
	"os"
	"reflect"
	"testing"
)

func TestAdministrationArtifact(t *testing.T) {
	a := GenerateAdministration()
	if err := ValidateAdministration(a); err != nil {
		t.Fatal(err)
	}
	if !reflect.DeepEqual(a, GenerateAdministration()) {
		t.Fatal("not deterministic")
	}
	b, err := os.ReadFile("../../frontend/src/fixtures/administration.json")
	if err != nil {
		t.Fatal(err)
	}
	var bundled Administration
	if err := json.Unmarshal(b, &bundled); err != nil {
		t.Fatal(err)
	}
	if !reflect.DeepEqual(a, bundled) {
		t.Fatal("artifact stale")
	}
}
func TestAdministrationRejectsWrongRelationships(t *testing.T) {
	for _, alter := range []func(*Administration){func(a *Administration) { a.Users[0].ContactID = "missing" }, func(a *Administration) { a.Users[0].RoleIDs = []string{"missing"} }, func(a *Administration) { a.Roles[0].PermissionIDs = []string{"missing"} }, func(a *Administration) { a.CurrentUserID = "missing" }, func(a *Administration) { a.Settings[0].Source = "guessed" }, func(a *Administration) { a.Settings[1].Reason = "" }, func(a *Administration) { a.Users = append(a.Users, a.Users[0]) }} {
		a := GenerateAdministration()
		alter(&a)
		if ValidateAdministration(a) == nil {
			t.Fatal("accepted incoherent fixture")
		}
	}
}

func TestAdministrationRejectsUnknownGenerator(t *testing.T) {
	a := GenerateAdministration()
	a.Generator = "parallax/future"
	if ValidateAdministration(a) == nil {
		t.Fatal("accepted unsupported generator")
	}
}
