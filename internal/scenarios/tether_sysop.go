// Package scenarios composes deterministic, linked operations and tether presentation fixtures.
package scenarios

import (
	"encoding/json"
	"fmt"
	"os"
	"sort"
	"time"
)

// TetherSysopFixture represents the complete tether-sysop/v1 fixture family bundle.
type TetherSysopFixture struct {
	Version           string                     `json:"version"`
	Generator         string                     `json:"generator"`
	OperationsVersion string                     `json:"operationsVersion"`
	Seed              uint64                     `json:"seed"`
	Clock             string                     `json:"clock"`
	ObservedSince     string                     `json:"observedSince"`
	Overview          OverviewInfo               `json:"overview"`
	OverviewVariants  map[string]OverviewInfo    `json:"overviewVariants"`
	AI                TetherSysopAIFixture       `json:"ai"`
	Activity          TetherSysopActivityFixture `json:"activity"`
	Registry          RegistryInfo               `json:"registry"`

	// Direct array projections for family contract inventory verification
	Events        []EventInfo              `json:"events"`
	ToolCalls     []ToolCallInfo           `json:"toolCalls"`
	Scopes        []ActivityScopeAggregate `json:"scopes"`
	RegistryRows  []RegistryProfileInfo    `json:"registryRows"`
	AIProviders   []AIProviderSettingsInfo `json:"aiProviders"`
	AIRoutes      []AIRouteSettingsInfo    `json:"aiRoutes"`
	AIAuditEvents []AIAuditEventInfo       `json:"aiAuditEvents"`
	AIBudgets     []AIBudgetInfo           `json:"aiBudgets"`
}

// TetherSysopAIFixture groups all AI Gateway client payloads.
type TetherSysopAIFixture struct {
	Settings AISettingsInfo          `json:"settings"`
	Runtime  AIRuntimeInfo           `json:"runtime"`
	Usage    AIUsageInfo             `json:"usage"`
	Audit    AIAuditInfo             `json:"audit"`
	Budgets  AIBudgetsInfo           `json:"budgets"`
	Catalog  []AIProviderCatalogInfo `json:"catalog"`
}

// TetherSysopActivityFixture groups Activity Monitor client payloads.
type TetherSysopActivityFixture struct {
	Events    EventsInfo               `json:"events"`
	ToolCalls ToolCallsInfo            `json:"tool_calls"`
	Scopes    []ActivityScopeAggregate `json:"scopes"`
}

// ─────────────────────────────────────────────────────────────────────────────
// Overview Wire Types (from Tether client.ts / main.go)
// ─────────────────────────────────────────────────────────────────────────────

type HealthInfo struct {
	Status      string `json:"status"`
	CatalogRoot string `json:"catalog_root"`
	Error       string `json:"error,omitempty"`
}

type NameCount struct {
	Name  string `json:"name"`
	Count int    `json:"count"`
}

type OverviewSessions struct {
	Total       int         `json:"total"`
	Running     int         `json:"running"`
	Ended       int         `json:"ended"`
	SuccessPct  int         `json:"success_pct"`
	FailurePct  int         `json:"failure_pct"`
	AvgSeconds  int         `json:"avg_seconds"`
	Recent24h   int         `json:"recent_24h"`
	Trend       []int       `json:"trend"`
	ByState     []NameCount `json:"by_state"`
	ByProvider  []NameCount `json:"by_provider"`
	ByProject   []NameCount `json:"by_project"`
}

type OverviewToolCalls struct {
	Total      int         `json:"total"`
	OK         int         `json:"ok"`
	Errors     int         `json:"errors"`
	SuccessPct int         `json:"success_pct"`
	P50Ms      int64       `json:"p50_ms"`
	P95Ms      int64       `json:"p95_ms"`
	AvgMs      int64       `json:"avg_ms"`
	Recent1h   int         `json:"recent_1h"`
	SlowCalls  int         `json:"slow_calls"`
	Sessions   int         `json:"sessions"`
	TopTools   []NameCount `json:"top_tools"`
	TopErrors  []NameCount `json:"top_errors"`
	ByServer   []NameCount `json:"by_server"`
	Latency    []NameCount `json:"latency"`
	Trend      []int       `json:"trend"`
}

type OverviewMessages struct {
	Total     int         `json:"total"`
	Unread    int         `json:"unread"`
	Archived  int         `json:"archived"`
	Recent24h int         `json:"recent_24h"`
	ByKind    []NameCount `json:"by_kind"`
	ByScope   []NameCount `json:"by_scope"`
	Trend     []int       `json:"trend"`
}

type OverviewEvents struct {
	Total     int         `json:"total"`
	Recent1h  int         `json:"recent_1h"`
	LatestSeq int64       `json:"latest_seq"`
	ByScope   []NameCount `json:"by_scope"`
	ByKind    []NameCount `json:"by_kind"`
	Trend     []int       `json:"trend"`
}

type OverviewAI struct {
	ConfiguredProviders int         `json:"configured_providers"`
	EnabledProviders    int         `json:"enabled_providers"`
	Routes              int         `json:"routes"`
	Requests            int         `json:"requests"`
	Successes           int         `json:"successes"`
	Errors              int         `json:"errors"`
	BudgetRejections    int         `json:"budget_rejections"`
	InputTokens         int         `json:"input_tokens"`
	OutputTokens        int         `json:"output_tokens"`
	EstimatedCostUSD    float64     `json:"estimated_cost_usd"`
	ByProvider          []NameCount `json:"by_provider"`
	ByModel             []NameCount `json:"by_model"`
	ByEventType         []NameCount `json:"by_event_type"`
	Trend               []int       `json:"trend"`
}

type OverviewCatalog struct {
	Projects  int `json:"projects"`
	Agents    int `json:"agents"`
	Providers int `json:"providers"`
	Launches  int `json:"launches"`
}

type OverviewInfo struct {
	Sessions  OverviewSessions  `json:"sessions"`
	ToolCalls OverviewToolCalls `json:"tool_calls"`
	Messages  OverviewMessages  `json:"messages"`
	Events    OverviewEvents    `json:"events"`
	AI        OverviewAI        `json:"ai"`
	Catalog   OverviewCatalog   `json:"catalog"`
	Health    HealthInfo        `json:"health"`
	Error     string            `json:"error,omitempty"`
}

// ─────────────────────────────────────────────────────────────────────────────
// AI Gateway Wire Types
// ─────────────────────────────────────────────────────────────────────────────

type AIUsageBudgetPolicyInfo struct {
	MaxCostUSD *float64 `json:"max_cost_usd,omitempty"`
	Window     string   `json:"window,omitempty"`
	Scope      string   `json:"scope,omitempty"`
}

type AIPolicyInfo struct {
	AllowReasoning   *bool                    `json:"allow_reasoning,omitempty"`
	AllowTools       *bool                    `json:"allow_tools,omitempty"`
	AllowAttachments *bool                    `json:"allow_attachments,omitempty"`
	MaxOutputTokens  *int                     `json:"max_output_tokens,omitempty"`
	MaxCostUSD       *float64                 `json:"max_cost_usd,omitempty"`
	UsageBudget      *AIUsageBudgetPolicyInfo `json:"usage_budget,omitempty"`
}

type AIProviderSettingsInfo struct {
	ID           string        `json:"id"`
	Type         string        `json:"type"`
	Model        string        `json:"model,omitempty"`
	Models       []string      `json:"models,omitempty"`
	DefaultModel string        `json:"default_model,omitempty"`
	SecretRef    string        `json:"secret_ref,omitempty"`
	BaseURL      string        `json:"base_url,omitempty"`
	Enabled      bool          `json:"enabled"`
	Policy       *AIPolicyInfo `json:"policy,omitempty"`
}

type AIRouteSettingsInfo struct {
	Provider          string        `json:"provider"`
	Model             string        `json:"model"`
	Mode              string        `json:"mode,omitempty"`
	Intent            string        `json:"intent,omitempty"`
	RequiresReasoning *bool         `json:"requires_reasoning,omitempty"`
	RequiresTools     *bool         `json:"requires_tools,omitempty"`
	Policy            *AIPolicyInfo `json:"policy,omitempty"`
}

type AIConfigInfo struct {
	Policy               *AIPolicyInfo            `json:"policy,omitempty"`
	DefaultProviderOrder []string                 `json:"default_provider_order,omitempty"`
	Providers            []AIProviderSettingsInfo `json:"providers"`
	Routes               []AIRouteSettingsInfo    `json:"routes"`
}

type AISettingsRuntimeInfo struct {
	DaemonReachable bool   `json:"daemon_reachable"`
	Providers       int    `json:"providers"`
	Models          int    `json:"models"`
	Routes          int    `json:"routes"`
	LastError       string `json:"last_error,omitempty"`
}

type AISettingsInfo struct {
	Config  AIConfigInfo          `json:"config"`
	Runtime AISettingsRuntimeInfo `json:"runtime"`
	Error   string                `json:"error,omitempty"`
}

type AIRuntimeProviderInfo struct {
	ID           string   `json:"id"`
	Type         string   `json:"type"`
	DefaultModel string   `json:"default_model,omitempty"`
	Models       []string `json:"models,omitempty"`
	BaseURL      string   `json:"base_url,omitempty"`
}

type AIRuntimeModelInfo struct {
	ConfiguredProviderID string   `json:"configured_provider_id"`
	VendorProviderID     string   `json:"vendor_provider_id"`
	ID                   string   `json:"id"`
	Name                 string   `json:"name,omitempty"`
	Family               string   `json:"family,omitempty"`
	ContextWindow        int      `json:"context_window,omitempty"`
	MaxOutputTokens      int      `json:"max_output_tokens,omitempty"`
	InputModalities      []string `json:"input_modalities,omitempty"`
	OutputModalities     []string `json:"output_modalities,omitempty"`
}

