// Package scenarios composes deterministic, linked operations presentation fixtures.
package scenarios

import (
	"encoding/json"
	"fmt"
	"github.com/brianvoe/gofakeit/v7"
	"os"
	"time"
)

type Task struct {
	ID        string  `json:"id"`
	RunID     string  `json:"runId"`
	SessionID string  `json:"sessionId"`
	TraceID   string  `json:"traceId"`
	UsageID   string  `json:"usageId"`
	Title     string  `json:"title"`
	Owner     string  `json:"owner"`
	Status    string  `json:"status"`
	Tokens    int     `json:"tokens"`
	Cost      float64 `json:"cost"`
	Started   string  `json:"started"`
	Narrative string  `json:"narrative"`
}
type Run struct {
	ID        string  `json:"id"`
	TaskID    string  `json:"taskId"`
	SessionID string  `json:"sessionId"`
	TraceID   string  `json:"traceId"`
	UsageID   string  `json:"usageId"`
	Status    string  `json:"status"`
	Started   string  `json:"started"`
	Finished  *string `json:"finished"`
	Outcome   string  `json:"outcome"`
}
type Session struct {
	ID    string `json:"id"`
	RunID string `json:"runId"`
	Owner string `json:"owner"`
}
type Message struct {
	ID        string `json:"id"`
	SessionID string `json:"sessionId"`
	RunID     string `json:"runId"`
	Role      string `json:"role"`
	Content   string `json:"content"`
	Time      string `json:"time"`
}
type ToolCall struct {
	ID       string `json:"id"`
	RunID    string `json:"runId"`
	TraceID  string `json:"traceId"`
	SpanID   string `json:"spanId"`
	Name     string `json:"name"`
	Status   string `json:"status"`
	Started  string `json:"started"`
	Finished string `json:"finished"`
	Input    string `json:"input"`
	Output   string `json:"output"`
}
type Log struct {
	ID      string `json:"id"`
	RunID   string `json:"runId"`
	TraceID string `json:"traceId"`
	SpanID  string `json:"spanId"`
	Level   string `json:"level"`
	Message string `json:"message"`
	Time    string `json:"time"`
}
type Span struct {
	ID       string  `json:"id"`
	TraceID  string  `json:"traceId"`
	ParentID *string `json:"parentId"`
	Name     string  `json:"name"`
	Status   string  `json:"status"`
	Started  string  `json:"started"`
	Finished *string `json:"finished"`
}
type Trace struct {
	ID      string   `json:"id"`
	RunID   string   `json:"runId"`
	Started string   `json:"started"`
	SpanIDs []string `json:"spanIds"`
}
type Event struct {
	ID          string `json:"id"`
	TaskID      string `json:"taskId"`
	RunID       string `json:"runId"`
	Type        string `json:"type"`
	Time        string `json:"time"`
	Description string `json:"description"`
}
type Usage struct {
	ID           string  `json:"id"`
	RunID        string  `json:"runId"`
	Tokens       int     `json:"tokens"`
	InputTokens  int     `json:"inputTokens"`
	OutputTokens int     `json:"outputTokens"`
	Cost         float64 `json:"cost"`
	Time         string  `json:"time"`
}
type Scenario struct {
	Version       string     `json:"version"`
	Generator     string     `json:"generator"`
	Profile       string     `json:"profile"`
	Seed          uint64     `json:"seed"`
	ObservedSince string     `json:"observedSince"`
	Clock         string     `json:"clock"`
	Tasks         []Task     `json:"tasks"`
	Runs          []Run      `json:"runs"`
	Sessions      []Session  `json:"sessions"`
	Messages      []Message  `json:"messages"`
	ToolCalls     []ToolCall `json:"toolCalls"`
	Logs          []Log      `json:"logs"`
	Traces        []Trace    `json:"traces"`
	Spans         []Span     `json:"spans"`
	Events        []Event    `json:"events"`
	Usage         []Usage    `json:"usage"`
}

