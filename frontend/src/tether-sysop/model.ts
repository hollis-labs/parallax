import artifact from "../fixtures/tether-sysop.json" with { type: "json" }

export const tetherSysopFixture = artifact

export interface HealthInfo {
  status: string
  catalog_root: string
  error?: string
}

export interface NameCount {
  name: string
  count: number
}

export interface OverviewSessions {
  total: number
  running: number
  ended: number
  success_pct: number
  failure_pct: number
  avg_seconds: number
  recent_24h: number
  trend: number[]
  by_state: NameCount[]
  by_provider: NameCount[]
  by_project: NameCount[]
}

export interface OverviewToolCalls {
  total: number
  ok: number
  errors: number
  success_pct: number
  p50_ms: number
  p95_ms: number
  avg_ms: number
  recent_1h: number
  slow_calls: number
  sessions: number
  top_tools: NameCount[]
  top_errors: NameCount[]
  by_server: NameCount[]
  latency: NameCount[]
  trend: number[]
}

export interface OverviewMessages {
  total: number
  unread: number
  archived: number
  recent_24h: number
  by_kind: NameCount[]
  by_scope: NameCount[]
  trend: number[]
}

export interface OverviewEvents {
  total: number
  recent_1h: number
  latest_seq: number
  by_scope: NameCount[]
  by_kind: NameCount[]
  trend: number[]
}

export interface OverviewAI {
  configured_providers: number
  enabled_providers: number
  routes: number
  requests: number
  successes: number
  errors: number
  budget_rejections: number
  input_tokens: number
  output_tokens: number
  estimated_cost_usd: number
  by_provider: NameCount[]
  by_model: NameCount[]
  by_event_type: NameCount[]
  trend: number[]
}

export interface OverviewCatalog {
  projects: number
  agents: number
  providers: number
  launches: number
}

export interface OverviewInfo {
  sessions: OverviewSessions
  tool_calls: OverviewToolCalls
  messages: OverviewMessages
  events: OverviewEvents
  ai: OverviewAI
  catalog: OverviewCatalog
  health: HealthInfo
  error?: string
}

export type OverviewVariantKey =
  | "standard"
  | "blocked-health"
  | "degraded-reliability"
  | "combined-adverse"

export interface AIUsageBudgetPolicyInfo {
  max_cost_usd?: number
  window?: string
  scope?: string
}

export interface AIPolicyInfo {
  allow_reasoning?: boolean
  allow_tools?: boolean
  allow_attachments?: boolean
  max_output_tokens?: number
  max_cost_usd?: number
  usage_budget?: AIUsageBudgetPolicyInfo
}

export interface AIProviderSettingsInfo {
  id: string
  type: string
  model?: string
  models?: string[]
  default_model?: string
  secret_ref?: string
  base_url?: string
  enabled: boolean
  policy?: AIPolicyInfo
}

export interface AIRouteSettingsInfo {
  provider: string
  model: string
  mode?: string
  intent?: string
  requires_reasoning?: boolean
  requires_tools?: boolean
  policy?: AIPolicyInfo
}

export interface AIConfigInfo {
  policy?: AIPolicyInfo
  default_provider_order?: string[]
  providers: AIProviderSettingsInfo[]
  routes: AIRouteSettingsInfo[]
}

export interface AISettingsRuntimeInfo {
  daemon_reachable: boolean
  providers: number
  models: number
  routes: number
  last_error?: string
}

export interface AISettingsInfo {
  config: AIConfigInfo
  runtime: AISettingsRuntimeInfo
  error?: string
}

export interface AIRuntimeProviderInfo {
  id: string
  type: string
  default_model?: string
  models?: string[]
  base_url?: string
}

export interface AIRuntimeModelInfo {
  configured_provider_id: string
  vendor_provider_id: string
  id: string
  name?: string
  family?: string
  context_window?: number
  max_output_tokens?: number
  input_modalities?: string[]
  output_modalities?: string[]
}

export interface AIRuntimeRouteInfo {
  provider: string
  model: string
  mode?: string
  intent?: string
  requires_reasoning?: boolean
  requires_tools?: boolean
  allow_reasoning?: boolean
  allow_tools?: boolean
  allow_attachments?: boolean
  max_output_tokens?: number
  max_cost_usd?: number
  usage_budget?: AIUsageBudgetPolicyInfo
}