type AIRuntimeRouteInfo struct {
	Provider          string                   `json:"provider"`
	Model             string                   `json:"model"`
	Mode              string                   `json:"mode,omitempty"`
	Intent            string                   `json:"intent,omitempty"`
	RequiresReasoning *bool                    `json:"requires_reasoning,omitempty"`
	RequiresTools     *bool                    `json:"requires_tools,omitempty"`
	AllowReasoning    *bool                    `json:"allow_reasoning,omitempty"`
	AllowTools        *bool                    `json:"allow_tools,omitempty"`
	AllowAttachments  *bool                    `json:"allow_attachments,omitempty"`
	MaxOutputTokens   *int                     `json:"max_output_tokens,omitempty"`
	MaxCostUSD        *float64                 `json:"max_cost_usd,omitempty"`
	UsageBudget       *AIUsageBudgetPolicyInfo `json:"usage_budget,omitempty"`
}

type AIRuntimeInfo struct {
	Providers []AIRuntimeProviderInfo `json:"providers"`
	Models    []AIRuntimeModelInfo    `json:"models"`
	Routes    []AIRuntimeRouteInfo    `json:"routes"`
	Error     string                  `json:"error,omitempty"`
}

type AIUsageBreakdownInfo struct {
	Key              string   `json:"key"`
	Requests         int      `json:"requests"`
	Successes        int      `json:"successes"`
	Errors           int      `json:"errors"`
	LatencyMs        int      `json:"latency_ms"`
	InputTokens      *int     `json:"input_tokens,omitempty"`
	OutputTokens     *int     `json:"output_tokens,omitempty"`
	CacheReadTokens  *int     `json:"cache_read_tokens,omitempty"`
	CacheWriteTokens *int     `json:"cache_write_tokens,omitempty"`
	ReasoningTokens  *int     `json:"reasoning_tokens,omitempty"`
	EstimatedCostUSD *float64 `json:"estimated_cost_usd,omitempty"`
}

type AIUsageSummaryInfo struct {
	Requests         int                    `json:"requests"`
	Successes        int                    `json:"successes"`
	Errors           int                    `json:"errors"`
	LatencyMs        int                    `json:"latency_ms"`
	InputTokens      *int                   `json:"input_tokens,omitempty"`
	OutputTokens     *int                   `json:"output_tokens,omitempty"`
	CacheReadTokens  *int                   `json:"cache_read_tokens,omitempty"`
	CacheWriteTokens *int                   `json:"cache_write_tokens,omitempty"`
	ReasoningTokens  *int                   `json:"reasoning_tokens,omitempty"`
	EstimatedCostUSD *float64               `json:"estimated_cost_usd,omitempty"`
	ByProvider       []AIUsageBreakdownInfo `json:"by_provider,omitempty"`
	ByModel          []AIUsageBreakdownInfo `json:"by_model,omitempty"`
	ByOperation      []AIUsageBreakdownInfo `json:"by_operation,omitempty"`
}

type AIUsageInfo struct {
	Summary AIUsageSummaryInfo `json:"summary"`
	Error   string             `json:"error,omitempty"`
}

type AIAuditEventInfo struct {
	ID               int      `json:"id"`
	EventType        string   `json:"event_type"`
	RequestID        string   `json:"request_id,omitempty"`
	SessionID        string   `json:"session_id,omitempty"`
	CallerID         string   `json:"caller_id,omitempty"`
	Operation        string   `json:"operation"`
	Provider         string   `json:"provider,omitempty"`
	Model            string   `json:"model,omitempty"`
	PolicyVersion    string   `json:"policy_version,omitempty"`
	LatencyMs        int      `json:"latency_ms"`
	Success          bool     `json:"success"`
	Refusal          string   `json:"refusal,omitempty"`
	Error            string   `json:"error,omitempty"`
	InputTokens      *int     `json:"input_tokens,omitempty"`
	OutputTokens     *int     `json:"output_tokens,omitempty"`
	CacheReadTokens  *int     `json:"cache_read_tokens,omitempty"`
	CacheWriteTokens *int     `json:"cache_write_tokens,omitempty"`
	ReasoningTokens  *int     `json:"reasoning_tokens,omitempty"`
	EstimatedCostUSD *float64 `json:"estimated_cost_usd,omitempty"`
	RequestSummary   string   `json:"request_summary,omitempty"`
	ResponseSummary  string   `json:"response_summary,omitempty"`
	Timestamp        string   `json:"timestamp"`
}

type AIAuditInfo struct {
	Events []AIAuditEventInfo `json:"events"`
	Count  int                `json:"count"`
	Error  string             `json:"error,omitempty"`
}

type AIBudgetFilterInfo struct {
	Provider  string `json:"provider,omitempty"`
	Model     string `json:"model,omitempty"`
	SessionID string `json:"session_id,omitempty"`
	CallerID  string `json:"caller_id,omitempty"`
	Operation string `json:"operation,omitempty"`
}

type AIBudgetInfo struct {
	Provider         string                  `json:"provider"`
	Model            string                  `json:"model"`
	Mode             string                  `json:"mode,omitempty"`
	Intent           string                  `json:"intent,omitempty"`
	UsageBudget      AIUsageBudgetPolicyInfo `json:"usage_budget"`
	WindowStart      string                  `json:"window_start"`
	SpentCostUSD     *float64                `json:"spent_cost_usd,omitempty"`
	RemainingCostUSD *float64                `json:"remaining_cost_usd,omitempty"`
	Exhausted        bool                    `json:"exhausted"`
	Filter           AIBudgetFilterInfo      `json:"filter"`
	Error            string                  `json:"error,omitempty"`
}

type AIBudgetsInfo struct {
	Budgets []AIBudgetInfo `json:"budgets"`
	Count   int            `json:"count"`
	Error   string         `json:"error,omitempty"`
}

type AIProviderCatalogModelInfo struct {
	ID                   string   `json:"id"`
	Name                 string   `json:"name,omitempty"`
	Family               string   `json:"family,omitempty"`
	ContextWindow        int      `json:"context_window,omitempty"`
	MaxOutputTokens      int      `json:"max_output_tokens,omitempty"`
	InputModalities      []string `json:"input_modalities,omitempty"`
	OutputModalities     []string `json:"output_modalities,omitempty"`
	SupportsTools        bool     `json:"supports_tools,omitempty"`
	SupportsReasoning    bool     `json:"supports_reasoning,omitempty"`
	SupportsAttachments  bool     `json:"supports_attachments,omitempty"`
	InputCostUSDPerMTok  *float64 `json:"input_cost_usd_per_mtok,omitempty"`
	OutputCostUSDPerMTok *float64 `json:"output_cost_usd_per_mtok,omitempty"`
}

type AIProviderCatalogInfo struct {
	ProviderType       string                       `json:"provider_type"`
	VendorProviderID   string                       `json:"vendor_provider_id,omitempty"`
	VendorProviderName string                       `json:"vendor_provider_name,omitempty"`
	Models             []AIProviderCatalogModelInfo `json:"models"`
	LastFetchedAt      string                       `json:"last_fetched_at,omitempty"`
	FromCacheOnly      bool                         `json:"from_cache_only,omitempty"`
	Error              string                       `json:"error,omitempty"`
}

// ─────────────────────────────────────────────────────────────────────────────
// Activity Monitor Wire Types
// ─────────────────────────────────────────────────────────────────────────────

type EventInfo struct {
	Seq       int64  `json:"seq"`
	At        string `json:"at"`
	Scope     string `json:"scope"`
	SessionID string `json:"session_id,omitempty"`
	Kind      string `json:"kind"`
	Payload   string `json:"payload,omitempty"`
}

type EventsInfo struct {
	Events []EventInfo `json:"events"`
	Total  int         `json:"total"`
	Error  string      `json:"error,omitempty"`
}

type ToolCallInfo struct {
	ID           int64  `json:"id"`
	SessionID    string `json:"session_id,omitempty"`
	Server       string `json:"server,omitempty"`
	ToolName     string `json:"tool_name"`
	ArgsSchemaFp string `json:"args_schema_fp,omitempty"`
	DurationMs   int64  `json:"duration_ms"`
	OK           bool   `json:"ok"`
	Error        string `json:"error,omitempty"`
	Timestamp    string `json:"timestamp"`
	Payload      string `json:"payload,omitempty"`
}

type ToolCallsInfo struct {
	ToolCalls []ToolCallInfo `json:"tool_calls"`
	Total     int            `json:"total"`
	Error     string         `json:"error,omitempty"`
}

type ActivityScopeAggregate struct {
	Scope        string      `json:"scope"`
	EventCount   int         `json:"event_count"`
	SessionCount int         `json:"session_count"`
	KindCount    int         `json:"kind_count"`
	LatestAt     string      `json:"latest_at"`
	LatestKind   string      `json:"latest_kind"`
	LatestSeq    int64       `json:"latest_seq"`
	Kinds        []NameCount `json:"kinds"`
}

// ─────────────────────────────────────────────────────────────────────────────
// Registry Wire Types
// ─────────────────────────────────────────────────────────────────────────────

type RegistryCallbackInfo struct {
	Scheme string `json:"scheme"`
	Target string `json:"target"`
}

type RegistrySkillInfo struct {
	Name      string `json:"name"`
	LearnedAt string `json:"learned_at"`
	Via       string `json:"via,omitempty"`
	Level     string `json:"level,omitempty"`
}

type RegistryLinkInfo struct {
	Kind   string `json:"kind"`
	Target string `json:"target"`
}