func Generate() Scenario { return GenerateProfile(8) }
func GenerateProfile(count int) Scenario {
	if count < 1 || count > 1000 {
		panic("fixture count outside 1..1000")
	}
	f := gofakeit.New(4421)
	clock := time.Date(2026, 10, 4, 14, 30, 0, 0, time.UTC)
	coverage := clock.Add(-24 * time.Hour)
	if count > 8 {
		coverage = clock.Add(-14 * 24 * time.Hour)
	}
	s := Scenario{ObservedSince: coverage.Format(time.RFC3339), Version: "operations/v2", Generator: "parallax/v2", Profile: fmt.Sprintf("records-%d", count), Seed: 4421, Clock: clock.Format(time.RFC3339)}
	titles := []string{"Review gateway permission boundaries", "Build deterministic fixture contracts", "Inspect telemetry sampling drift", "Validate plugin bundle admission", "Reconcile deployment readiness", "Document account role provenance", "Audit workflow retry thresholds", "Capture responsive dashboard evidence"}
	taskStates := []string{"running", "done", "blocked", "done", "queued", "running", "failed", "done"}
	runStates := []string{"running", "done", "failed", "done", "done", "running", "failed", "done"}
	for i := 0; i < count; i++ {
		id := func(prefix string) string { return fmt.Sprintf("%s-%03d", prefix, i+1) }
		start := clock.Add(-time.Duration(8-i+2) * 2 * time.Minute)
		if i >= 8 {
			start = clock.Add(-time.Duration(1+(i-8)%13)*24*time.Hour - time.Duration((i-8)/13)*2*time.Hour)
		}
		if start.Before(coverage) {
			coverage = start
			s.ObservedSince = coverage.Format(time.RFC3339)
		}
		at := func(seconds int) string { return start.Add(time.Duration(seconds) * time.Second).Format(time.RFC3339) }
		status := runStates[i%8]
		taskStatus := taskStates[i%8]
		if i >= 8 && status == "running" {
			status = "done"
			taskStatus = "done"
		}
		tokens := f.IntRange(1200, 14000)
		owner := f.FirstName()
		cost := float64(tokens) * 0.000002
		outcome := "Fixture review completed and evidence recorded."
		narrative := outcome
		toolStatus := "done"
		level := "info"
		if status == "running" {
			outcome = "Review remains active after the first fixture inspection."
			narrative = outcome
		}
		if status == "failed" {
			outcome = "Scripted fixture inspection refused: required evidence is unavailable."
			narrative = outcome
			toolStatus = "failed"
			level = "error"
		}
		if taskStatus == "blocked" {
			narrative = "Previous run failed; task is blocked awaiting missing telemetry evidence."
		}
		if taskStatus == "queued" {
			narrative = "Previous run completed; a follow-up readiness review is queued."
		}
		var finished *string
		if status != "running" {
			v := at(90)
			finished = &v
		}
		s.Tasks = append(s.Tasks, Task{ID: id("TASK"), RunID: id("RUN"), SessionID: id("SESSION"), TraceID: id("TRACE"), UsageID: id("USAGE"), Title: titles[i%8], Owner: owner, Status: taskStatus, Tokens: tokens, Cost: cost, Started: at(0), Narrative: narrative})
		s.Runs = append(s.Runs, Run{ID: id("RUN"), TaskID: id("TASK"), SessionID: id("SESSION"), TraceID: id("TRACE"), UsageID: id("USAGE"), Status: status, Started: at(0), Finished: finished, Outcome: outcome})
		s.Sessions = append(s.Sessions, Session{ID: id("SESSION"), RunID: id("RUN"), Owner: owner})
		s.Messages = append(s.Messages, Message{ID: id("MSG-REQUEST"), SessionID: id("SESSION"), RunID: id("RUN"), Role: "user", Content: "Review the bundled evidence for: " + titles[i%8], Time: at(0)}, Message{ID: id("MSG-RESULT"), SessionID: id("SESSION"), RunID: id("RUN"), Role: "assistant", Content: outcome, Time: at(90)})
		s.ToolCalls = append(s.ToolCalls, ToolCall{ID: id("TOOL"), RunID: id("RUN"), TraceID: id("TRACE"), SpanID: id("SPAN-TOOL"), Name: "fixture.inspect", Status: toolStatus, Started: at(15), Finished: at(75), Input: "Bundled evidence / " + id("TASK"), Output: outcome})
		toolEnd := at(75)
		root := id("SPAN-ROOT")
		s.Spans = append(s.Spans, Span{ID: root, TraceID: id("TRACE"), Name: "review.session", Status: status, Started: at(0), Finished: finished}, Span{ID: id("SPAN-TOOL"), TraceID: id("TRACE"), ParentID: &root, Name: "fixture.inspect", Status: toolStatus, Started: at(15), Finished: &toolEnd})
		s.Traces = append(s.Traces, Trace{ID: id("TRACE"), RunID: id("RUN"), Started: at(0), SpanIDs: []string{root, id("SPAN-TOOL")}})
		s.Logs = append(s.Logs, Log{ID: id("LOG-START"), RunID: id("RUN"), TraceID: id("TRACE"), SpanID: root, Level: "info", Message: "Bundled context admitted", Time: at(0)}, Log{ID: id("LOG-OUTCOME"), RunID: id("RUN"), TraceID: id("TRACE"), SpanID: id("SPAN-TOOL"), Level: level, Message: outcome, Time: at(75)})
		s.Events = append(s.Events, Event{ID: id("EVENT-START"), TaskID: id("TASK"), RunID: id("RUN"), Type: "run.started", Time: at(0), Description: "Fixture run admitted"}, Event{ID: id("EVENT-OBSERVED"), TaskID: id("TASK"), RunID: id("RUN"), Type: "task." + taskStatus, Time: at(95), Description: narrative})
		input := tokens * 3 / 4
		s.Usage = append(s.Usage, Usage{ID: id("USAGE"), RunID: id("RUN"), Tokens: tokens, InputTokens: input, OutputTokens: tokens - input, Cost: cost, Time: at(75)})
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
