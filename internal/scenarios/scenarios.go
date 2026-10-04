// Package scenarios composes deterministic presentation fixtures; no business effects.
package scenarios

import (
	"encoding/json"
	"fmt"
	"github.com/brianvoe/gofakeit/v7"
	"os"
	"time"
)

type Task struct {
	ID        string   `json:"id"`
	RunID     string   `json:"runId"`
	SessionID string   `json:"sessionId"`
	TraceID   string   `json:"traceId"`
	UsageID   string   `json:"usageId"`
	Title     string   `json:"title"`
	Owner     string   `json:"owner"`
	Status    string   `json:"status"`
	Tokens    int      `json:"tokens"`
	Cost      float64  `json:"cost"`
	Started   string   `json:"started"`
	Logs      []string `json:"logs"`
}
type Session struct {
	ID    string `json:"id"`
	RunID string `json:"runId"`
	Owner string `json:"owner"`
}
type Trace struct {
	ID      string   `json:"id"`
	RunID   string   `json:"runId"`
	Started string   `json:"started"`
	Spans   []string `json:"spans"`
}
type Usage struct {
	ID     string  `json:"id"`
	RunID  string  `json:"runId"`
	Tokens int     `json:"tokens"`
	Cost   float64 `json:"cost"`
}
type Scenario struct {
	Sessions  []Session `json:"sessions"`
	Traces    []Trace   `json:"traces"`
	Usage     []Usage   `json:"usage"`
	Version   string    `json:"version"`
	Generator string    `json:"generator"`
	Seed      uint64    `json:"seed"`
	Clock     string    `json:"clock"`
	Tasks     []Task    `json:"tasks"`
}

func Generate() Scenario { return GenerateProfile(8) }
func GenerateProfile(count int) Scenario {
	if count < 1 || count > 1000 {
		panic("fixture count outside 1..1000")
	}
	f := gofakeit.New(4421)
	s := Scenario{Version: "operations/v1", Generator: "parallax/v1", Seed: 4421, Clock: "2026-10-04T14:30:00Z", Tasks: []Task{}}
	titles := []string{"Review gateway permission boundaries", "Build deterministic fixture contracts", "Inspect telemetry sampling drift", "Validate plugin bundle admission", "Reconcile deployment readiness", "Document account role provenance", "Audit workflow retry thresholds", "Capture responsive dashboard evidence"}
	statuses := []string{"running", "done", "blocked", "done", "queued", "running", "failed", "done"}
	for i := 0; i < count; i++ {
		title := titles[i%len(titles)]
		tokens := f.IntRange(1200, 14000)
		s.Tasks = append(s.Tasks, Task{ID: fmt.Sprintf("TASK-%03d", i+1), RunID: fmt.Sprintf("RUN-%03d", i+1), SessionID: fmt.Sprintf("SESSION-%03d", i+1), TraceID: fmt.Sprintf("TRACE-%03d", i+1), UsageID: fmt.Sprintf("USAGE-%03d", i+1), Title: title, Owner: f.FirstName(), Status: statuses[i%len(statuses)], Tokens: tokens, Cost: float64(tokens) * 0.000002, Started: time.Date(2026, 10, 4, 14, 30, 0, 0, time.UTC).Add(-time.Duration(count-i+2) * 2 * time.Minute).Format(time.RFC3339), Logs: []string{"Fixture context admitted", "Reviewing controlled presentation input", "Scripted outcome: " + statuses[i%len(statuses)]}})
	}
	for _, t := range s.Tasks {
		s.Sessions = append(s.Sessions, Session{ID: t.SessionID, RunID: t.RunID, Owner: t.Owner})
		s.Traces = append(s.Traces, Trace{ID: t.TraceID, RunID: t.RunID, Started: t.Started, Spans: []string{"context.admit", "fixture.review", "outcome." + t.Status}})
		s.Usage = append(s.Usage, Usage{ID: t.UsageID, RunID: t.RunID, Tokens: t.Tokens, Cost: t.Cost})
	}
	return s
}
func Write(path string) error { return WriteProfile(path, 8) }
func WriteProfile(path string, count int) error {
	b, err := json.MarshalIndent(GenerateProfile(count), "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(path, append(b, '\n'), 0644)
}
