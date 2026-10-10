package scenarios

import (
	"encoding/json"
	"os"
	"reflect"
	"testing"
)

func TestFamilyManifestMatchesArtifactsAndPointers(t *testing.T) {
	expected := GenerateFamilyContracts()
	b, e := os.ReadFile("../../frontend/src/fixtures/family-contracts.json")
	if e != nil {
		t.Fatal(e)
	}
	var bundled FamilyManifest
	if e = json.Unmarshal(b, &bundled); e != nil {
		t.Fatal(e)
	}
	if !reflect.DeepEqual(bundled, expected) {
		t.Fatal("family contract manifest stale: make fixtures")
	}
	if len(bundled.Families) != 7 {
		t.Fatal("expected seven supplied families")
	}
	for _, f := range bundled.Families {
		for _, p := range f.Profiles {
			raw, e := os.ReadFile("../../" + p.Artifact)
			if e != nil {
				t.Fatal(e)
			}
			var identity struct {
				Version, Generator, Clock string
				Seed                      uint64
			}
			if e = json.Unmarshal(raw, &identity); e != nil {
				t.Fatal(e)
			}
			version, generator := f.Version, f.Generator
			if p.Version != "" {
				version = p.Version
			}
			if p.Generator != "" {
				generator = p.Generator
			}
			if identity.Version != version || identity.Generator != generator || identity.Clock != f.ReferenceClock || identity.Seed != f.Seed {
				t.Fatalf("%s metadata disagrees with supplied artifact", f.ID)
			}
			var records map[string]json.RawMessage
			if e = json.Unmarshal(raw, &records); e != nil {
				t.Fatal(e)
			}
			for key, n := range p.Counts {
				var rows []json.RawMessage
				if e = json.Unmarshal(records[key], &rows); e != nil || len(rows) != n {
					t.Fatalf("%s %s count disagrees", f.ID, key)
				}
			}
		}
		for _, path := range append(append([]string{}, f.Validators...), f.Adapters...) {
			if _, e := os.Stat("../../" + path); e != nil {
				t.Fatalf("missing contract evidence: %s", path)
			}
		}
	}
}
