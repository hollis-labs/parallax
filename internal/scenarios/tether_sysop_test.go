package scenarios

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"
)

func TestGenerateTetherSysop_Deterministic(t *testing.T) {
	f1 := GenerateTetherSysop()
	f2 := GenerateTetherSysop()

	b1, err := json.Marshal(f1)
	if err != nil {
		t.Fatalf("marshal f1: %v", err)
	}
	b2, err := json.Marshal(f2)
	if err != nil {
		t.Fatalf("marshal f2: %v", err)
	}

	if string(b1) != string(b2) {
		t.Fatalf("generation is not deterministic across repeated calls")
	}
}

func TestValidateTetherSysop_Valid(t *testing.T) {
	fixture := GenerateTetherSysop()
	if err := ValidateTetherSysop(fixture); err != nil {
		t.Fatalf("ValidateTetherSysop failed: %v", err)
	}
}

func TestValidateTetherSysop_Variants(t *testing.T) {
	fixture := GenerateTetherSysop()

	// Check blocked-health variant
	blocked, ok := fixture.OverviewVariants["blocked-health"]
	if !ok {
		t.Fatalf("expected blocked-health variant in OverviewVariants")
	}
	if blocked.Health.Status != "blocked" {
		t.Errorf("blocked-health variant status = %q, expected 'blocked'", blocked.Health.Status)
	}
	if blocked.Health.Error == "" {
		t.Errorf("blocked-health variant should have non-empty error")
	}

	// Check degraded-reliability variant
	degraded, ok := fixture.OverviewVariants["degraded-reliability"]
	if !ok {
		t.Fatalf("expected degraded-reliability variant in OverviewVariants")
	}
	if degraded.ToolCalls.SuccessPct >= 95 {
		t.Errorf("degraded-reliability success_pct = %d%%, expected < 95%%", degraded.ToolCalls.SuccessPct)
	}
	if degraded.Messages.Unread <= 0 {
		t.Errorf("degraded-reliability unread messages = %d, expected > 0", degraded.Messages.Unread)
	}
	if degraded.ToolCalls.SlowCalls <= 0 {
		t.Errorf("degraded-reliability slow calls = %d, expected > 0", degraded.ToolCalls.SlowCalls)
	}
}

func TestValidateTetherSysop_ActivityBoundsAndIntegrity(t *testing.T) {
	fixture := GenerateTetherSysop()

	events := fixture.Activity.Events.Events
	if len(events) < 50 || len(events) > 100 {
		t.Errorf("events count %d outside 50-100", len(events))
	}

	// Verify monotonic seq
	for i := 1; i < len(events); i++ {
		if events[i].Seq <= events[i-1].Seq {
			t.Errorf("event seq not strictly monotonic: %d <= %d", events[i].Seq, events[i-1].Seq)
		}
	}

	// Verify tool calls count ~30 and error/slow presence
	toolCalls := fixture.Activity.ToolCalls.ToolCalls
	if len(toolCalls) < 25 || len(toolCalls) > 35 {
		t.Errorf("tool calls count %d outside expected ~30", len(toolCalls))
	}

	hasError := false
	hasSlow := false
	for _, tc := range toolCalls {
		if !tc.OK {
			hasError = true
		}
		if tc.DurationMs >= 1000 {
			hasSlow = true
		}
	}
	if !hasError {
		t.Errorf("tool calls should include error cases")
	}
	if !hasSlow {
		t.Errorf("tool calls should include slow calls (>=1000ms)")
	}
}

func TestValidateTetherSysop_AIBoundsAndIntegrity(t *testing.T) {
	fixture := GenerateTetherSysop()

	// 3-4 providers incl disabled
	providers := fixture.AI.Settings.Config.Providers
	if len(providers) < 3 || len(providers) > 4 {
		t.Errorf("ai providers count %d outside 3-4", len(providers))
	}
	hasDisabled := false
	for _, p := range providers {
		if !p.Enabled {
			hasDisabled = true
		}
	}
	if !hasDisabled {
		t.Errorf("ai providers should include at least one disabled provider")
	}

	// >=5 routes
	routes := fixture.AI.Settings.Config.Routes
	if len(routes) < 5 {
		t.Errorf("ai routes count %d < 5", len(routes))
	}

	// >=20 audit events incl refusal
	auditEvents := fixture.AI.Audit.Events
	if len(auditEvents) < 20 {
		t.Errorf("ai audit events count %d < 20", len(auditEvents))
	}
	hasRefusal := false
	for _, ae := range auditEvents {
		if ae.Refusal != "" {
			hasRefusal = true
		}
	}
	if !hasRefusal {
		t.Errorf("ai audit events should include at least one refusal")
	}

	// >=3 budgets incl exhausted
	budgets := fixture.AI.Budgets.Budgets
	if len(budgets) < 3 {
		t.Errorf("ai budgets count %d < 3", len(budgets))
	}
	hasExhausted := false
	for _, b := range budgets {
		if b.Exhausted {
			hasExhausted = true
		}
	}
	if !hasExhausted {
		t.Errorf("ai budgets should include at least one exhausted budget")
	}
}

func TestValidateTetherSysop_RegistryBounds(t *testing.T) {
	fixture := GenerateTetherSysop()

	rows := fixture.Registry.Rows
	agents := 0
	projects := 0
	hasDeprecated := false

	for _, r := range rows {
		if r.Kind == "agent" {
			agents++
		} else if r.Kind == "project" {
			projects++
		}
		if r.Status == "deprecated" {
			hasDeprecated = true
		}
	}

	if agents != 8 {
		t.Errorf("expected 8 registry agents, got %d", agents)
	}
	if projects != 4 {
		t.Errorf("expected 4 registry projects, got %d", projects)
	}
	if !hasDeprecated {
		t.Errorf("registry profiles should include deprecated rows")
	}
}

func TestWriteTetherSysop(t *testing.T) {
	tmpDir := t.TempDir()
	path := filepath.Join(tmpDir, "tether-sysop.json")

	if err := WriteTetherSysop(path); err != nil {
		t.Fatalf("WriteTetherSysop failed: %v", err)
	}

	data, err := os.ReadFile(path)
	if err != nil {
		t.Fatalf("read written fixture: %v", err)
	}

	var parsed TetherSysopFixture
	if err := json.Unmarshal(data, &parsed); err != nil {
		t.Fatalf("unmarshal written fixture: %v", err)
	}

	if err := ValidateTetherSysop(parsed); err != nil {
		t.Fatalf("validate parsed fixture: %v", err)
	}
}
