package scenarios

import (
	"fmt"
	"math"
	"time"
)

// Validate checks references and chronology across the actual operations graph.
func Validate(s Scenario) error {
	clock, err := time.Parse(time.RFC3339, s.Clock)
	if err != nil {
		return err
	}
	since, err := time.Parse(time.RFC3339, s.ObservedSince)
	if err != nil {
		return err
	}
	if s.Seed == 0 || s.Version == "" || s.Generator == "" || s.Profile == "" {
		return fmt.Errorf("missing scenario identity")
	}
	stamp := func(value string) (time.Time, error) {
		t, e := time.Parse(time.RFC3339, value)
		if e != nil || t.After(clock) || t.Before(since) {
			return t, fmt.Errorf("timestamp outside observed window: %s", value)
		}
		return t, nil
	}
	tasks := map[string]Task{}
	runs := map[string]Run{}
	sessions := map[string]Session{}
	traces := map[string]Trace{}
	spans := map[string]Span{}
	usage := map[string]Usage{}
	ids := map[string]bool{}
	unique := func(id string) bool {
		if id == "" || ids[id] {
			return false
		}
		ids[id] = true
		return true
	}
	for _, t := range s.Tasks {
		if !unique(t.ID) {
			return fmt.Errorf("duplicate task")
		}
		tasks[t.ID] = t
	}
	for _, r := range s.Runs {
		if !unique(r.ID) {
			return fmt.Errorf("duplicate run")
		}
		runs[r.ID] = r
	}
	for _, v := range s.Sessions {
		if !unique(v.ID) {
			return fmt.Errorf("duplicate session")
		}
		sessions[v.ID] = v
	}
	for _, v := range s.Traces {
		if !unique(v.ID) {
			return fmt.Errorf("duplicate trace")
		}
		traces[v.ID] = v
	}
	for _, v := range s.Spans {
		if !unique(v.ID) {
			return fmt.Errorf("duplicate span")
		}
		spans[v.ID] = v
	}
	for _, v := range s.Usage {
		if !unique(v.ID) {
			return fmt.Errorf("duplicate usage")
		}
		usage[v.ID] = v
	}
	for _, t := range s.Tasks {
		r, ok := runs[t.RunID]
		if !ok || r.TaskID != t.ID || r.SessionID != t.SessionID || r.TraceID != t.TraceID || r.UsageID != t.UsageID {
			return fmt.Errorf("task/run joins disagree %s", t.ID)
		}
		u := usage[t.UsageID]
		if u.RunID != r.ID || u.Tokens != t.Tokens || math.Abs(u.Cost-t.Cost) > 1e-9 || u.InputTokens+u.OutputTokens != u.Tokens {
			return fmt.Errorf("usage mismatch %s", t.ID)
		}
		if t.Status == "queued" && r.Status != "done" || t.Status == "blocked" && r.Status != "failed" {
			return fmt.Errorf("invalid authored task/run narrative")
		}
	}
	for _, r := range s.Runs {
		start, e := stamp(r.Started)
		if e != nil {
			return e
		}
		if sessions[r.SessionID].RunID != r.ID || traces[r.TraceID].RunID != r.ID {
			return fmt.Errorf("missing run relationship")
		}
		if (r.Status == "running") != (r.Finished == nil) {
			return fmt.Errorf("run completion state mismatch")
		}
		if r.Finished != nil {
			end, e := stamp(*r.Finished)
			if e != nil || end.Before(start) {
				return fmt.Errorf("invalid run interval")
			}
		}
	}
	for _, t := range s.Traces {
		if _, err := stamp(t.Started); err != nil || runs[t.RunID].Started != t.Started {
			return fmt.Errorf("trace start mismatch")
		}
		for _, id := range t.SpanIDs {
			if spans[id].TraceID != t.ID {
				return fmt.Errorf("trace span missing")
			}
		}
	}
	for _, sp := range s.Spans {
		start, e := stamp(sp.Started)
		if e != nil {
			return e
		}
		run := runs[traces[sp.TraceID].RunID]
		runStart, _ := time.Parse(time.RFC3339, run.Started)
		if run.ID == "" || start.Before(runStart) {
			return fmt.Errorf("span precedes run")
		}
		if sp.Finished != nil {
			end, e := stamp(*sp.Finished)
			if e != nil || end.Before(start) {
				return fmt.Errorf("span interval invalid")
			}
			if run.Finished != nil {
				runEnd, _ := time.Parse(time.RFC3339, *run.Finished)
				if end.After(runEnd) {
					return fmt.Errorf("span exceeds run")
				}
			}
		}
		if sp.ParentID != nil {
			parent, ok := spans[*sp.ParentID]
			if !ok || parent.TraceID != sp.TraceID {
				return fmt.Errorf("span parent invalid")
			}
			parentStart, _ := time.Parse(time.RFC3339, parent.Started)
			if sp.Finished != nil && parent.Finished != nil {
				childEnd, _ := time.Parse(time.RFC3339, *sp.Finished)
				parentEnd, _ := time.Parse(time.RFC3339, *parent.Finished)
				if childEnd.After(parentEnd) {
					return fmt.Errorf("child span exceeds parent")
				}
			}
			if start.Before(parentStart) {
				return fmt.Errorf("child span precedes parent")
			}
		}
	}
	for _, t := range s.ToolCalls {
		if !unique(t.ID) || runs[t.RunID].TraceID != t.TraceID || spans[t.SpanID].TraceID != t.TraceID {
			return fmt.Errorf("tool references invalid")
		}
		sp := spans[t.SpanID]
		if sp.Started != t.Started || sp.Finished == nil || *sp.Finished != t.Finished || sp.Status != t.Status {
			return fmt.Errorf("tool/span timeline mismatch")
		}
	}
	for _, m := range s.Messages {
		if !unique(m.ID) || sessions[m.SessionID].RunID != m.RunID {
			return fmt.Errorf("message reference invalid")
		}
		when, e := stamp(m.Time)
		start, _ := time.Parse(time.RFC3339, runs[m.RunID].Started)
		if e != nil || when.Before(start) {
			return fmt.Errorf("message timestamp invalid")
		}
	}
	for _, l := range s.Logs {
		sp := spans[l.SpanID]
		if !unique(l.ID) || runs[l.RunID].TraceID != l.TraceID || sp.TraceID != l.TraceID {
			return fmt.Errorf("log references invalid")
		}
		when, e := stamp(l.Time)
		start, _ := time.Parse(time.RFC3339, sp.Started)
		if e != nil || when.Before(start) {
			return fmt.Errorf("log timestamp invalid")
		}
		if sp.Finished != nil {
			end, _ := time.Parse(time.RFC3339, *sp.Finished)
			if when.After(end) {
				return fmt.Errorf("log exceeds span")
			}
		}
	}
	for _, e := range s.Events {
		if !unique(e.ID) || runs[e.RunID].TaskID != e.TaskID {
			return fmt.Errorf("event reference invalid")
		}
		when, err := stamp(e.Time)
		start, _ := time.Parse(time.RFC3339, runs[e.RunID].Started)
		if err != nil || when.Before(start) {
			return fmt.Errorf("event time invalid")
		}
	}
	for _, u := range s.Usage {
		when, e := stamp(u.Time)
		start, _ := time.Parse(time.RFC3339, runs[u.RunID].Started)
		if e != nil || when.Before(start) || u.InputTokens < 0 || u.OutputTokens < 0 || u.Cost < 0 {
			return fmt.Errorf("usage invalid")
		}
	}
	return nil
}
