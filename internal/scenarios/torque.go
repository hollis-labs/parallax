package scenarios

import (
	"encoding/json"
	"fmt"
	"math"
	"os"
	"sort"
	"time"
)

type CoverageWindow struct {
	From string `json:"from"`
	To   string `json:"to"`
}
type TorqueTaskUpdate struct {
	EventID string `json:"eventId"`
	TaskID  string `json:"taskId"`
	RunID   string `json:"runId"`
	Time    string `json:"time"`
	Status  string `json:"status"`
}
type TorqueReference struct {
	Version             string             `json:"version"`
	Generator           string             `json:"generator"`
	Profile             string             `json:"profile"`
	Seed                uint64             `json:"seed"`
	Clock               string             `json:"clock"`
	OperationsVersion   string             `json:"operationsVersion"`
	OperationsGenerator string             `json:"operationsGenerator"`
	Calendar            CoverageWindow     `json:"calendar"`
	Pulse               CoverageWindow     `json:"pulse"`
	Charts              CoverageWindow     `json:"charts"`
	StartBufferLimit    int                `json:"startBufferLimit"`
	RecentLimit         int                `json:"recentLimit"`
	TaskUpdates         []TorqueTaskUpdate `json:"taskUpdates"`
	RecordedStarts      []Event            `json:"recordedStarts"`
	Attribution         string             `json:"attribution"`
}

// This separate profile never changes the records-8/80 generators or their dependent joins.
func GenerateTorque() (Scenario, TorqueReference) {
	s := GenerateProfile(96)
	clock, _ := time.Parse(time.RFC3339, s.Clock)
	s.Generator = "parallax/v8"
	s.Profile = "torque-16w"
	s.ObservedSince = clock.AddDate(0, 0, -98).Truncate(24 * time.Hour).Format(time.RFC3339)
	offsets := map[string]time.Duration{}
	traceRun := map[string]string{}
	for i, r := range s.Runs {
		old, _ := time.Parse(time.RFC3339, r.Started)
		start := old
		if i >= 8 {
			start = clock.Add(-time.Duration(1+((i-8)*3)%90)*24*time.Hour - time.Duration((i-8)/30)*2*time.Hour)
		}
		offsets[r.ID] = start.Sub(old)
		traceRun[r.TraceID] = r.ID
	}
	shift := func(value, runID string) string {
		v, _ := time.Parse(time.RFC3339, value)
		return v.Add(offsets[runID]).Format(time.RFC3339)
	}
	for i := range s.Tasks {
		t := &s.Tasks[i]
		t.Started = shift(t.Started, t.RunID)
	}
	for i := range s.Runs {
		r := &s.Runs[i]
		r.Started = shift(r.Started, r.ID)
		if r.Finished != nil {
			v := shift(*r.Finished, r.ID)
			r.Finished = &v
		}
	}
	for i := range s.Messages {
		v := &s.Messages[i]
		v.Time = shift(v.Time, v.RunID)
	}
	for i := range s.ToolCalls {
		v := &s.ToolCalls[i]
		v.Started = shift(v.Started, v.RunID)
		v.Finished = shift(v.Finished, v.RunID)
	}
	for i := range s.Logs {
		v := &s.Logs[i]
		v.Time = shift(v.Time, v.RunID)
	}
	for i := range s.Traces {
		v := &s.Traces[i]
		v.Started = shift(v.Started, v.RunID)
	}
	for i := range s.Spans {
		v := &s.Spans[i]
		r := traceRun[v.TraceID]
		v.Started = shift(v.Started, r)
		if v.Finished != nil {
			e := shift(*v.Finished, r)
			v.Finished = &e
		}
	}
	for i := range s.Events {
		v := &s.Events[i]
		v.Time = shift(v.Time, v.RunID)
	}
	for i := range s.Usage {
		v := &s.Usage[i]
		v.Time = shift(v.Time, v.RunID)
	}
	// These additional supplied task-state receipts establish updated_at independently of run completion.
	for _, r := range s.Runs {
		start, _ := time.Parse(time.RFC3339, r.Started)
		s.Events = append(s.Events, Event{ID: "TASK-ADMITTED-" + r.ID, TaskID: r.TaskID, RunID: r.ID, Type: "task.running", Time: start.Add(5 * time.Second).Format(time.RFC3339), Description: "Recorded task review admitted"})
	}
	s.Events = append(s.Events, Event{ID: "TASK-REVIEW-009", TaskID: "TASK-009", RunID: "RUN-009", Type: "task.done", Time: clock.Add(-time.Hour).Format(time.RFC3339), Description: "Recorded follow-up evidence review; previous run remains completed"})
	ref := TorqueReference{Version: "torque-reference/v1", Generator: "parallax/v8", Profile: s.Profile, Seed: s.Seed, Clock: s.Clock, OperationsVersion: s.Version, OperationsGenerator: s.Generator, Calendar: CoverageWindow{From: s.ObservedSince, To: s.Clock}, Pulse: CoverageWindow{From: clock.Add(-24 * time.Hour).Format(time.RFC3339), To: s.Clock}, Charts: CoverageWindow{From: clock.AddDate(0, 0, -13).Truncate(24 * time.Hour).Format(time.RFC3339), To: s.Clock}, StartBufferLimit: 500, RecentLimit: 12, Attribution: "Unavailable: no provider/model attribution was recorded", TaskUpdates: []TorqueTaskUpdate{}, RecordedStarts: []Event{}}
	for _, e := range s.Events {
		if len(e.Type) > 5 && e.Type[:5] == "task." {
			ref.TaskUpdates = append(ref.TaskUpdates, TorqueTaskUpdate{EventID: e.ID, TaskID: e.TaskID, RunID: e.RunID, Time: e.Time, Status: e.Type[5:]})
		}
		if e.Type == "run.started" && e.Time >= ref.Pulse.From && e.Time <= ref.Pulse.To {
			ref.RecordedStarts = append(ref.RecordedStarts, e)
		}
	}
	sort.Slice(ref.TaskUpdates, func(i, j int) bool {
		a, b := ref.TaskUpdates[i], ref.TaskUpdates[j]
		if a.Time == b.Time {
			return a.EventID < b.EventID
		}
		return a.Time < b.Time
	})
	sort.Slice(ref.RecordedStarts, func(i, j int) bool {
		a, b := ref.RecordedStarts[i], ref.RecordedStarts[j]
		if a.Time == b.Time {
			return a.ID < b.ID
		}
		return a.Time < b.Time
	})
	latest := map[string]Event{}
	for _, e := range s.Events {
		if len(e.Type) > 5 && e.Type[:5] == "task." {
			old, ok := latest[e.TaskID]
			if !ok || e.Time > old.Time || e.Time == old.Time && e.ID > old.ID {
				latest[e.TaskID] = e
			}
		}
	}
	for i := range s.Tasks {
		e := latest[s.Tasks[i].ID]
		s.Tasks[i].Status = e.Type[5:]
		s.Tasks[i].Narrative = e.Description
	}
	return s, ref
}

