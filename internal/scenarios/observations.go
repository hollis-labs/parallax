package scenarios

import (
	"encoding/json"
	"fmt"
	"math"
	"os"
	"sort"
	"time"
)

type ObservationEvidence struct {
	ID           string `json:"id"`
	Label        string `json:"label"`
	ObservedAt   string `json:"observedAt"`
	StaleAfterMS int    `json:"staleAfterMs"`
	Source       string `json:"source"`
}
type ObservationPoint struct {
	At    string   `json:"at"`
	Value *float64 `json:"value"`
}
type ObservationDiagnostic struct {
	Fixture           bool     `json:"fixture"`
	OperationsVersion string   `json:"operationsVersion"`
	FailedRunIDs      []string `json:"failedRunIds"`
}
type Observations struct {
	Version           string                `json:"version"`
	Generator         string                `json:"generator"`
	OperationsVersion string                `json:"operationsVersion"`
	Seed              uint64                `json:"seed"`
	Clock             string                `json:"clock"`
	From              string                `json:"from"`
	To                string                `json:"to"`
	Resources         []ObservationEvidence `json:"resources"`
	TokenSamples      []ObservationPoint    `json:"tokenSamples"`
	DurationSamples   []ObservationPoint    `json:"durationSamples"`
	Diagnostic        ObservationDiagnostic `json:"diagnostic"`
}

func point(at string, v float64) ObservationPoint { return ObservationPoint{at, &v} }
func GenerateObservations() Observations {
	ops := Generate()
	clock, _ := time.Parse(time.RFC3339, ops.Clock)
	from := ops.Runs[0].Started
	s := Observations{Version: "observations/v1", Generator: "parallax/v5", OperationsVersion: ops.Version, Seed: ops.Seed, Clock: ops.Clock, From: from, To: ops.Clock, Diagnostic: ObservationDiagnostic{Fixture: true, OperationsVersion: ops.Version, FailedRunIDs: []string{}}}
	for i, id := range []string{"health", "stats", "token-series", "duration-series", "diagnostics"} {
		s.Resources = append(s.Resources, ObservationEvidence{id, "Fixture " + id, clock.Add(-time.Duration(60-i*10) * time.Second).Format(time.RFC3339), 120000, "Authored bundled fixture receipt; no live telemetry collector"})
	}
	usage := append([]Usage{}, ops.Usage...)
	sort.Slice(usage, func(i, j int) bool { return usage[i].Time < usage[j].Time })
	s.TokenSamples = []ObservationPoint{point(from, 0)}
	tokens := 0
	for _, u := range usage {
		tokens += u.Tokens
		s.TokenSamples = append(s.TokenSamples, point(u.Time, float64(tokens)))
	}
	for _, run := range ops.Runs {
		p := ObservationPoint{At: run.Started}
		if run.Finished != nil {
			start, _ := time.Parse(time.RFC3339, run.Started)
			end, _ := time.Parse(time.RFC3339, *run.Finished)
			v := end.Sub(start).Seconds()
			p.Value = &v
		}
		s.DurationSamples = append(s.DurationSamples, p)
		if run.Status == "failed" {
			s.Diagnostic.FailedRunIDs = append(s.Diagnostic.FailedRunIDs, run.ID)
		}
	}
	return s
}
func ValidateObservations(s Observations) error {
	ops := Generate()
	if s.Version != "observations/v1" || s.Generator != "parallax/v5" || s.OperationsVersion != ops.Version || s.Clock != ops.Clock || s.Seed != ops.Seed {
		return fmt.Errorf("observation identity mismatch")
	}
	from, e := time.Parse(time.RFC3339, s.From)
	if e != nil {
		return e
	}
	to, e := time.Parse(time.RFC3339, s.To)
	if e != nil || to.Before(from) || to.Sub(from) > 24*time.Hour {
		return fmt.Errorf("invalid observation window")
	}
	keys := map[string]bool{}
	for _, r := range s.Resources {
		at, e := time.Parse(time.RFC3339, r.ObservedAt)
		if e != nil || at.After(to) || at.Before(from) || r.StaleAfterMS <= 0 || r.Source == "" || r.ID == "" || keys[r.ID] {
			return fmt.Errorf("invalid resource evidence")
		}
		keys[r.ID] = true
	}
	if len(keys) != 5 || !keys["health"] || !keys["stats"] || !keys["token-series"] || !keys["duration-series"] || !keys["diagnostics"] {
		return fmt.Errorf("missing resource")
	}
	for _, points := range [][]ObservationPoint{s.TokenSamples, s.DurationSamples} {
		if len(points) > 16 {
			return fmt.Errorf("too many points")
		}
		previous := time.Time{}
		for _, p := range points {
			at, e := time.Parse(time.RFC3339, p.At)
			if e != nil || at.Before(from) || at.After(to) || !at.After(previous) {
				return fmt.Errorf("invalid ordered sample")
			}
			previous = at
			if p.Value != nil && (math.IsNaN(*p.Value) || math.IsInf(*p.Value, 0) || *p.Value < 0) {
				return fmt.Errorf("invalid sample value")
			}
		}
	}
	runs := map[string]bool{}
	for _, run := range ops.Runs {
		if run.Status == "failed" {
			runs[run.ID] = true
		}
	}
	if !s.Diagnostic.Fixture || s.Diagnostic.OperationsVersion != ops.Version || len(s.Diagnostic.FailedRunIDs) > 8 {
		return fmt.Errorf("invalid bounded diagnostic")
	}
	seen := map[string]bool{}
	for _, id := range s.Diagnostic.FailedRunIDs {
		if !runs[id] || seen[id] {
			return fmt.Errorf("invalid diagnostic run")
		}
		seen[id] = true
	}
	if len(seen) != len(runs) {
		return fmt.Errorf("incomplete diagnostic")
	}
	expected := GenerateObservations()
	a, _ := json.Marshal(s.TokenSamples)
	b, _ := json.Marshal(expected.TokenSamples)
	c, _ := json.Marshal(s.DurationSamples)
	d, _ := json.Marshal(expected.DurationSamples)
	if string(a) != string(b) || string(c) != string(d) {
		return fmt.Errorf("samples disagree with run usage records")
	}
	return nil
}
func WriteObservations(path string) error {
	s := GenerateObservations()
	if e := ValidateObservations(s); e != nil {
		return e
	}
	b, e := json.MarshalIndent(s, "", "  ")
	if e != nil {
		return e
	}
	return os.WriteFile(path, append(b, '\n'), 0644)
}
