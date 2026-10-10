package scenarios

import (
	"fmt"
	"strings"
	"time"
)

// ValidateTetherSysop verifies the structural integrity, referential consistency,
// sorted sequences/trends, derivable aggregates, and required boundary conditions
// of the tether-sysop/v1 fixture bundle.
func ValidateTetherSysop(f TetherSysopFixture) error {
	ops := Generate()

	// 1. Identity & Reference Clock
	if f.Version != "tether-sysop/v1" {
		return fmt.Errorf("version mismatch: expected tether-sysop/v1, got %q", f.Version)
	}
	if f.Generator != "parallax/v10" {
		return fmt.Errorf("generator mismatch: expected parallax/v10, got %q", f.Generator)
	}
	if f.OperationsVersion != ops.Version {
		return fmt.Errorf("operations version mismatch: expected %q, got %q", ops.Version, f.OperationsVersion)
	}
	if f.Seed != 4421 {
		return fmt.Errorf("seed mismatch: expected 4421, got %d", f.Seed)
	}
	if f.Clock != "2026-10-04T14:30:00Z" {
		return fmt.Errorf("clock mismatch: expected 2026-10-04T14:30:00Z, got %q", f.Clock)
	}

	clock, err := time.Parse(time.RFC3339, f.Clock)
	if err != nil {
		return fmt.Errorf("parse clock: %w", err)
	}

	observedSince, err := time.Parse(time.RFC3339, f.ObservedSince)
	if err != nil {
		return fmt.Errorf("parse observedSince: %w", err)
	}
	if observedSince.After(clock) {
		return fmt.Errorf("observedSince %v after clock %v", observedSince, clock)
	}

	// 2. Known Sessions Referential Set (from operations/v2)
	validSessions := map[string]bool{}
	for _, sess := range ops.Sessions {
		validSessions[sess.ID] = true
	}

	// 3. Overview Validation (Standard)
	if err := validateOverview(f.Overview, clock); err != nil {
		return fmt.Errorf("standard overview invalid: %w", err)
	}

	// 4. Overview Variants Validation
	if len(f.OverviewVariants) < 2 {
		return fmt.Errorf("expected at least 2 overview variants, got %d", len(f.OverviewVariants))
	}

	blockedVariant, ok := f.OverviewVariants["blocked-health"]
	if !ok {
		return fmt.Errorf("missing required overview variant 'blocked-health'")
	}
	if blockedVariant.Health.Status != "blocked" || blockedVariant.Health.Error == "" {
		return fmt.Errorf("blocked-health variant must have status 'blocked' and non-empty error")
	}

	degradedVariant, ok := f.OverviewVariants["degraded-reliability"]
	if !ok {
		return fmt.Errorf("missing required overview variant 'degraded-reliability'")
	}
	if degradedVariant.ToolCalls.SuccessPct >= 95 {
		return fmt.Errorf("degraded-reliability variant must have tool_calls.success_pct < 95%%, got %d%%", degradedVariant.ToolCalls.SuccessPct)
	}
	if degradedVariant.Messages.Unread <= 0 {
		return fmt.Errorf("degraded-reliability variant must have messages.unread > 0, got %d", degradedVariant.Messages.Unread)
	}

	for name, v := range f.OverviewVariants {
		if err := validateOverview(v, clock); err != nil {
			return fmt.Errorf("variant %q invalid: %w", name, err)
		}
	}

	// 5. Activity Events Validation
	events := f.Activity.Events.Events
	if len(events) < 50 || len(events) > 100 {
		return fmt.Errorf("activity events count out of range (50-100): got %d", len(events))
	}
	if f.Activity.Events.Total != len(events) {
		return fmt.Errorf("activity events total %d does not match length %d", f.Activity.Events.Total, len(events))
	}

	var lastSeq int64 = 0
	scopeEvents := map[string][]EventInfo{}
	for i, ev := range events {
		if ev.Seq <= lastSeq {
			return fmt.Errorf("event [%d] seq %d is not strictly monotonic ascending (previous %d)", i, ev.Seq, lastSeq)
		}
		lastSeq = ev.Seq

		evTime, err := time.Parse(time.RFC3339Nano, ev.At)
		if err != nil {
			return fmt.Errorf("event [%d] invalid timestamp %q: %w", i, ev.At, err)
		}
		if evTime.After(clock) {
			return fmt.Errorf("event [%d] timestamp %v exceeds clock %v", i, evTime, clock)
		}
		if ev.Scope == "" || ev.Kind == "" {
			return fmt.Errorf("event [%d] missing scope or kind", i)
		}
		if ev.SessionID != "" && !validSessions[ev.SessionID] {
			return fmt.Errorf("event [%d] references unknown session %q", i, ev.SessionID)
		}
		if ev.Payload == "" || !strings.HasPrefix(ev.Payload, "{") {
			return fmt.Errorf("event [%d] payload must be valid json string", i)
		}
		scopeEvents[ev.Scope] = append(scopeEvents[ev.Scope], ev)
	}

	// 6. Activity Scope Aggregates Validation
	if len(f.Activity.Scopes) != len(scopeEvents) {
		return fmt.Errorf("scope aggregates count %d does not match active scopes %d", len(f.Activity.Scopes), len(scopeEvents))
	}
	for _, agg := range f.Activity.Scopes {
		evs, ok := scopeEvents[agg.Scope]
		if !ok {
			return fmt.Errorf("scope aggregate references inactive scope %q", agg.Scope)
		}
		if agg.EventCount != len(evs) {
			return fmt.Errorf("scope %q event_count mismatch: aggregate has %d, actual is %d", agg.Scope, agg.EventCount, len(evs))
		}
		sessSet := map[string]struct{}{}
		kindMap := map[string]int{}
		var maxSeq int64
		for _, e := range evs {
			if e.SessionID != "" {
				sessSet[e.SessionID] = struct{}{}
			}
			kindMap[e.Kind]++
			if e.Seq > maxSeq {
				maxSeq = e.Seq
			}
		}
		if agg.SessionCount != len(sessSet) {
			return fmt.Errorf("scope %q session_count mismatch: aggregate has %d, actual is %d", agg.Scope, agg.SessionCount, len(sessSet))
		}
		if agg.KindCount != len(kindMap) {
			return fmt.Errorf("scope %q kind_count mismatch: aggregate has %d, actual is %d", agg.Scope, agg.KindCount, len(kindMap))
		}
		if agg.LatestSeq != maxSeq {
			return fmt.Errorf("scope %q latest_seq mismatch: aggregate has %d, actual is %d", agg.Scope, agg.LatestSeq, maxSeq)
		}
	}

	// 7. Activity Tool Calls Validation (~30 calls with duration spread and errors)
	toolCalls := f.Activity.ToolCalls.ToolCalls
	if len(toolCalls) < 25 || len(toolCalls) > 35 {
		return fmt.Errorf("tool calls count out of expected ~30 range: got %d", len(toolCalls))
	}
	if f.Activity.ToolCalls.Total != len(toolCalls) {
		return fmt.Errorf("tool calls total %d does not match length %d", f.Activity.ToolCalls.Total, len(toolCalls))
	}

	hasError := false
	hasSlowCall := false
	for i, tc := range toolCalls {
		if tc.ID <= 0 {
			return fmt.Errorf("tool call [%d] invalid ID %d", i, tc.ID)
		}
		if tc.SessionID != "" && !validSessions[tc.SessionID] {
			return fmt.Errorf("tool call [%d] references unknown session %q", i, tc.SessionID)
		}
		if tc.ToolName == "" {
			return fmt.Errorf("tool call [%d] missing tool_name", i)
		}
		if tc.DurationMs < 0 {
			return fmt.Errorf("tool call [%d] negative duration %d", i, tc.DurationMs)
		}
		if tc.DurationMs >= 1000 {
			hasSlowCall = true
		}
		if !tc.OK {
			hasError = true
			if tc.Error == "" {
				return fmt.Errorf("tool call [%d] marked not ok but missing error string", i)
			}
		}
		tcTime, err := time.Parse(time.RFC3339, tc.Timestamp)
		if err != nil {
			return fmt.Errorf("tool call [%d] invalid timestamp %q: %w", i, tc.Timestamp, err)
		}
		if tcTime.After(clock) {
			return fmt.Errorf("tool call [%d] timestamp %v exceeds clock %v", i, tcTime, clock)
		}
	}
	if !hasError {
		return fmt.Errorf("tool calls must include error cases for visual error state testing")
	}
	if !hasSlowCall {
		return fmt.Errorf("tool calls must include slow call cases (>=1000ms)")
	}

	// 8. AI Gateway Validation
	aiSettings := f.AI.Settings
	providers := aiSettings.Config.Providers
	if len(providers) < 3 || len(providers) > 4 {
		return fmt.Errorf("ai providers count must be 3-4, got %d", len(providers))
	}
	hasDisabledProvider := false
	providerMap := map[string]bool{}
	for _, p := range providers {
		if p.ID == "" || p.Type == "" {
			return fmt.Errorf("ai provider missing ID or Type")
		}
		if !p.Enabled {
			hasDisabledProvider = true
		}
		providerMap[p.ID] = true
	}
	if !hasDisabledProvider {
		return fmt.Errorf("ai providers must include at least one disabled provider")
	}

	routes := aiSettings.Config.Routes
	if len(routes) < 5 {
		return fmt.Errorf("ai routes count must be >= 5, got %d", len(routes))
	}
	for i, r := range routes {
		if !providerMap[r.Provider] {
			return fmt.Errorf("route [%d] references unregistered provider %q", i, r.Provider)
		}
		if r.Model == "" {
			return fmt.Errorf("route [%d] missing model", i)
		}
	}

	// AI Usage Derivable Totals
	usage := f.AI.Usage
	if usage.Summary.Requests != usage.Summary.Successes+usage.Summary.Errors {
		return fmt.Errorf("ai usage requests (%d) != successes (%d) + errors (%d)",
			usage.Summary.Requests, usage.Summary.Successes, usage.Summary.Errors)
	}
	var provReqSum int
	for _, bp := range usage.Summary.ByProvider {
		if !providerMap[bp.Key] {
			return fmt.Errorf("ai usage by_provider references unregistered provider %q", bp.Key)
		}
		provReqSum += bp.Requests
	}
	if provReqSum != usage.Summary.Requests {
		return fmt.Errorf("ai usage by_provider requests sum %d != total %d", provReqSum, usage.Summary.Requests)
	}

	var modReqSum int
	for _, bm := range usage.Summary.ByModel {
		modReqSum += bm.Requests
	}
	if modReqSum != usage.Summary.Requests {
		return fmt.Errorf("ai usage by_model requests sum %d != total %d", modReqSum, usage.Summary.Requests)
	}

	// AI Audit Events (>=20, includes refusal)
	auditEvents := f.AI.Audit.Events
	if len(auditEvents) < 20 {
		return fmt.Errorf("ai audit events count must be >= 20, got %d", len(auditEvents))
	}
	if f.AI.Audit.Count != len(auditEvents) {
		return fmt.Errorf("ai audit count %d != length %d", f.AI.Audit.Count, len(auditEvents))
	}
	hasRefusal := false
	for i, ae := range auditEvents {
		if ae.ID <= 0 || ae.Operation == "" {
			return fmt.Errorf("audit event [%d] invalid ID or operation", i)
		}
		if ae.SessionID != "" && !validSessions[ae.SessionID] {
			return fmt.Errorf("audit event [%d] references unknown session %q", i, ae.SessionID)
		}
		if ae.Refusal != "" {
			hasRefusal = true
		}
		aeTime, err := time.Parse(time.RFC3339, ae.Timestamp)
		if err != nil {
			return fmt.Errorf("audit event [%d] invalid timestamp %q: %w", i, ae.Timestamp, err)
		}
		if aeTime.After(clock) {
			return fmt.Errorf("audit event [%d] timestamp %v exceeds clock %v", i, aeTime, clock)
		}
	}
	if !hasRefusal {
		return fmt.Errorf("ai audit events must include at least one refusal event")
	}

	// AI Budgets (>=3, includes exhausted)
	budgets := f.AI.Budgets.Budgets
	if len(budgets) < 3 {
		return fmt.Errorf("ai budgets count must be >= 3, got %d", len(budgets))
	}
	hasExhausted := false
	for i, b := range budgets {
		if !providerMap[b.Provider] {
			return fmt.Errorf("budget [%d] references unregistered provider %q", i, b.Provider)
		}
		if b.Exhausted {
			hasExhausted = true
			if b.RemainingCostUSD != nil && *b.RemainingCostUSD > 0 {
				return fmt.Errorf("budget [%d] marked exhausted but remaining cost > 0", i)
			}
		}
	}
	if !hasExhausted {
		return fmt.Errorf("ai budgets must include at least one exhausted budget")
	}

	// AI Catalog Models
	if len(f.AI.Catalog) == 0 {
		return fmt.Errorf("ai catalog models list is empty")
	}
	for i, cat := range f.AI.Catalog {
		if cat.ProviderType == "" || len(cat.Models) == 0 {
			return fmt.Errorf("ai catalog entry [%d] missing provider_type or models", i)
		}
	}

	// 9. Registry Validation (~8 agents + 4 projects, mixed active/deprecated)
	rows := f.Registry.Rows
	agentCount := 0
	projectCount := 0
	hasDeprecated := false
	projectMap := map[string]bool{}

	// First collect projects
	for _, p := range rows {
		if p.Kind == "project" {
			projectCount++
			projectMap[p.DisplayName] = true
			projectMap[p.URN] = true
			if p.Status == "deprecated" {
				hasDeprecated = true
			}
		}
	}

	for i, p := range rows {
		if p.URN == "" || p.Kind == "" || p.DisplayName == "" {
			return fmt.Errorf("registry profile [%d] missing URN, Kind or DisplayName", i)
		}
		if p.Kind == "agent" {
			agentCount++
			if p.Project != "" && !projectMap[p.Project] {
				return fmt.Errorf("agent profile %q references unknown project %q", p.DisplayName, p.Project)
			}
			if p.Status == "deprecated" {
				hasDeprecated = true
			}
		}
		crTime, err := time.Parse(time.RFC3339, p.CreatedAt)
		if err != nil {
			return fmt.Errorf("registry profile [%d] invalid created_at %q: %w", i, p.CreatedAt, err)
		}
		if crTime.After(clock) {
			return fmt.Errorf("registry profile [%d] created_at %v exceeds clock %v", i, crTime, clock)
		}
	}

	if agentCount < 7 || agentCount > 10 {
		return fmt.Errorf("registry agent count out of expected ~8 range, got %d", agentCount)
	}
	if projectCount != 4 {
		return fmt.Errorf("registry project count must be 4, got %d", projectCount)
	}
	if !hasDeprecated {
		return fmt.Errorf("registry must contain mixed active and deprecated profiles")
	}

	return nil
}