export interface AIRuntimeInfo {
  providers: AIRuntimeProviderInfo[]
  models: AIRuntimeModelInfo[]
  routes: AIRuntimeRouteInfo[]
  error?: string
}

export interface AIUsageBreakdownInfo {
  key: string
  requests: number
  successes: number
  errors: number
  latency_ms: number
  input_tokens?: number
  output_tokens?: number
  cache_read_tokens?: number
  cache_write_tokens?: number
  reasoning_tokens?: number
  estimated_cost_usd?: number
}

export interface AIUsageSummaryInfo {
  requests: number
  successes: number
  errors: number
  latency_ms: number
  input_tokens?: number
  output_tokens?: number
  cache_read_tokens?: number
  cache_write_tokens?: number
  reasoning_tokens?: number
  estimated_cost_usd?: number
  by_provider?: AIUsageBreakdownInfo[]
  by_model?: AIUsageBreakdownInfo[]
  by_operation?: AIUsageBreakdownInfo[]
}

export interface AIUsageInfo {
  summary: AIUsageSummaryInfo
  error?: string
}

export interface AIAuditEventInfo {
  id: number
  event_type: string
  request_id?: string
  session_id?: string
  caller_id?: string
  operation: string
  provider?: string
  model?: string
  policy_version?: string
  latency_ms: number
  success: boolean
  refusal?: string
  error?: string
  input_tokens?: number
  output_tokens?: number
  cache_read_tokens?: number
  cache_write_tokens?: number
  reasoning_tokens?: number
  estimated_cost_usd?: number
  request_summary?: string
  response_summary?: string
  timestamp: string
}

export interface AIAuditInfo {
  events: AIAuditEventInfo[]
  count: number
  error?: string
}

export interface AIBudgetInfo {
  provider: string
  model: string
  mode?: string
  intent?: string
  usage_budget: AIUsageBudgetPolicyInfo
  window_start: string
  spent_cost_usd?: number
  remaining_cost_usd?: number
  exhausted: boolean
  filter: {
    provider?: string
    model?: string
    session_id?: string
    caller_id?: string
    operation?: string
  }
  error?: string
}

export interface AIBudgetsInfo {
  budgets: AIBudgetInfo[]
  count: number
  error?: string
}

export interface AIProviderCatalogModelInfo {
  id: string
  name?: string
  family?: string
  context_window?: number
  max_output_tokens?: number
  input_modalities?: string[]
  output_modalities?: string[]
  supports_tools?: boolean
  supports_reasoning?: boolean
  supports_attachments?: boolean
  input_cost_usd_per_mtok?: number
  output_cost_usd_per_mtok?: number
}

export interface AIProviderCatalogInfo {
  provider_type: string
  vendor_provider_id?: string
  vendor_provider_name?: string
  models: AIProviderCatalogModelInfo[]
  last_fetched_at?: string
  from_cache_only?: boolean
  error?: string
}

export interface EventInfo {
  seq: number
  at: string
  scope: string
  session_id?: string
  kind: string
  payload?: string
}

export interface EventsInfo {
  events: EventInfo[]
  total: number
  error?: string
}

export interface ToolCallInfo {
  id: number
  session_id?: string
  server?: string
  tool_name: string
  args_schema_fp?: string
  duration_ms: number
  ok: boolean
  error?: string
  timestamp: string
  payload?: string
}

export interface ToolCallsInfo {
  tool_calls: ToolCallInfo[]
  total: number
  error?: string
}

export interface ActivityScopeAggregate {
  scope: string
  event_count: number
  session_count: number
  kind_count: number
  latest_at: string
  latest_kind: string
  latest_seq: number
  kinds: NameCount[]
}

export interface RegistryCallbackInfo {
  scheme: string
  target: string
}

export interface RegistrySkillInfo {
  name: string
  learned_at: string
  via?: string
  level?: string
}

export interface RegistryLinkInfo {
  kind: string
  target: string
}