type RegistryProfileInfo struct {
	URN              string                `json:"urn"`
	Kind             string                `json:"kind"`
	TetherInstanceID string                `json:"tether_instance_id"`
	DisplayName      string                `json:"display_name"`
	Title            string                `json:"title,omitempty"`
	Role             string                `json:"role,omitempty"`
	Description      string                `json:"description,omitempty"`
	Avatar           string                `json:"avatar,omitempty"`
	Project          string                `json:"project,omitempty"`
	Status           string                `json:"status"`
	Callback         *RegistryCallbackInfo `json:"callback,omitempty"`
	CachedAt         string                `json:"cached_at,omitempty"`
	HealthStatus     string                `json:"health_status,omitempty"`
	LastSeenAt       string                `json:"last_seen_at,omitempty"`
	HostAddress      string                `json:"host_address,omitempty"`
	LastUpdatedBy    string                `json:"last_updated_by,omitempty"`
	Capabilities     []string              `json:"capabilities,omitempty"`
	Skills           []RegistrySkillInfo   `json:"skills,omitempty"`
	Links            []RegistryLinkInfo    `json:"links,omitempty"`
	CreatedAt        string                `json:"created_at"`
	UpdatedAt        string                `json:"updated_at"`
}

type RegistryInfo struct {
	Rows  []RegistryProfileInfo `json:"rows"`
	Error string                `json:"error,omitempty"`
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper functions for deterministic trends and buckets
// ─────────────────────────────────────────────────────────────────────────────

func bucketCounts(times []time.Time, n int) []int {
	buckets := make([]int, n)
	if len(times) == 0 || n <= 0 {
		return buckets
	}
	lo, hi := times[0], times[0]
	for _, t := range times {
		if t.Before(lo) {
			lo = t
		}
		if t.After(hi) {
			hi = t
		}
	}
	span := hi.Sub(lo)
	if span <= 0 {
		buckets[n-1] = len(times)
		return buckets
	}
	for _, t := range times {
		idx := int(float64(t.Sub(lo)) / float64(span) * float64(n))
		if idx >= n {
			idx = n - 1
		}
		if idx < 0 {
			idx = 0
		}
		buckets[idx]++
	}
	return buckets
}

func latencyBand(ms int64) string {
	switch {
	case ms < 10:
		return "<10ms"
	case ms < 100:
		return "10-99ms"
	case ms < 500:
		return "100-499ms"
	case ms < 1000:
		return "500-999ms"
	default:
		return ">=1s"
	}
}

func orderedLatencyCounts(counts map[string]int) []NameCount {
	order := []string{"<10ms", "10-99ms", "100-499ms", "500-999ms", ">=1s"}
	out := make([]NameCount, 0, len(order))
	for _, name := range order {
		if counts[name] > 0 {
			out = append(out, NameCount{Name: name, Count: counts[name]})
		}
	}
	return out
}

func topN(counts map[string]int, n int) []NameCount {
	type pair struct {
		name  string
		count int
	}
	var pairs []pair
	for k, v := range counts {
		pairs = append(pairs, pair{k, v})
	}
	sort.Slice(pairs, func(i, j int) bool {
		if pairs[i].count == pairs[j].count {
			return pairs[i].name < pairs[j].name
		}
		return pairs[i].count > pairs[j].count
	})
	if len(pairs) > n {
		pairs = pairs[:n]
	}
	out := make([]NameCount, 0, len(pairs))
	for _, p := range pairs {
		out = append(out, NameCount{Name: p.name, Count: p.count})
	}
	return out
}

func boolPtr(b bool) *bool          { return &b }
func intPtr(i int) *int             { return &i }
func floatPtr(f float64) *float64   { return &f }

// ─────────────────────────────────────────────────────────────────────────────
// Generator
// ─────────────────────────────────────────────────────────────────────────────

// GenerateTetherSysop builds the deterministic tether-sysop/v1 fixture bundle.
func GenerateTetherSysop() TetherSysopFixture {
	clock := time.Date(2026, 10, 4, 14, 30, 0, 0, time.UTC)
	coverage := clock.Add(-24 * time.Hour)
	ops := Generate() // Reuses compatible operations/v2 observations

	// Build Activity Events (64 monotonic-seq events)
	events := make([]EventInfo, 0, 64)
	var eventTimes []time.Time
	eventScopeCounts := map[string]int{}
	eventKindCounts := map[string]int{}
	recent1hCutoff := clock.Add(-time.Hour)

	scopes := []string{"session", "agent", "system", "router", "mesh"}
	kindsForScope := map[string][]string{
		"session": {"session.started", "turn.created", "turn.completed", "session.checkpoint", "session.ended"},
		"agent":   {"agent.registered", "agent.heartbeat", "agent.skill_invoked", "agent.state_changed"},
		"system":  {"catalog.reloaded", "daemon.started", "mcp.server_connected", "system.resource_action"},
		"router":  {"route.resolved", "provider.dispatched", "budget.evaluated", "cache.hit"},
		"mesh":    {"envelope.routed", "peer.discovered", "lease.renewed", "partition.fenced"},
	}

	for i := 0; i < 64; i++ {
		seq := int64(i + 1)
		// Distribute time monotonically backwards from clock
		offsetSec := int(float64(64-i-1) * (24.0 * 3600.0 / 64.0))
		t := clock.Add(-time.Duration(offsetSec) * time.Second)
		eventTimes = append(eventTimes, t)

		scope := scopes[i%len(scopes)]
		kinds := kindsForScope[scope]
		kind := kinds[(i/len(scopes))%len(kinds)]

		var sessionID string
		if scope == "session" || (scope == "agent" && i%2 == 0) {
			sessionID = fmt.Sprintf("SESSION-%03d", (i%8)+1)
		}

		payload := fmt.Sprintf(`{"seq":%d,"scope":"%s","kind":"%s","status":"admitted","deterministic":true}`, seq, scope, kind)
		if sessionID != "" {
			payload = fmt.Sprintf(`{"seq":%d,"scope":"%s","kind":"%s","session_id":"%s","tokens":%d}`, seq, scope, kind, sessionID, 100+i*25)
		}

		events = append(events, EventInfo{
			Seq:       seq,
			At:        t.Format(time.RFC3339Nano),
			Scope:     scope,
			SessionID: sessionID,
			Kind:      kind,
			Payload:   payload,
		})
		eventScopeCounts[scope]++
		eventKindCounts[kind]++
	}

	// Build Scope Aggregates
	scopeAggregates := make([]ActivityScopeAggregate, 0, len(scopes))
	for _, sc := range scopes {
		var count int
		sessionMap := map[string]struct{}{}
		kindMap := map[string]int{}
		var latestAt string
		var latestKind string
		var latestSeq int64

		for _, ev := range events {
			if ev.Scope == sc {
				count++
				if ev.SessionID != "" {
					sessionMap[ev.SessionID] = struct{}{}
				}
				kindMap[ev.Kind]++
				if ev.Seq > latestSeq {
					latestSeq = ev.Seq
					latestAt = ev.At
					latestKind = ev.Kind
				}
			}
		}

		kindsList := topN(kindMap, 10)
		scopeAggregates = append(scopeAggregates, ActivityScopeAggregate{
			Scope:        sc,
			EventCount:   count,
			SessionCount: len(sessionMap),
			KindCount:    len(kindMap),
			LatestAt:     latestAt,
			LatestKind:   latestKind,
			LatestSeq:    latestSeq,
			Kinds:        kindsList,
		})
	}

	// Build Activity Tool Calls (~30 calls with duration spread and errors)
	toolNames := []string{"read_file", "run_command", "replace_file_content", "fixture.inspect", "view_file", "git_status"}
	servers := []string{"native", "mcp-fs", "mcp-git", "mcp-eval"}
	toolCalls := make([]ToolCallInfo, 0, 30)
	var toolTimes []time.Time
	toolCounts := map[string]int{}
	errorCounts := map[string]int{}
	serverCounts := map[string]int{}
	toolLatencyCounts := map[string]int{}
	var toolDurs []int64
	var toolSumMs int64
	toolRecent1h := 0
	slowCalls := 0
	toolSessions := map[string]struct{}{}

	// Durations deliberately crafted: fast (<100ms), medium (100-499ms), 500-999ms, slow (>=1000ms)
	sampleDurations := []int64{
		12, 18, 25, 42, 55, 68, 74, 82, 89, 95,
		110, 135, 160, 185, 210, 245, 280, 320, 360, 410,
		450, 480, 520, 640, 780, 890, 1150, 1450, 2100, 2400,
	}

	for i := 0; i < 30; i++ {
		id := int64(i + 1)
		offsetSec := int(float64(30-i-1) * (18.0 * 3600.0 / 30.0))
		t := clock.Add(-time.Duration(offsetSec) * time.Second)
		toolTimes = append(toolTimes, t)
		if t.After(recent1hCutoff) {
			toolRecent1h++
		}

		sessionID := fmt.Sprintf("SESSION-%03d", (i%8)+1)
		toolSessions[sessionID] = struct{}{}

		name := toolNames[i%len(toolNames)]
		toolCounts[name]++

		server := servers[i%len(servers)]
		serverCounts[server]++

		dur := sampleDurations[i]
		toolDurs = append(toolDurs, dur)
		toolSumMs += dur
		if dur >= 1000 {
			slowCalls++
		}
		toolLatencyCounts[latencyBand(dur)]++

		// 1 error among 30 calls in standard profile (29/30 = 96% success)
		ok := true
		errStr := ""
		if i == 7 {
			ok = false
			errStr = "file not found: config/missing.yaml"
			errorCounts[name]++
		}

		callPayload := fmt.Sprintf(`{"tool":"%s","server":"%s","ok":%t,"duration_ms":%d}`, name, server, ok, dur)
		toolCalls = append(toolCalls, ToolCallInfo{
			ID:           id,
			SessionID:    sessionID,
			Server:       server,
			ToolName:     name,
			ArgsSchemaFp: fmt.Sprintf("fp-%s-v1", name),
			DurationMs:   dur,
			OK:           ok,
			Error:        errStr,
			Timestamp:    t.Format(time.RFC3339),
			Payload:      callPayload,
		})
	}

	sort.Slice(toolDurs, func(i, j int) bool { return toolDurs[i] < toolDurs[j] })
	p50Ms := toolDurs[int(float64(len(toolDurs)-1)*0.50)]
	p95Ms := toolDurs[int(float64(len(toolDurs)-1)*0.95)]
	avgMs := toolSumMs / int64(len(toolDurs))

	// Build Overview Sessions data (linking with operations/v2 sessions)
	sessionTimes := make([]time.Time, 0, len(ops.Runs))
	sessionStateCounts := map[string]int{}
	sessionProviderCounts := map[string]int{"claude": 3, "codex": 3, "agy": 2}
	sessionProjectCounts := map[string]int{"parallax": 4, "tether": 2, "tangent": 2}
	sessionRunning := 0
	sessionEnded := 0
	sessionSuccess := 0
	sessionFail := 0
	var sessionDurSum float64

	for i, r := range ops.Runs {
		sessionStateCounts[r.Status]++
		st, _ := time.Parse(time.RFC3339, r.Started)
		sessionTimes = append(sessionTimes, st)
		if r.Status == "running" {
			sessionRunning++
		} else {
			sessionEnded++
			if r.Status == "done" {
				sessionSuccess++
			} else {
				sessionFail++
			}
			if r.Finished != nil {
				ft, _ := time.Parse(time.RFC3339, *r.Finished)
				sessionDurSum += ft.Sub(st).Seconds()
			}
		}
		_ = i
	}
	sessionSuccessPct := sessionSuccess * 100 / sessionEnded
	sessionFailurePct := sessionFail * 100 / sessionEnded
	sessionAvgSec := int(sessionDurSum / float64(sessionEnded))

	// Build Overview Messages data
	messageKinds := map[string]int{"turn": 14, "notice": 8, "system": 2}
	messageScopes := map[string]int{"agent": 15, "user": 6, "group": 3}
	var messageTimes []time.Time
	for i := 0; i < 24; i++ {
		t := clock.Add(-time.Duration((24-i)*45) * time.Minute)
		messageTimes = append(messageTimes, t)
	}

	// Build AI Usage Summary & Breakdowns
	aiByProvider := []AIUsageBreakdownInfo{
		{
			Key:              "anthropic",
			Requests:         70,
			Successes:        68,
			Errors:           2,
			LatencyMs:        820,
			InputTokens:      intPtr(220000),
			OutputTokens:     intPtr(55000),
			CacheReadTokens:  intPtr(90000),
			CacheWriteTokens: intPtr(20000),
			ReasoningTokens:  intPtr(12000),
			EstimatedCostUSD: floatPtr(1.15),
		},
		{
			Key:              "google",
			Requests:         45,
			Successes:        44,
			Errors:           1,
			LatencyMs:        410,
			InputTokens:      intPtr(114000),
			OutputTokens:     intPtr(28000),
			CacheReadTokens:  intPtr(45000),
			CacheWriteTokens: intPtr(10000),
			ReasoningTokens:  intPtr(4000),
			EstimatedCostUSD: floatPtr(0.35),
		},
		{
			Key:              "openai",
			Requests:         25,
			Successes:        24,
			Errors:           1,
			LatencyMs:        550,
			InputTokens:      intPtr(50000),
			OutputTokens:     intPtr(13000),
			CacheReadTokens:  intPtr(15000),
			CacheWriteTokens: intPtr(5000),
			ReasoningTokens:  intPtr(2000),
			EstimatedCostUSD: floatPtr(0.34),
		},
	}

	aiByModel := []AIUsageBreakdownInfo{
		{
			Key:              "claude-3-7-sonnet",
			Requests:         55,
			Successes:        54,
			Errors:           1,
			LatencyMs:        920,
			InputTokens:      intPtr(180000),
			OutputTokens:     intPtr(45000),
			EstimatedCostUSD: floatPtr(0.95),
		},
		{
			Key:              "claude-3-5-haiku",
			Requests:         15,
			Successes:        14,
			Errors:           1,
			LatencyMs:        450,
			InputTokens:      intPtr(40000),
			OutputTokens:     intPtr(10000),
			EstimatedCostUSD: floatPtr(0.20),
		},
		{
			Key:              "gemini-2.0-flash",
			Requests:         30,
			Successes:        30,
			Errors:           0,
			LatencyMs:        320,
			InputTokens:      intPtr(64000),
			OutputTokens:     intPtr(16000),
			EstimatedCostUSD: floatPtr(0.12),
		},
		{
			Key:              "gemini-2.5-pro",
			Requests:         15,
			Successes:        14,
			Errors:           1,
			LatencyMs:        590,
			InputTokens:      intPtr(50000),
			OutputTokens:     intPtr(12000),
			EstimatedCostUSD: floatPtr(0.23),
		},
		{
			Key:              "gpt-4o",
			Requests:         20,
			Successes:        19,
			Errors:           1,
			LatencyMs:        580,
			InputTokens:      intPtr(42000),
			OutputTokens:     intPtr(11000),
			EstimatedCostUSD: floatPtr(0.30),
		},
		{
			Key:              "gpt-4o-mini",
			Requests:         5,
			Successes:        5,
			Errors:           0,
			LatencyMs:        430,
			InputTokens:      intPtr(8000),
			OutputTokens:     intPtr(2000),
			EstimatedCostUSD: floatPtr(0.04),
		},
	}

	aiByOperation := []AIUsageBreakdownInfo{
		{Key: "completion", Requests: 95, Successes: 93, Errors: 2, LatencyMs: 600},
		{Key: "chat", Requests: 40, Successes: 39, Errors: 1, LatencyMs: 640},
		{Key: "embeddings", Requests: 5, Successes: 4, Errors: 1, LatencyMs: 310},
	}

	aiUsage := AIUsageInfo{
		Summary: AIUsageSummaryInfo{
			Requests:         140,
			Successes:        136,
			Errors:           4,
			LatencyMs:        620,
			InputTokens:      intPtr(384000),
			OutputTokens:     intPtr(96000),
			CacheReadTokens:  intPtr(150000),
			CacheWriteTokens: intPtr(35000),
			ReasoningTokens:  intPtr(18000),
			EstimatedCostUSD: floatPtr(1.84),
			ByProvider:       aiByProvider,
			ByModel:          aiByModel,
			ByOperation:      aiByOperation,
		},
	}

	// Build AI Audit Events (>=20 events, includes refusal)
	auditEvents := make([]AIAuditEventInfo, 0, 24)
	var aiTimes []time.Time
	for i := 0; i < 24; i++ {
		id := i + 1
		offsetSec := int(float64(24-i-1) * (20.0 * 3600.0 / 24.0))
		t := clock.Add(-time.Duration(offsetSec) * time.Second)
		aiTimes = append(aiTimes, t)

		evType := "completion"
		op := "completion"
		prov := "anthropic"
		mod := "claude-3-7-sonnet"
		success := true
		refusalStr := ""
		errStr := ""
		sessID := fmt.Sprintf("SESSION-%03d", (i%8)+1)
		callerID := fmt.Sprintf("agent-%03d", (i%4)+1)

		if i%3 == 0 {
			evType = "chat"
			op = "chat"
			prov = "google"
			mod = "gemini-2.0-flash"
		} else if i%5 == 0 {
			prov = "openai"
			mod = "gpt-4o"
		}

		if i == 11 {
			// Required refusal event
			evType = "refusal"
			op = "chat"
			prov = "anthropic"
			mod = "claude-3-7-sonnet"
			success = false
			refusalStr = "Refusal: safety policy denied unreviewed tool execution"
		} else if i == 17 {
			evType = "budget_rejection"
			op = "completion"
			prov = "anthropic"
			mod = "claude-3-7-sonnet"
			success = false
			errStr = "budget limit $2.50 exceeded for session SESSION-002"
		}

		auditEvents = append(auditEvents, AIAuditEventInfo{
			ID:               id,
			EventType:        evType,
			RequestID:        fmt.Sprintf("req-%04d", id),
			SessionID:        sessID,
			CallerID:         callerID,
			Operation:        op,
			Provider:         prov,
			Model:            mod,
			PolicyVersion:    "ai-policy-v1",
			LatencyMs:        250 + (i*37)%750,
			Success:          success,
			Refusal:          refusalStr,
			Error:            errStr,
			InputTokens:      intPtr(1500 + i*120),
			OutputTokens:     intPtr(350 + i*45),
			CacheReadTokens:  intPtr(400 + i*20),
			CacheWriteTokens: intPtr(100 + i*10),
			ReasoningTokens:  intPtr(80 + i*15),
			EstimatedCostUSD: floatPtr(0.012 + float64(i)*0.003),
			RequestSummary:   fmt.Sprintf("Request %d: inspect and resolve task context", id),
			ResponseSummary:  fmt.Sprintf("Response %d: completed analysis without error", id),
			Timestamp:        t.Format(time.RFC3339),
		})
	}

	// Build AI Budgets (>=3 budgets, includes exhausted)
	aiBudgets := []AIBudgetInfo{
		{
			Provider: "anthropic",
			Model:    "claude-3-7-sonnet",
			Mode:     "code",
			Intent:   "primary reasoning",
			UsageBudget: AIUsageBudgetPolicyInfo{
				MaxCostUSD: floatPtr(10.0),
				Window:     "24h",
				Scope:      "global",
			},
			WindowStart:      clock.Add(-24 * time.Hour).Format(time.RFC3339),
			SpentCostUSD:     floatPtr(4.82),
			RemainingCostUSD: floatPtr(5.18),
			Exhausted:        false,
			Filter:           AIBudgetFilterInfo{Provider: "anthropic", Model: "claude-3-7-sonnet"},
		},
		{
			Provider: "google",
			Model:    "gemini-2.0-flash",
			Mode:     "fast",
			Intent:   "quick edits",
			UsageBudget: AIUsageBudgetPolicyInfo{
				MaxCostUSD: floatPtr(5.0),
				Window:     "24h",
				Scope:      "global",
			},
			WindowStart:      clock.Add(-24 * time.Hour).Format(time.RFC3339),
			SpentCostUSD:     floatPtr(1.12),
			RemainingCostUSD: floatPtr(3.88),
			Exhausted:        false,
			Filter:           AIBudgetFilterInfo{Provider: "google", Model: "gemini-2.0-flash"},
		},
		{
			Provider: "openai",
			Model:    "gpt-4o",
			Mode:     "structured",
			Intent:   "schema transforms",
			UsageBudget: AIUsageBudgetPolicyInfo{
				MaxCostUSD: floatPtr(2.5),
				Window:     "24h",
				Scope:      "session",
			},
			WindowStart:      clock.Add(-24 * time.Hour).Format(time.RFC3339),
			SpentCostUSD:     floatPtr(2.5),
			RemainingCostUSD: floatPtr(0.0),
			Exhausted:        true, // Required exhausted budget
			Filter:           AIBudgetFilterInfo{Provider: "openai", Model: "gpt-4o"},
		},
		{
			Provider: "google",
			Model:    "gemini-2.5-pro",
			Mode:     "pro",
			Intent:   "planning and architecture",
			UsageBudget: AIUsageBudgetPolicyInfo{
				MaxCostUSD: floatPtr(5.0),
				Window:     "7d",
				Scope:      "project",
			},
			WindowStart:      clock.Add(-7 * 24 * time.Hour).Format(time.RFC3339),
			SpentCostUSD:     floatPtr(2.30),
			RemainingCostUSD: floatPtr(2.70),
			Exhausted:        false,
			Filter:           AIBudgetFilterInfo{Provider: "google", Model: "gemini-2.5-pro"},
		},
	}

	// Build AI Settings (3-4 providers incl disabled, >=5 routes)
	aiProviders := []AIProviderSettingsInfo{
		{
			ID:           "anthropic",
			Type:         "anthropic",
			Model:        "claude-3-7-sonnet",
			Models:       []string{"claude-3-7-sonnet", "claude-3-5-haiku"},
			DefaultModel: "claude-3-7-sonnet",
			SecretRef:    "env://ANTHROPIC_API_KEY",
			Enabled:      true,
			Policy: &AIPolicyInfo{
				AllowReasoning:  boolPtr(true),
				AllowTools:      boolPtr(true),
				MaxOutputTokens: intPtr(8192),
				MaxCostUSD:      floatPtr(15.0),
			},
		},
		{
			ID:           "google",
			Type:         "google",
			Model:        "gemini-2.0-flash",
			Models:       []string{"gemini-2.0-flash", "gemini-2.5-pro"},
			DefaultModel: "gemini-2.0-flash",
			SecretRef:    "env://GEMINI_API_KEY",
			Enabled:      true,
			Policy: &AIPolicyInfo{
				AllowReasoning:  boolPtr(true),
				AllowTools:      boolPtr(true),
				MaxOutputTokens: intPtr(8192),
				MaxCostUSD:      floatPtr(10.0),
			},
		},
		{
			ID:           "openai",
			Type:         "openai",
			Model:        "gpt-4o",
			Models:       []string{"gpt-4o", "gpt-4o-mini"},
			DefaultModel: "gpt-4o",
			SecretRef:    "env://OPENAI_API_KEY",
			Enabled:      true,
			Policy: &AIPolicyInfo{
				AllowReasoning:  boolPtr(false),
				AllowTools:      boolPtr(true),
				MaxOutputTokens: intPtr(4096),
				MaxCostUSD:      floatPtr(10.0),
			},
		},
		{
			ID:           "local",
			Type:         "local",
			Model:        "llama3.3",
			Models:       []string{"llama3.3", "qwen2.5-coder"},
			DefaultModel: "llama3.3",
			BaseURL:      "http://localhost:11434",
			Enabled:      false, // Required disabled provider
			Policy: &AIPolicyInfo{
				AllowReasoning:  boolPtr(false),
				AllowTools:      boolPtr(false),
				MaxOutputTokens: intPtr(4096),
				MaxCostUSD:      floatPtr(0.0),
			},
		},
	}

	aiRoutes := []AIRouteSettingsInfo{
		{
			Provider:          "anthropic",
			Model:             "claude-3-7-sonnet",
			Mode:              "code",
			Intent:            "primary code and reasoning",
			RequiresReasoning: boolPtr(true),
			RequiresTools:     boolPtr(true),
		},
		{
			Provider:          "google",
			Model:             "gemini-2.0-flash",
			Mode:              "fast",
			Intent:            "quick search and targeted edits",
			RequiresReasoning: boolPtr(false),
			RequiresTools:     boolPtr(true),
		},
		{
			Provider:          "openai",
			Model:             "gpt-4o",
			Mode:              "structured",
			Intent:            "schema transforms and data parsing",
			RequiresReasoning: boolPtr(false),
			RequiresTools:     boolPtr(false),
		},
		{
			Provider:          "google",
			Model:             "gemini-2.5-pro",
			Mode:              "pro",
			Intent:            "architecture and planning",
			RequiresReasoning: boolPtr(true),
			RequiresTools:     boolPtr(true),
		},
		{
			Provider:          "anthropic",
			Model:             "claude-3-5-haiku",
			Mode:              "triage",
			Intent:            "quick triage and classification",
			RequiresReasoning: boolPtr(false),
			RequiresTools:     boolPtr(false),
		},
		{
			Provider:          "local",
			Model:             "llama3.3",
			Mode:              "offline",
			Intent:            "airgapped processing",
			RequiresReasoning: boolPtr(false),
			RequiresTools:     boolPtr(false),
		},
	}

	aiSettings := AISettingsInfo{
		Config: AIConfigInfo{
			Policy: &AIPolicyInfo{
				AllowReasoning:  boolPtr(true),
				AllowTools:      boolPtr(true),
				MaxOutputTokens: intPtr(8192),
				MaxCostUSD:      floatPtr(25.0),
				UsageBudget: &AIUsageBudgetPolicyInfo{
					MaxCostUSD: floatPtr(10.0),
					Window:     "24h",
					Scope:      "session",
				},
			},
			DefaultProviderOrder: []string{"anthropic", "google", "openai", "local"},
			Providers:            aiProviders,
			Routes:               aiRoutes,
		},
		Runtime: AISettingsRuntimeInfo{
			DaemonReachable: true,
			Providers:       4,
			Models:          8,
			Routes:          6,
		},
	}

	// Build AI Runtime data
	aiRuntime := AIRuntimeInfo{
		Providers: []AIRuntimeProviderInfo{
			{ID: "anthropic", Type: "anthropic", DefaultModel: "claude-3-7-sonnet", Models: []string{"claude-3-7-sonnet", "claude-3-5-haiku"}},
			{ID: "google", Type: "google", DefaultModel: "gemini-2.0-flash", Models: []string{"gemini-2.0-flash", "gemini-2.5-pro"}},
			{ID: "openai", Type: "openai", DefaultModel: "gpt-4o", Models: []string{"gpt-4o", "gpt-4o-mini"}},
			{ID: "local", Type: "local", DefaultModel: "llama3.3", Models: []string{"llama3.3", "qwen2.5-coder"}, BaseURL: "http://localhost:11434"},
		},
		Models: []AIRuntimeModelInfo{
			{ConfiguredProviderID: "anthropic", VendorProviderID: "anthropic", ID: "claude-3-7-sonnet", Name: "Claude 3.7 Sonnet", Family: "claude-3", ContextWindow: 200000, MaxOutputTokens: 8192, InputModalities: []string{"text", "image"}, OutputModalities: []string{"text"}},
			{ConfiguredProviderID: "anthropic", VendorProviderID: "anthropic", ID: "claude-3-5-haiku", Name: "Claude 3.5 Haiku", Family: "claude-3", ContextWindow: 200000, MaxOutputTokens: 8192, InputModalities: []string{"text"}, OutputModalities: []string{"text"}},
			{ConfiguredProviderID: "google", VendorProviderID: "google", ID: "gemini-2.0-flash", Name: "Gemini 2.0 Flash", Family: "gemini-2", ContextWindow: 1000000, MaxOutputTokens: 8192, InputModalities: []string{"text", "image"}, OutputModalities: []string{"text"}},
			{ConfiguredProviderID: "google", VendorProviderID: "google", ID: "gemini-2.5-pro", Name: "Gemini 2.5 Pro", Family: "gemini-2", ContextWindow: 1000000, MaxOutputTokens: 8192, InputModalities: []string{"text", "image"}, OutputModalities: []string{"text"}},
			{ConfiguredProviderID: "openai", VendorProviderID: "openai", ID: "gpt-4o", Name: "GPT-4o", Family: "gpt-4", ContextWindow: 128000, MaxOutputTokens: 4096, InputModalities: []string{"text", "image"}, OutputModalities: []string{"text"}},
			{ConfiguredProviderID: "openai", VendorProviderID: "openai", ID: "gpt-4o-mini", Name: "GPT-4o Mini", Family: "gpt-4", ContextWindow: 128000, MaxOutputTokens: 4096, InputModalities: []string{"text"}, OutputModalities: []string{"text"}},
			{ConfiguredProviderID: "local", VendorProviderID: "ollama", ID: "llama3.3", Name: "Llama 3.3 70B", Family: "llama", ContextWindow: 128000, MaxOutputTokens: 4096, InputModalities: []string{"text"}, OutputModalities: []string{"text"}},
			{ConfiguredProviderID: "local", VendorProviderID: "ollama", ID: "qwen2.5-coder", Name: "Qwen 2.5 Coder 32B", Family: "qwen", ContextWindow: 32000, MaxOutputTokens: 4096, InputModalities: []string{"text"}, OutputModalities: []string{"text"}},
		},
		Routes: []AIRuntimeRouteInfo{
			{Provider: "anthropic", Model: "claude-3-7-sonnet", Mode: "code", Intent: "primary code and reasoning", RequiresReasoning: boolPtr(true), RequiresTools: boolPtr(true), AllowReasoning: boolPtr(true), AllowTools: boolPtr(true)},
			{Provider: "google", Model: "gemini-2.0-flash", Mode: "fast", Intent: "quick search and targeted edits", RequiresReasoning: boolPtr(false), RequiresTools: boolPtr(true), AllowTools: boolPtr(true)},
			{Provider: "openai", Model: "gpt-4o", Mode: "structured", Intent: "schema transforms and data parsing", RequiresReasoning: boolPtr(false), RequiresTools: boolPtr(false), AllowTools: boolPtr(true)},
			{Provider: "google", Model: "gemini-2.5-pro", Mode: "pro", Intent: "architecture and planning", RequiresReasoning: boolPtr(true), RequiresTools: boolPtr(true), AllowReasoning: boolPtr(true), AllowTools: boolPtr(true)},
			{Provider: "anthropic", Model: "claude-3-5-haiku", Mode: "triage", Intent: "quick triage and classification", RequiresReasoning: boolPtr(false), RequiresTools: boolPtr(false), AllowTools: boolPtr(true)},
			{Provider: "local", Model: "llama3.3", Mode: "offline", Intent: "airgapped processing", RequiresReasoning: boolPtr(false), RequiresTools: boolPtr(false)},
		},
	}

	// Build Catalog Models
	aiCatalog := []AIProviderCatalogInfo{
		{
			ProviderType:       "anthropic",
			VendorProviderID:   "anthropic",
			VendorProviderName: "Anthropic",
			FromCacheOnly:      true,
			LastFetchedAt:      clock.Add(-2 * time.Hour).Format(time.RFC3339),
			Models: []AIProviderCatalogModelInfo{
				{
					ID:                   "claude-3-7-sonnet",
					Name:                 "Claude 3.7 Sonnet",
					Family:               "claude-3",
					ContextWindow:        200000,
					MaxOutputTokens:      8192,
					InputModalities:      []string{"text", "image"},
					OutputModalities:     []string{"text"},
					SupportsTools:        true,
					SupportsReasoning:    true,
					SupportsAttachments:  true,
					InputCostUSDPerMTok:  floatPtr(3.0),
					OutputCostUSDPerMTok: floatPtr(15.0),
				},
				{
					ID:                   "claude-3-5-haiku",
					Name:                 "Claude 3.5 Haiku",
					Family:               "claude-3",
					ContextWindow:        200000,
					MaxOutputTokens:      8192,
					InputModalities:      []string{"text"},
					OutputModalities:     []string{"text"},
					SupportsTools:        true,
					SupportsReasoning:    false,
					SupportsAttachments:  false,
					InputCostUSDPerMTok:  floatPtr(0.8),
					OutputCostUSDPerMTok: floatPtr(4.0),
				},
			},
		},
		{
			ProviderType:       "google",
			VendorProviderID:   "google",
			VendorProviderName: "Google Cloud Vertex / AI Studio",
			FromCacheOnly:      true,
			LastFetchedAt:      clock.Add(-2 * time.Hour).Format(time.RFC3339),
			Models: []AIProviderCatalogModelInfo{
				{
					ID:                   "gemini-2.0-flash",
					Name:                 "Gemini 2.0 Flash",
					Family:               "gemini-2",
					ContextWindow:        1000000,
					MaxOutputTokens:      8192,
					InputModalities:      []string{"text", "image"},
					OutputModalities:     []string{"text"},
					SupportsTools:        true,
					SupportsReasoning:    true,
					SupportsAttachments:  true,
					InputCostUSDPerMTok:  floatPtr(0.1),
					OutputCostUSDPerMTok: floatPtr(0.4),
				},
				{
					ID:                   "gemini-2.5-pro",
					Name:                 "Gemini 2.5 Pro",
					Family:               "gemini-2",
					ContextWindow:        1000000,
					MaxOutputTokens:      8192,
					InputModalities:      []string{"text", "image"},
					OutputModalities:     []string{"text"},
					SupportsTools:        true,
					SupportsReasoning:    true,
					SupportsAttachments:  true,
					InputCostUSDPerMTok:  floatPtr(1.25),
					OutputCostUSDPerMTok: floatPtr(5.0),
				},
			},
		},
	}

	// Build Registry Profiles (~8 agents + 4 projects, mixed active/deprecated)
	registryProfiles := []RegistryProfileInfo{
		// 8 Agents
		{
			URN:              "msg://agent/agent-mux/agt_knoibzkhsk",
			Kind:             "agent",
			TetherInstanceID: "tether-main",
			DisplayName:      "sup-agent-os",
			Title:            "Agent-OS Run Supervisor",
			Role:             "supervisor",
			Description:      "Monitors run health, gate transitions, and unblocks agents across the team.",
			Avatar:           "https://avatar.nanite.cloud/sup-agent-os.png",
			Project:          "tether",
			Status:           "active",
			Callback:         &RegistryCallbackInfo{Scheme: "file", Target: "/home/chrispian/.tether/run/sup-agent-os.sock"},
			HealthStatus:     "healthy",
			LastSeenAt:       clock.Add(-2 * time.Minute).Format(time.RFC3339),
			HostAddress:      "127.0.0.1",
			LastUpdatedBy:    "sysop-ui",
			Capabilities:     []string{"session.read", "session.control", "message.write", "registry.read"},
			Skills: []RegistrySkillInfo{
				{Name: "run-orchestration", LearnedAt: "2026-09-10T12:00:00Z", Via: "bootstrap", Level: "expert"},
				{Name: "gate-monitoring", LearnedAt: "2026-09-10T12:00:00Z", Via: "bootstrap", Level: "expert"},
			},
			Links: []RegistryLinkInfo{
				{Kind: "repo", Target: "https://github.com/hollis-labs/agent-os"},
				{Kind: "doc", Target: "https://agent-os.nanite.cloud/briefs/supervisor"},
			},
			CreatedAt: clock.Add(-30 * 24 * time.Hour).Format(time.RFC3339),
			UpdatedAt: clock.Add(-10 * time.Minute).Format(time.RFC3339),
		},
		{
			URN:              "msg://agent/agent-mux/agt_slyrwdryt6",
			Kind:             "agent",
			TetherInstanceID: "tether-main",
			DisplayName:      "architect",
			Title:            "System Architect",
			Role:             "architect",
			Description:      "Designs wave decomposition, ADR alignments, and cross-monorepo interfaces.",
			Avatar:           "https://avatar.nanite.cloud/architect.png",
			Project:          "tether",
			Status:           "active",
			Callback:         &RegistryCallbackInfo{Scheme: "file", Target: "/home/chrispian/.tether/run/architect.sock"},
			HealthStatus:     "healthy",
			LastSeenAt:       clock.Add(-5 * time.Minute).Format(time.RFC3339),
			HostAddress:      "127.0.0.1",
			LastUpdatedBy:    "sysop-ui",
			Capabilities:     []string{"architecture.plan", "adr.author", "registry.write"},
			Skills: []RegistrySkillInfo{
				{Name: "system-design", LearnedAt: "2026-09-01T08:00:00Z", Via: "bootstrap", Level: "expert"},
			},
			Links: []RegistryLinkInfo{
				{Kind: "tesseract", Target: "tesseract://project/hollis-labs/memory/decisions"},
			},
			CreatedAt: clock.Add(-30 * 24 * time.Hour).Format(time.RFC3339),
			UpdatedAt: clock.Add(-20 * time.Minute).Format(time.RFC3339),
		},
		{
			URN:              "msg://agent/agent-mux/agt_h6i20mqrcn",
			Kind:             "agent",
			TetherInstanceID: "tether-main",
			DisplayName:      "launch-agent-os",
			Title:            "Agent-OS Execution Lead",
			Role:             "lead",
			Description:      "Chrispian's proxy: approves merges, releases, and directs next tasks.",
			Avatar:           "https://avatar.nanite.cloud/launch-agent-os.png",
			Project:          "tether",
			Status:           "active",
			Callback:         &RegistryCallbackInfo{Scheme: "file", Target: "/home/chrispian/.tether/run/lead.sock"},
			HealthStatus:     "healthy",
			LastSeenAt:       clock.Add(-1 * time.Minute).Format(time.RFC3339),
			HostAddress:      "127.0.0.1",
			LastUpdatedBy:    "sysop-ui",
			Capabilities:     []string{"pr.merge", "release.tag", "service.restart", "tangent.approve"},
			Skills: []RegistrySkillInfo{
				{Name: "release-management", LearnedAt: "2026-09-05T09:00:00Z", Via: "bootstrap", Level: "expert"},
			},
			Links: []RegistryLinkInfo{
				{Kind: "torque", Target: "https://torque.nanite.cloud"},
			},
			CreatedAt: clock.Add(-30 * 24 * time.Hour).Format(time.RFC3339),
			UpdatedAt: clock.Add(-5 * time.Minute).Format(time.RFC3339),
		},
		{
			URN:              "msg://agent/agent-mux/agt_d7rr0npkcj",
			Kind:             "agent",
			TetherInstanceID: "tether-main",
			DisplayName:      "launch-worker-1",
			Title:            "Worker-1 Orchestrator",
			Role:             "orchestrator",
			Description:      "Manages independent task worker assignments and execution on worker-1.",
			Avatar:           "https://avatar.nanite.cloud/launch-worker-1.png",
			Project:          "parallax",
			Status:           "active",
			Callback:         &RegistryCallbackInfo{Scheme: "file", Target: "/home/chrispian/.tether/run/worker-1.sock"},
			HealthStatus:     "healthy",
			LastSeenAt:       clock.Add(-3 * time.Minute).Format(time.RFC3339),
			HostAddress:      "worker-1",
			LastUpdatedBy:    "sysop-ui",
			Capabilities:     []string{"task.assign", "task.review", "worktree.manage"},
			Skills: []RegistrySkillInfo{
				{Name: "task-dispatch", LearnedAt: "2026-10-01T10:00:00Z", Via: "bootstrap", Level: "advanced"},
			},
			Links: []RegistryLinkInfo{
				{Kind: "assignment", Target: "/home/chrispian/dev/agent-os/team/assignments/parallax-tether-fixtures.md"},
			},
			CreatedAt: clock.Add(-10 * 24 * time.Hour).Format(time.RFC3339),
			UpdatedAt: clock.Add(-15 * time.Minute).Format(time.RFC3339),
		},
		{
			URN:              "msg://agent/agent-mux/agt_pdhoohh4tx",
			Kind:             "agent",
			TetherInstanceID: "tether-main",
			DisplayName:      "task-parallax-4",
			Title:            "Tether Fixtures Task Agent",
			Role:             "task",
			Description:      "Implements the tether-sysop/v1 fixture family and validation contracts.",
			Avatar:           "https://avatar.nanite.cloud/task-parallax-4.png",
			Project:          "parallax",
			Status:           "active",
			Callback:         &RegistryCallbackInfo{Scheme: "file", Target: "/home/chrispian/.tether/run/task-parallax-4.sock"},
			HealthStatus:     "healthy",
			LastSeenAt:       clock.Format(time.RFC3339),
			HostAddress:      "worker-1",
			LastUpdatedBy:    "sysop-ui",
			Capabilities:     []string{"fixture.generate", "fixture.validate", "git.commit"},
			Skills: []RegistrySkillInfo{
				{Name: "go-testing", LearnedAt: "2026-10-04T12:00:00Z", Via: "bootstrap", Level: "expert"},
				{Name: "contract-verification", LearnedAt: "2026-10-04T12:00:00Z", Via: "bootstrap", Level: "expert"},
			},
			Links: []RegistryLinkInfo{
				{Kind: "worktree", Target: "/home/chrispian/dev/hollis-labs/worktrees/parallax/CW-20261010-0098"},
			},
			CreatedAt: clock.Add(-2 * time.Hour).Format(time.RFC3339),
			UpdatedAt: clock.Format(time.RFC3339),
		},
		{
			URN:              "msg://agent/agent-mux/agt_wpc7vpvyyw",
			Kind:             "agent",
			TetherInstanceID: "tether-main",
			DisplayName:      "task-parallax-1",
			Title:            "Flux Fidelity Task Agent",
			Role:             "task",
			Description:      "Executes Flux chat card recreation and tokens fidelity verification.",
			Avatar:           "https://avatar.nanite.cloud/task-parallax-1.png",
			Project:          "parallax",
			Status:           "active",
			Callback:         &RegistryCallbackInfo{Scheme: "file", Target: "/home/chrispian/.tether/run/task-parallax-1.sock"},
			HealthStatus:     "healthy",
			LastSeenAt:       clock.Add(-7 * time.Minute).Format(time.RFC3339),
			HostAddress:      "worker-1",
			LastUpdatedBy:    "sysop-ui",
			Capabilities:     []string{"ui.recreation", "tokens.check"},
			Skills: []RegistrySkillInfo{
				{Name: "design-kit", LearnedAt: "2026-10-04T12:00:00Z", Via: "bootstrap", Level: "proficient"},
			},
			Links: []RegistryLinkInfo{
				{Kind: "worktree", Target: "/home/chrispian/dev/hollis-labs/worktrees/parallax/CW-20261010-0083"},
			},
			CreatedAt: clock.Add(-3 * time.Hour).Format(time.RFC3339),
			UpdatedAt: clock.Add(-10 * time.Minute).Format(time.RFC3339),
		},
		{
			URN:              "msg://agent/agent-mux/agt_olddeprecated1",
			Kind:             "agent",
			TetherInstanceID: "tether-main",
			DisplayName:      "task-legacy-runner",
			Title:            "Legacy Process Runner (Deprecated)",
			Role:             "task",
			Description:      "Pre-vNext raw process runner; replaced by sandboxed container executor.",
			Avatar:           "https://avatar.nanite.cloud/legacy.png",
			Project:          "tether",
			Status:           "deprecated", // Required deprecated status
			Callback:         &RegistryCallbackInfo{Scheme: "file", Target: "/home/chrispian/.tether/run/legacy.sock"},
			HealthStatus:     "inactive",
			LastSeenAt:       clock.Add(-14 * 24 * time.Hour).Format(time.RFC3339),
			HostAddress:      "agent-os",
			LastUpdatedBy:    "sysop-migration",
			Capabilities:     []string{"process.exec"},
			Skills: []RegistrySkillInfo{
				{Name: "bash-runner", LearnedAt: "2026-08-01T00:00:00Z", Via: "historical", Level: "deprecated"},
			},
			Links: []RegistryLinkInfo{
				{Kind: "adr", Target: "tesseract://project/tether/knowledge/adr/0049"},
			},
			CreatedAt: clock.Add(-60 * 24 * time.Hour).Format(time.RFC3339),
			UpdatedAt: clock.Add(-14 * 24 * time.Hour).Format(time.RFC3339),
		},
		{
			URN:              "msg://agent/agent-mux/agt_olddeprecated2",
			Kind:             "agent",
			TetherInstanceID: "tether-main",
			DisplayName:      "agent-shim-v1",
			Title:            "V1 Compatibility Shim (Deprecated)",
			Role:             "shim",
			Description:      "Early Wave-0 inter-runtime compatibility translator; retired per Clean Breaks policy.",
			Avatar:           "https://avatar.nanite.cloud/shim.png",
			Project:          "tangent",
			Status:           "deprecated", // Required deprecated status
			Callback:         &RegistryCallbackInfo{Scheme: "http", Target: "http://127.0.0.1:8999/shim"},
			HealthStatus:     "inactive",
			LastSeenAt:       clock.Add(-21 * 24 * time.Hour).Format(time.RFC3339),
			HostAddress:      "agent-os",
			LastUpdatedBy:    "sysop-migration",
			Capabilities:     []string{"wire.translate"},
			Skills: []RegistrySkillInfo{
				{Name: "format-conversion", LearnedAt: "2026-07-15T00:00:00Z", Via: "historical", Level: "deprecated"},
			},
			Links: []RegistryLinkInfo{
				{Kind: "adr", Target: "tesseract://project/tether/knowledge/adr/0050"},
			},
			CreatedAt: clock.Add(-75 * 24 * time.Hour).Format(time.RFC3339),
			UpdatedAt: clock.Add(-21 * 24 * time.Hour).Format(time.RFC3339),
		},

		// 4 Projects
		{
			URN:              "msg://project/hollis-labs/tether",
			Kind:             "project",
			TetherInstanceID: "tether-main",
			DisplayName:      "tether",
			Title:            "Tether Local Agent Session Control Plane",
			Role:             "runtime",
			Description:      "Local daemon owning session lifecycle, sandboxed execution, messaging, and proxy tools.",
			Avatar:           "https://avatar.nanite.cloud/proj-tether.png",
			Status:           "active",
			Callback:         &RegistryCallbackInfo{Scheme: "http", Target: "http://127.0.0.1:8947/api"},
			HealthStatus:     "healthy",
			LastSeenAt:       clock.Add(-1 * time.Minute).Format(time.RFC3339),
			HostAddress:      "127.0.0.1",
			LastUpdatedBy:    "sysop-ui",
			Capabilities:     []string{"session.control", "mcp.proxy", "messaging.broker", "ai.gateway"},
			Links: []RegistryLinkInfo{
				{Kind: "repo", Target: "https://github.com/hollis-labs/tether"},
				{Kind: "docs", Target: "https://tether.nanite.cloud"},
			},
			CreatedAt: clock.Add(-40 * 24 * time.Hour).Format(time.RFC3339),
			UpdatedAt: clock.Add(-5 * time.Minute).Format(time.RFC3339),
		},
		{
			URN:              "msg://project/hollis-labs/parallax",
			Kind:             "project",
			TetherInstanceID: "tether-main",
			DisplayName:      "parallax",
			Title:            "Parallax UI & Fixture Framework",
			Role:             "application",
			Description:      "Component showcase, deterministic presentation fixture generators, and recreation workbench.",
			Avatar:           "https://avatar.nanite.cloud/proj-parallax.png",
			Status:           "active",
			Callback:         &RegistryCallbackInfo{Scheme: "http", Target: "http://127.0.0.1:5173"},
			HealthStatus:     "healthy",
			LastSeenAt:       clock.Format(time.RFC3339),
			HostAddress:      "worker-1",
			LastUpdatedBy:    "sysop-ui",
			Capabilities:     []string{"fixtures.generate", "components.showcase", "stories.render"},
			Links: []RegistryLinkInfo{
				{Kind: "repo", Target: "https://github.com/hollis-labs/parallax"},
			},
			CreatedAt: clock.Add(-30 * 24 * time.Hour).Format(time.RFC3339),
			UpdatedAt: clock.Format(time.RFC3339),
		},
		{
			URN:              "msg://project/hollis-labs/tangent",
			Kind:             "project",
			TetherInstanceID: "tether-main",
			DisplayName:      "tangent",
			Title:            "Tangent Agent Workspace & Inbox",
			Role:             "application",
			Description:      "Desktop UI for agent oversight, approval queues, messaging turns, and review workflows.",
			Avatar:           "https://avatar.nanite.cloud/proj-tangent.png",
			Status:           "active",
			Callback:         &RegistryCallbackInfo{Scheme: "http", Target: "http://127.0.0.1:8080"},
			HealthStatus:     "healthy",
			LastSeenAt:       clock.Add(-8 * time.Minute).Format(time.RFC3339),
			HostAddress:      "127.0.0.1",
			LastUpdatedBy:    "sysop-ui",
			Capabilities:     []string{"inbox.render", "approval.review", "plugins.host"},
			Links: []RegistryLinkInfo{
				{Kind: "repo", Target: "https://github.com/hollis-labs/tangent"},
			},
			CreatedAt: clock.Add(-30 * 24 * time.Hour).Format(time.RFC3339),
			UpdatedAt: clock.Add(-12 * time.Minute).Format(time.RFC3339),
		},
		{
			URN:              "msg://project/hollis-labs/legacy-archived",
			Kind:             "project",
			TetherInstanceID: "tether-main",
			DisplayName:      "legacy-prototype",
			Title:            "Early Wave-0 Monolithic Runner (Archived)",
			Role:             "prototype",
			Description:      "Historical prototype codebase; archived and replaced by modular substrate services.",
			Avatar:           "https://avatar.nanite.cloud/proj-archived.png",
			Status:           "deprecated", // Required deprecated project
			Callback:         &RegistryCallbackInfo{Scheme: "file", Target: "/dev/null"},
			HealthStatus:     "inactive",
			LastSeenAt:       clock.Add(-30 * 24 * time.Hour).Format(time.RFC3339),
			HostAddress:      "agent-os",
			LastUpdatedBy:    "sysop-migration",
			Capabilities:     []string{},
			Links: []RegistryLinkInfo{
				{Kind: "archive", Target: "https://github.com/hollis-labs/legacy-prototype"},
			},
			CreatedAt: clock.Add(-90 * 24 * time.Hour).Format(time.RFC3339),
			UpdatedAt: clock.Add(-30 * 24 * time.Hour).Format(time.RFC3339),
		},
	}

	// Build Overview Data (Standard Profile)
	overview := OverviewInfo{
		Sessions: OverviewSessions{
			Total:       len(ops.Runs),
			Running:     sessionRunning,
			Ended:       sessionEnded,
			SuccessPct:  sessionSuccessPct,
			FailurePct:  sessionFailurePct,
			AvgSeconds:  sessionAvgSec,
			Recent24h:   len(ops.Runs),
			Trend:       bucketCounts(sessionTimes, 24),
			ByState:     topN(sessionStateCounts, 6),
			ByProvider:  topN(sessionProviderCounts, 6),
			ByProject:   topN(sessionProjectCounts, 6),
		},
		ToolCalls: OverviewToolCalls{
			Total:      len(toolCalls),
			OK:         len(toolCalls) - len(errorCounts),
			Errors:     len(errorCounts),
			SuccessPct: (len(toolCalls) - len(errorCounts)) * 100 / len(toolCalls),
			P50Ms:      p50Ms,
			P95Ms:      p95Ms,
			AvgMs:      avgMs,
			Recent1h:   toolRecent1h,
			SlowCalls:  slowCalls,
			Sessions:   len(toolSessions),
			TopTools:   topN(toolCounts, 5),
			TopErrors:  topN(errorCounts, 5),
			ByServer:   topN(serverCounts, 6),
			Latency:    orderedLatencyCounts(toolLatencyCounts),
			Trend:      bucketCounts(toolTimes, 24),
		},
		Messages: OverviewMessages{
			Total:     24,
			Unread:    0,
			Archived:  4,
			Recent24h: 24,
			ByKind:    topN(messageKinds, 6),
			ByScope:   topN(messageScopes, 6),
			Trend:     bucketCounts(messageTimes, 24),
		},
		Events: OverviewEvents{
			Total:     len(events),
			Recent1h:  22,
			LatestSeq: int64(len(events)),
			ByScope:   topN(eventScopeCounts, 6),
			ByKind:    topN(eventKindCounts, 8),
			Trend:     bucketCounts(eventTimes, 24),
		},
		AI: OverviewAI{
			ConfiguredProviders: 4,
			EnabledProviders:    3,
			Routes:              6,
			Requests:            140,
			Successes:           136,
			Errors:              4,
			BudgetRejections:    1,
			InputTokens:         384000,
			OutputTokens:        96000,
			EstimatedCostUSD:    1.84,
			ByProvider: []NameCount{
				{Name: "anthropic", Count: 70},
				{Name: "google", Count: 45},
				{Name: "openai", Count: 25},
			},
			ByModel: []NameCount{
				{Name: "claude-3-7-sonnet", Count: 55},
				{Name: "gemini-2.0-flash", Count: 30},
				{Name: "gpt-4o", Count: 20},
				{Name: "claude-3-5-haiku", Count: 15},
				{Name: "gemini-2.5-pro", Count: 15},
				{Name: "gpt-4o-mini", Count: 5},
			},
			ByEventType: []NameCount{
				{Name: "completion", Count: 95},
				{Name: "chat", Count: 40},
				{Name: "embeddings", Count: 5},
				{Name: "refusal", Count: 1},
				{Name: "budget_rejection", Count: 1},
			},
			Trend: bucketCounts(aiTimes, 24),
		},
		Catalog: OverviewCatalog{
			Projects:  4,
			Agents:    8,
			Providers: 4,
			Launches:  8,
		},
		Health: HealthInfo{
			Status:      "ok",
			CatalogRoot: "/home/chrispian/.tether/catalog",
		},
	}

	// Build Overview Variants
	// 1. Blocked Health variant
	blockedOverview := overview
	blockedOverview.Health = HealthInfo{
		Status:      "blocked",
		CatalogRoot: "/home/chrispian/.tether/catalog",
		Error:       "catalog root inaccessible: permission denied /home/chrispian/.tether/catalog",
	}

	// 2. Degraded Reliability variant (success < 95%, unread > 0, slow calls > 0, session success < 50%)
	degradedOverview := overview
	degradedOverview.ToolCalls.OK = 27
	degradedOverview.ToolCalls.Errors = 3
	degradedOverview.ToolCalls.SuccessPct = 90 // < 95% triggers red status in intelligence panel
	degradedOverview.ToolCalls.SlowCalls = 4
	degradedOverview.Messages.Unread = 7       // > 0 triggers inbox status in intelligence panel
	degradedOverview.Sessions.SuccessPct = 45  // < 50% triggers blocked status in intelligence panel
	degradedOverview.Sessions.FailurePct = 55
	degradedOverview.Health.Status = "degraded"
	degradedOverview.Health.Error = "proxy event error rate above threshold (10%)"

	// 3. Combined Adverse variant (both blocked health and degraded reliability)
	combinedOverview := degradedOverview
	combinedOverview.Health.Status = "blocked"
	combinedOverview.Health.Error = "catalog corrupted: unexpected EOF in provider schema"

	variants := map[string]OverviewInfo{
		"blocked-health":       blockedOverview,
		"degraded-reliability": degradedOverview,
		"combined-adverse":      combinedOverview,
	}

	return TetherSysopFixture{
		Version:           "tether-sysop/v1",
		Generator:         "parallax/v10",
		OperationsVersion: ops.Version,
		Seed:              4421,
		Clock:             clock.Format(time.RFC3339),
		ObservedSince:     coverage.Format(time.RFC3339),
		Overview:          overview,
		OverviewVariants:  variants,
		AI: TetherSysopAIFixture{
			Settings: aiSettings,
			Runtime:  aiRuntime,
			Usage:    aiUsage,
			Audit: AIAuditInfo{
				Events: auditEvents,
				Count:  len(auditEvents),
			},
			Budgets: AIBudgetsInfo{
				Budgets: aiBudgets,
				Count:   len(aiBudgets),
			},
			Catalog: aiCatalog,
		},
		Activity: TetherSysopActivityFixture{
			Events: EventsInfo{
				Events: events,
				Total:  len(events),
			},
			ToolCalls: ToolCallsInfo{
				ToolCalls: toolCalls,
				Total:     len(toolCalls),
			},
			Scopes: scopeAggregates,
		},
		Registry: RegistryInfo{
			Rows: registryProfiles,
		},
		Events:        events,
		ToolCalls:     toolCalls,
		Scopes:        scopeAggregates,
		RegistryRows:  registryProfiles,
		AIProviders:   aiProviders,
		AIRoutes:      aiRoutes,
		AIAuditEvents: auditEvents,
		AIBudgets:     aiBudgets,
	}
}

// WriteTetherSysop generates and formats the tether-sysop/v1 JSON fixture file.
func WriteTetherSysop(path string) error {
	fixture := GenerateTetherSysop()
	b, err := json.MarshalIndent(fixture, "", "  ")
	if err != nil {
		return fmt.Errorf("marshal tether-sysop fixture: %w", err)
	}
	return os.WriteFile(path, append(b, '\n'), 0644)
}
