package scenarios

import (
	"encoding/json"
	"os"
	"reflect"
	"testing"
)

func TestTorqueReferenceGenerationAndFreshness(t *testing.T) {
	s, r := GenerateTorque()
	again, sidecar := GenerateTorque()
	if !reflect.DeepEqual(s, again) || !reflect.DeepEqual(r, sidecar) {
		t.Fatal("nondeterministic Torque profile")
	}
	if err := ValidateTorque(s, r); err != nil {
		t.Fatal(err)
	}
	for path, value := range map[string]any{"operations-torque.json": s, "torque-reference.json": r} {
		b, e := os.ReadFile("../../frontend/src/fixtures/" + path)
		if e != nil {
			t.Fatal(e)
		}
		actual := reflect.New(reflect.TypeOf(value)).Interface()
		if e = json.Unmarshal(b, actual); e != nil {
			t.Fatal(e)
		}
		if !reflect.DeepEqual(reflect.ValueOf(actual).Elem().Interface(), value) {
			t.Fatal("stale Torque artifact", path)
		}
	}
	if len(s.Runs) != 96 || len(r.RecordedStarts) != 9 || len(r.TaskUpdates) != 193 {
		t.Fatal("unexpected bounded profile cardinality")
	}
	if s.Tasks[8].Narrative != "Recorded follow-up evidence review; previous run remains completed" {
		t.Fatal("snapshot omitted latest update")
	}
}
func TestTorqueRejectsIncompleteOrMismatchedEvidence(t *testing.T) {
	cases := map[string]func(*Scenario, *TorqueReference){
		"orphan run": func(s *Scenario, r *TorqueReference) { s.Tasks = s.Tasks[1:] },
		"missing covered graph start": func(s *Scenario, r *TorqueReference) {
			events := []Event{}
			for _, e := range s.Events {
				if !(e.RunID == "RUN-001" && e.Type == "run.started") {
					events = append(events, e)
				}
			}
			s.Events = events
			starts := []Event{}
			for _, e := range r.RecordedStarts {
				if e.RunID != "RUN-001" {
					starts = append(starts, e)
				}
			}
			r.RecordedStarts = starts
		},
		"graph generator":           func(s *Scenario, r *TorqueReference) { s.Generator = "future" },
		"sidecar version":           func(s *Scenario, r *TorqueReference) { r.Version = "future" },
		"matching unsupported seed": func(s *Scenario, r *TorqueReference) { s.Seed = 2; r.Seed = 2 },
		"profile mismatch":          func(s *Scenario, r *TorqueReference) { r.Profile = "records-8" },
		"clock mismatch":            func(s *Scenario, r *TorqueReference) { r.Clock = "2026-10-04T14:31:00Z" },
		"omitted update":            func(s *Scenario, r *TorqueReference) { r.TaskUpdates = r.TaskUpdates[1:] },
		"omitted buffer start":      func(s *Scenario, r *TorqueReference) { r.RecordedStarts = r.RecordedStarts[1:] },
		"duplicate start":           func(s *Scenario, r *TorqueReference) { r.RecordedStarts[1] = r.RecordedStarts[0] },
		"duplicate update":          func(s *Scenario, r *TorqueReference) { r.TaskUpdates[1] = r.TaskUpdates[0] },
		"update reference":          func(s *Scenario, r *TorqueReference) { r.TaskUpdates[0].TaskID = "TASK-MISSING" },
		"update status":             func(s *Scenario, r *TorqueReference) { r.TaskUpdates[0].Status = "failed" },
		"future update":             func(s *Scenario, r *TorqueReference) { r.TaskUpdates[0].Time = "2026-10-04T14:30:01Z" },
		"inverted coverage":         func(s *Scenario, r *TorqueReference) { r.Pulse.From = "2026-10-04T14:30:01Z" },
		"offset timestamp":          func(s *Scenario, r *TorqueReference) { r.Pulse.From = "2026-10-03T14:30:00+00:00" },
		"nonzero offset":            func(s *Scenario, r *TorqueReference) { r.Pulse.From = "2026-10-03T15:30:00+01:00" },
		"missing task state graph": func(s *Scenario, r *TorqueReference) {
			events := []Event{}
			for _, e := range s.Events {
				if !(e.TaskID == "TASK-009" && len(e.Type) > 5 && e.Type[:5] == "task.") {
					events = append(events, e)
				}
			}
			s.Events = events
			updates := []TorqueTaskUpdate{}
			for _, u := range r.TaskUpdates {
				if u.TaskID != "TASK-009" {
					updates = append(updates, u)
				}
			}
			r.TaskUpdates = updates
		},
		"snapshot state": func(s *Scenario, r *TorqueReference) { s.Tasks[8].Narrative = "Stale task state" },
		"unordered update": func(s *Scenario, r *TorqueReference) {
			r.TaskUpdates[0], r.TaskUpdates[1] = r.TaskUpdates[1], r.TaskUpdates[0]
		},
	}
	for name, mutate := range cases {
		t.Run(name, func(t *testing.T) {
			s, r := GenerateTorque()
			mutate(&s, &r)
			if ValidateTorque(s, r) == nil {
				t.Fatal("invalid reference accepted")
			}
		})
	}
}
