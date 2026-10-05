package scenarios

import (
	"encoding/json"
	"os"
	"reflect"
	"testing"
)

func TestObservationGraphAndFreshness(t *testing.T) {
	s := GenerateObservations()
	if err := ValidateObservations(s); err != nil {
		t.Fatal(err)
	}
	if !reflect.DeepEqual(s, GenerateObservations()) {
		t.Fatal("nondeterministic")
	}
	b, err := os.ReadFile("../../frontend/src/fixtures/observations.json")
	if err != nil {
		t.Fatal(err)
	}
	var got Observations
	if err = json.Unmarshal(b, &got); err != nil {
		t.Fatal(err)
	}
	if !reflect.DeepEqual(s, got) {
		t.Fatal("observation artifact stale")
	}
	if *s.TokenSamples[0].Value != 0 || s.DurationSamples[0].Value != nil {
		t.Fatal("zero and absence differ")
	}
}
func TestObservationInvalidEvidence(t *testing.T) {
	for _, change := range []func(*Observations){func(s *Observations) { s.Resources[0].ObservedAt = "2027-01-01T00:00:00Z" }, func(s *Observations) { s.Resources[0].Source = "" }, func(s *Observations) { s.TokenSamples[1].At = s.TokenSamples[0].At }, func(s *Observations) { v := 1.; s.TokenSamples[1].Value = &v }, func(s *Observations) { s.Diagnostic.FailedRunIDs = []string{"RUN-001"} }, func(s *Observations) { s.Diagnostic.Fixture = false }, func(s *Observations) { s.Resources = s.Resources[:2] }, func(s *Observations) { s.To = "2026-10-06T14:30:00Z" }} {
		s := GenerateObservations()
		change(&s)
		if ValidateObservations(s) == nil {
			t.Fatal("accepted invalid evidence")
		}
	}
}