export interface RegistryProfileInfo {
  urn: string
  kind: "agent" | "project" | string
  tether_instance_id: string
  display_name: string
  title?: string
  role?: string
  description?: string
  avatar?: string
  project?: string
  status: string
  callback?: RegistryCallbackInfo
  cached_at?: string
  health_status?: string
  last_seen_at?: string
  host_address?: string
  last_updated_by?: string
  capabilities?: string[]
  skills?: RegistrySkillInfo[]
  links?: RegistryLinkInfo[]
  created_at: string
  updated_at: string
}

export interface RegistryInfo {
  rows: RegistryProfileInfo[]
  error?: string
}

export interface TetherSysopModel {
  overview: (variant?: OverviewVariantKey) => OverviewInfo
  ai: () => typeof artifact.ai
  activity: () => typeof artifact.activity
  registry: (filter?: {
    kind?: "agent" | "project" | "all"
    status?: "active" | "deprecated" | "all"
    query?: string
  }) => RegistryProfileInfo[]
  mockApi: (variant?: OverviewVariantKey) => TetherSysopApi
}

export interface TetherSysopApi {
  getOverview: () => Promise<OverviewInfo>
  getAISettings: () => Promise<AISettingsInfo>
  getAIRuntime: () => Promise<AIRuntimeInfo>
  getAIUsage: () => Promise<AIUsageInfo>
  getAIAudit: () => Promise<AIAuditInfo>
  getAIBudgets: () => Promise<AIBudgetsInfo>
  getAICatalogModels: (providerType?: string) => Promise<AIProviderCatalogInfo>
  getEvents: () => Promise<EventsInfo>
  getToolCalls: () => Promise<ToolCallsInfo>
  getRegistry: (params?: { kind?: string; status?: string }) => Promise<RegistryInfo>
}

export function overviewModel(variant: OverviewVariantKey = "standard"): OverviewInfo {
  if (variant === "standard" || !variant) {
    return artifact.overview as OverviewInfo
  }
  const custom = (artifact.overviewVariants as Record<string, OverviewInfo>)[variant]
  return custom ?? (artifact.overview as OverviewInfo)
}

export function aiModel() {
  return artifact.ai
}

export function activityModel() {
  return artifact.activity
}

export function registryModel(filter?: {
  kind?: "agent" | "project" | "all"
  status?: "active" | "deprecated" | "all"
  query?: string
}): RegistryProfileInfo[] {
  let rows = artifact.registry.rows as RegistryProfileInfo[]
  if (filter?.kind && filter.kind !== "all") {
    rows = rows.filter((r) => r.kind === filter.kind)
  }
  if (filter?.status && filter.status !== "all") {
    rows = rows.filter((r) => r.status === filter.status)
  }
  if (filter?.query?.trim()) {
    const q = filter.query.trim().toLowerCase()
    rows = rows.filter(
      (r) =>
        r.display_name.toLowerCase().includes(q) ||
        r.urn.toLowerCase().includes(q) ||
        r.title?.toLowerCase().includes(q) ||
        r.role?.toLowerCase().includes(q) ||
        r.project?.toLowerCase().includes(q),
    )
  }
  return rows
}

export function createTetherSysopMockApi(variant: OverviewVariantKey = "standard"): TetherSysopApi {
  return {
    getOverview: async () => overviewModel(variant),
    getAISettings: async () => artifact.ai.settings as AISettingsInfo,
    getAIRuntime: async () => artifact.ai.runtime as AIRuntimeInfo,
    getAIUsage: async () => artifact.ai.usage as AIUsageInfo,
    getAIAudit: async () => artifact.ai.audit as AIAuditInfo,
    getAIBudgets: async () => artifact.ai.budgets as AIBudgetsInfo,
    getAICatalogModels: async (providerType?: string) => {
      const catalogs = artifact.ai.catalog as AIProviderCatalogInfo[]
      if (!providerType) return catalogs[0] ?? { provider_type: "", models: [] }
      return (
        catalogs.find((c) => c.provider_type === providerType) ?? {
          provider_type: providerType,
          models: [],
        }
      )
    },
    getEvents: async () => artifact.activity.events as EventsInfo,
    getToolCalls: async () => artifact.activity.tool_calls as ToolCallsInfo,
    getRegistry: async (params?: { kind?: string; status?: string }) => {
      const rows = registryModel({
        kind: params?.kind as "agent" | "project" | undefined,
        status: params?.status as "active" | "deprecated" | undefined,
      })
      return { rows }
    },
  }
}