func ValidateTorque(s Scenario, r TorqueReference) error {
	for _, u := range s.Usage {
		if math.IsNaN(u.Cost) || math.IsInf(u.Cost, 0) {
			return fmt.Errorf("invalid receipt amount")
		}
	}
	for _, t := range s.Tasks {
		if math.IsNaN(t.Cost) || math.IsInf(t.Cost, 0) {
			return fmt.Errorf("invalid task amount")
		}
	}
	if err := Validate(s); err != nil {
		return err
	}
	if len(s.Runs) != 96 || len(s.Tasks) != 96 || s.Seed != 4421 || s.Clock != "2026-10-04T14:30:00Z" || s.Version != "operations/v2" || s.Generator != "parallax/v8" || s.Profile != "torque-16w" || r.Version != "torque-reference/v1" || r.Generator != "parallax/v8" || r.OperationsVersion != s.Version || r.OperationsGenerator != s.Generator || r.Profile != s.Profile || r.Seed != s.Seed || r.Clock != s.Clock {
		return fmt.Errorf("unsupported Torque graph/sidecar identity")
	}
	if r.StartBufferLimit != 500 || r.RecentLimit != 12 || len(r.RecordedStarts) > r.StartBufferLimit {
		return fmt.Errorf("invalid recorded limits")
	}
	clock, _ := time.Parse(time.RFC3339, s.Clock)
	canonical := func(value string) bool {
		t, e := time.Parse(time.RFC3339, value)
		return e == nil && t.Format(time.RFC3339) == value && t.Location() == time.UTC
	}
	stamps := []string{s.ObservedSince}
	for _, t := range s.Tasks {
		stamps = append(stamps, t.Started)
	}
	for _, v := range s.Runs {
		stamps = append(stamps, v.Started)
		if v.Finished != nil {
			stamps = append(stamps, *v.Finished)
		}
	}
	for _, v := range s.Messages {
		stamps = append(stamps, v.Time)
	}
	for _, v := range s.ToolCalls {
		stamps = append(stamps, v.Started, v.Finished)
	}
	for _, v := range s.Logs {
		stamps = append(stamps, v.Time)
	}
	for _, v := range s.Traces {
		stamps = append(stamps, v.Started)
	}
	for _, v := range s.Spans {
		stamps = append(stamps, v.Started)
		if v.Finished != nil {
			stamps = append(stamps, *v.Finished)
		}
	}
	for _, v := range s.Events {
		stamps = append(stamps, v.Time)
	}
	for _, v := range s.Usage {
		stamps = append(stamps, v.Time)
	}
	for _, value := range stamps {
		if !canonical(value) {
			return fmt.Errorf("noncanonical Torque UTC timestamp")
		}
	}
	if r.Pulse.From != clock.Add(-24*time.Hour).Format(time.RFC3339) || r.Charts.From != clock.AddDate(0, 0, -13).Truncate(24*time.Hour).Format(time.RFC3339) {
		return fmt.Errorf("unsupported reference interval width")
	}
	if r.Calendar.From != s.ObservedSince || r.Calendar.To != s.Clock || r.Pulse.To != s.Clock || r.Charts.To != s.Clock {
		return fmt.Errorf("coverage disagrees with reference source")
	}
	for _, w := range []CoverageWindow{r.Calendar, r.Pulse, r.Charts} {
		a, ae := time.Parse(time.RFC3339, w.From)
		b, be := time.Parse(time.RFC3339, w.To)
		if ae != nil || be != nil || a.After(b) || b.After(clock) || w.From < s.ObservedSince || !canonical(w.From) || !canonical(w.To) {
			return fmt.Errorf("invalid declared coverage")
		}
	}
	tasks := map[string]Task{}
	for _, t := range s.Tasks {
		tasks[t.ID] = t
	}
	for _, run := range s.Runs {
		task, exists := tasks[run.TaskID]
		if !exists || task.RunID != run.ID {
			return fmt.Errorf("orphan Torque run")
		}
	}
	runStarts := map[string]string{}
	for _, run := range s.Runs {
		runStarts[run.ID] = run.Started
	}
	events := map[string]Event{}
	for _, e := range s.Events {
		events[e.ID] = e
	}
	expectedUpdates, expectedStarts := 0, 0
	for _, run := range s.Runs {
		if run.Started >= r.Pulse.From && run.Started <= r.Pulse.To {
			expectedStarts++
		}
	}
	for _, e := range s.Events {
		if len(e.Type) > 5 && e.Type[:5] == "task." {
			expectedUpdates++
		}
	}
	if expectedStarts > r.StartBufferLimit {
		return fmt.Errorf("unsupported start buffer overflow")
	}
	latest := map[string]Event{}
	for _, e := range s.Events {
		if len(e.Type) > 5 && e.Type[:5] == "task." {
			old, ok := latest[e.TaskID]
			if !ok || e.Time > old.Time || e.Time == old.Time && e.ID > old.ID {
				latest[e.TaskID] = e
			}
		}
	}
	for _, t := range s.Tasks {
		e, exists := latest[t.ID]
		if !exists || len(e.Type) <= 5 {
			return fmt.Errorf("missing latest task receipt")
		}
		if t.Started != runStarts[t.RunID] || t.Status != e.Type[5:] || t.Narrative != e.Description {
			return fmt.Errorf("task snapshot disagrees with latest receipt")
		}
	}
	if len(r.TaskUpdates) != expectedUpdates || len(r.RecordedStarts) != expectedStarts {
		return fmt.Errorf("incomplete supplied task updates/start buffer")
	}
	seen := map[string]bool{}
	previous := ""
	for _, u := range r.TaskUpdates {
		e, ok := events[u.EventID]
		if !ok || seen[u.EventID] || e.Type != "task."+u.Status || e.TaskID != u.TaskID || e.RunID != u.RunID || e.Time != u.Time || u.Time+"|"+u.EventID < previous {
			return fmt.Errorf("invalid task update receipt")
		}
		seen[u.EventID] = true
		previous = u.Time + "|" + u.EventID
	}
	seen = map[string]bool{}
	previous = ""
	for _, e := range r.RecordedStarts {
		actual, ok := events[e.ID]
		if !ok || actual != e || e.Type != "run.started" || e.Time != runStarts[e.RunID] || e.Time < r.Pulse.From || e.Time > r.Pulse.To || seen[e.RunID] || e.Time+"|"+e.ID < previous {
			return fmt.Errorf("invalid recorded start buffer")
		}
		seen[e.RunID] = true
		previous = e.Time + "|" + e.ID
	}
	if r.Attribution == "" {
		return fmt.Errorf("missing attribution policy")
	}
	return nil
}
func WriteTorque(graphPath, referencePath string) error {
	s, r := GenerateTorque()
	if err := ValidateTorque(s, r); err != nil {
		return err
	}
	for path, value := range map[string]any{graphPath: s, referencePath: r} {
		b, e := json.MarshalIndent(value, "", "  ")
		if e != nil {
			return e
		}
		if e = os.WriteFile(path, append(b, '\n'), 0644); e != nil {
			return e
		}
	}
	return nil
}