func validateOverview(o OverviewInfo, clock time.Time) error {
	// Derivable totals in sessions
	if o.Sessions.Total != o.Sessions.Running+o.Sessions.Ended {
		return fmt.Errorf("sessions total %d != running %d + ended %d",
			o.Sessions.Total, o.Sessions.Running, o.Sessions.Ended)
	}
	if o.Sessions.SuccessPct+o.Sessions.FailurePct > 100 {
		return fmt.Errorf("sessions success_pct (%d) + failure_pct (%d) > 100",
			o.Sessions.SuccessPct, o.Sessions.FailurePct)
	}

	// Derivable totals in tool calls
	if o.ToolCalls.Total != o.ToolCalls.OK+o.ToolCalls.Errors {
		return fmt.Errorf("tool calls total %d != ok %d + errors %d",
			o.ToolCalls.Total, o.ToolCalls.OK, o.ToolCalls.Errors)
	}
	if o.ToolCalls.Total > 0 {
		expectedPct := (o.ToolCalls.OK * 100) / o.ToolCalls.Total
		if o.ToolCalls.SuccessPct != expectedPct {
			return fmt.Errorf("tool calls success_pct mismatch: expected %d%%, got %d%%",
				expectedPct, o.ToolCalls.SuccessPct)
		}
	}

	// Trend bucket bounds: 24 to 48 oldest-first buckets
	for name, trend := range map[string][]int{
		"sessions":   o.Sessions.Trend,
		"tool_calls": o.ToolCalls.Trend,
		"messages":   o.Messages.Trend,
		"events":     o.Events.Trend,
		"ai":         o.AI.Trend,
	} {
		if len(trend) < 24 || len(trend) > 48 {
			return fmt.Errorf("trend array for %q must have 24-48 buckets, got %d", name, len(trend))
		}
		for bIdx, val := range trend {
			if val < 0 {
				return fmt.Errorf("trend array %q bucket [%d] negative value %d", name, bIdx, val)
			}
		}
	}

	// NameCount distributions non-empty
	if len(o.Sessions.ByState) == 0 || len(o.Sessions.ByProvider) == 0 || len(o.Sessions.ByProject) == 0 {
		return fmt.Errorf("sessions name count lists must not be empty")
	}
	if len(o.ToolCalls.TopTools) == 0 || len(o.ToolCalls.Latency) == 0 {
		return fmt.Errorf("tool calls top_tools and latency lists must not be empty")
	}
	if len(o.Messages.ByKind) == 0 || len(o.Messages.ByScope) == 0 {
		return fmt.Errorf("messages by_kind and by_scope must not be empty")
	}
	if len(o.Events.ByScope) == 0 || len(o.Events.ByKind) == 0 {
		return fmt.Errorf("events by_scope and by_kind must not be empty")
	}
	if len(o.AI.ByProvider) == 0 || len(o.AI.ByModel) == 0 {
		return fmt.Errorf("ai by_provider and by_model must not be empty")
	}

	// Health check
	if o.Health.Status != "ok" && o.Health.Status != "blocked" && o.Health.Status != "degraded" {
		return fmt.Errorf("unrecognized health status %q", o.Health.Status)
	}

	return nil
}
