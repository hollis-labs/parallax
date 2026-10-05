package scenarios

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"time"
)

type DeveloperFile struct {
	ID       string `json:"id"`
	Path     string `json:"path"`
	Language string `json:"language"`
	Before   string `json:"before"`
	After    string `json:"after"`
	RunID    string `json:"runId"`
	ToolID   string `json:"toolId"`
}
type DeveloperNode struct {
	ID     string `json:"id"`
	Label  string `json:"label"`
	Kind   string `json:"kind"`
	RunID  string `json:"runId"`
	SpanID string `json:"spanId"`
	ToolID string `json:"toolId"`
	X      int    `json:"x"`
	Y      int    `json:"y"`
}
type DeveloperEdge struct {
	ID     string `json:"id"`
	Source string `json:"source"`
	Target string `json:"target"`
	Label  string `json:"label"`
}
type Developer struct {
	Version           string          `json:"version"`
	Generator         string          `json:"generator"`
	OperationsVersion string          `json:"operationsVersion"`
	Seed              uint64          `json:"seed"`
	Clock             string          `json:"clock"`
	RecordedAt        string          `json:"recordedAt"`
	CommitHash        string          `json:"commitHash"`
	Files             []DeveloperFile `json:"files"`
	Nodes             []DeveloperNode `json:"nodes"`
	Edges             []DeveloperEdge `json:"edges"`
	Stack             string          `json:"stack"`
	Terminal          string          `json:"terminal"`
}

func GenerateDeveloper() Developer {
	ops := Generate()
	r := ops.Runs[2]
	tool := ops.ToolCalls[2]
	return Developer{Version: "developer/v1", Generator: "parallax/v6", OperationsVersion: ops.Version, Seed: ops.Seed, Clock: ops.Clock, RecordedAt: tool.Finished, CommitHash: "f17e4421aabbccddeeff00112233445566778899", Files: []DeveloperFile{
		{"FILE-001", "src/review.ts", "typescript", "export const mode = 'apply'\n", "export const mode = 'inspect'\n", r.ID, tool.ID},
		{"FILE-002", "fixtures/outcome.json", "json", "{\"fixture\": true, \"outcome\": \"pending\"}\n", "{\"fixture\": true, \"outcome\": \"refused\"}\n", r.ID, tool.ID},
		{"FILE-003", "README.md", "text", "# Review fixture\n", "# Review fixture\nNo command executes here.\n", r.ID, tool.ID}}, Nodes: []DeveloperNode{
		{"NODE-001", "Run review", "run", r.ID, ops.Traces[2].SpanIDs[0], "", 0, 100},
		{"NODE-002", "Inspect recorded tool", "tool", r.ID, tool.SpanID, tool.ID, 480, 100},
		{"NODE-003", "Review recorded result", "result", r.ID, "", "", 960, 100}}, Edges: []DeveloperEdge{{"EDGE-001", "NODE-001", "NODE-002", "Authored inspection order"}, {"EDGE-002", "NODE-002", "NODE-003", "Recorded outcome; no execution"}}, Stack: "FixtureRefusal: review requires explicit context\n    at review (src/review.ts:1:1)\n    at authoredFixture (fixtures/outcome.json:1:1)\n    unknown frame remains text", Terminal: "\x1b[36mRecorded fixture output\x1b[0m\nRUN-003 / TOOL-003\n\x1b[31mREFUSED: no business action was executed\x1b[0m\n<script>inert fixture text</script>\nhttps://example.invalid/not-a-link\n"}
}
func ValidateDeveloper(s Developer) error {
	ops := Generate()
	if s.Version != "developer/v1" || s.Generator != "parallax/v6" || s.OperationsVersion != ops.Version || s.Seed != ops.Seed || s.Clock != ops.Clock {
		return fmt.Errorf("developer identity mismatch")
	}
	at, e := time.Parse(time.RFC3339, s.RecordedAt)
	clock, _ := time.Parse(time.RFC3339, s.Clock)
	if e != nil || at.After(clock) {
		return fmt.Errorf("invalid evidence time")
	}
	if len(s.Files) != 3 || len(s.Nodes) != 3 || len(s.Edges) != 2 || len(s.Terminal) > 8192 || len(s.Stack) > 4096 || len(s.CommitHash) != 40 {
		return fmt.Errorf("invalid bounds")
	}
	files := map[string]bool{}
	paths := map[string]bool{}
	nodes := map[string]bool{}
	edges := map[string]bool{}
	for _, f := range s.Files {
		if f.ID == "" || files[f.ID] || paths[f.Path] || strings.HasPrefix(f.Path, "/") || strings.Contains(f.Path, "..") || f.Path == "" || len(f.After) > 8192 || len(f.Before) > 8192 || f.RunID != ops.Runs[2].ID || f.ToolID != ops.ToolCalls[2].ID {
			return fmt.Errorf("invalid file join/content")
		}
		files[f.ID] = true
		paths[f.Path] = true
	}
	for _, n := range s.Nodes {
		if n.ID == "" || nodes[n.ID] || n.RunID != ops.Runs[2].ID || n.X < 0 || n.X > 1600 || n.Y < 0 || n.Y > 1000 {
			return fmt.Errorf("invalid node")
		}
		if n.SpanID != "" && n.SpanID != ops.Traces[2].SpanIDs[0] && n.SpanID != ops.ToolCalls[2].SpanID {
			return fmt.Errorf("invalid span join")
		}
		if n.ToolID != "" && n.ToolID != ops.ToolCalls[2].ID {
			return fmt.Errorf("invalid tool join")
		}
		nodes[n.ID] = true
	}
	for _, edge := range s.Edges {
		if edge.ID == "" || edges[edge.ID] || !nodes[edge.Source] || !nodes[edge.Target] || edge.Source == edge.Target {
			return fmt.Errorf("invalid edge")
		}
		edges[edge.ID] = true
	}
	expected := GenerateDeveloper()
	if s.RecordedAt != expected.RecordedAt {
		return fmt.Errorf("evidence time differs from tool")
	}
	return nil
}
func WriteDeveloper(path string) error {
	s := GenerateDeveloper()
	if e := ValidateDeveloper(s); e != nil {
		return e
	}
	b, e := json.MarshalIndent(s, "", "  ")
	if e != nil {
		return e
	}
	return os.WriteFile(path, append(b, '\n'), 0644)
}
