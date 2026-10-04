package scenarios

import (
	"encoding/json"
	"os"
	"testing"
	"time"
)

func TestDeterminismAndRelations(t *testing.T) {
	a := Generate()
	b, _ := json.Marshal(a)
	c, _ := json.Marshal(Generate())
	if string(b) != string(c) {
		t.Fatal("generation drift")
	}
	clock, _ := time.Parse(time.RFC3339, a.Clock)
	ids := map[string]bool{}
	for _, task := range a.Tasks {
		start, err := time.Parse(time.RFC3339, task.Started)
		if err != nil || start.After(clock) || ids[task.ID] || task.RunID == "" {
			t.Fatal("incoherent record", task.ID)
		}
		ids[task.ID] = true
	}
	if a.Seed == 0 {
		t.Fatal("zero seed")
	}
}
func TestFixtureJoins(t *testing.T) {
	s := Generate()
	for i, task := range s.Tasks {
		session, trace, usage := s.Sessions[i], s.Traces[i], s.Usage[i]
		if session.ID != task.SessionID || session.RunID != task.RunID || session.Owner != task.Owner || trace.ID != task.TraceID || trace.RunID != task.RunID || trace.Started != task.Started || usage.ID != task.UsageID || usage.RunID != task.RunID || usage.Tokens != task.Tokens || usage.Cost != task.Cost {
			t.Fatal("joined records disagree", task.ID)
		}
	}
}
func TestBundledFixtureFreshness(t *testing.T) {
	b, err := os.ReadFile("../../frontend/src/fixtures/operations.json")
	if err != nil {
		t.Fatal(err)
	}
	var bundled Scenario
	if err = json.Unmarshal(b, &bundled); err != nil {
		t.Fatal(err)
	}
	a, _ := json.Marshal(Generate())
	c, _ := json.Marshal(bundled)
	if string(a) != string(c) {
		t.Fatal("bundled JSON differs from generator: run make fixtures")
	}
}
func TestLargeProfile(t *testing.T) {
	s := GenerateProfile(80)
	if len(s.Tasks) != 80 || len(s.Sessions) != 80 || len(s.Usage) != 80 || len(s.Traces) != 80 {
		t.Fatal("volume profile incomplete")
	}
	clock, _ := time.Parse(time.RFC3339, s.Clock)
	ids := map[string]bool{}
	for _, task := range s.Tasks {
		start, err := time.Parse(time.RFC3339, task.Started)
		if err != nil || start.After(clock) || ids[task.RunID] {
			t.Fatal("incoherent large profile")
		}
		ids[task.RunID] = true
	}
}
