import {
  Button,
  type ColumnDef,
  Combobox,
  CopyableId,
  cn,
  DetailDialog,
  DetailSection,
  EmptyState,
  Pill,
  TransferList,
} from "@hollis-labs/design-components"
import { DataTable } from "@hollis-labs/kit-dashboard/data"
import { ListPageLayout, TabStrip, type TabStripItem } from "@hollis-labs/kit-dashboard/layout"
import { StatusBadge, type SummaryCard, SummaryCards } from "@hollis-labs/kit-dashboard/ui"

export interface TransferListItem {
  value: string
  label: string
  description?: string
  meta?: string
  keywords?: string[]
}

import {
  Bot,
  BrainCircuit,
  CircleDollarSign,
  Pencil,
  Plus,
  RefreshCw,
  Route,
  Shield,
  Trash2,
} from "lucide-react"
import {
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import {
  type AIAuditEventInfo,
  type AIAuditInfo,
  type AIBudgetInfo,
  type AIBudgetsInfo,
  type AIConfigInfo,
  type AIPolicyInfo,
  type AIProviderCatalogInfo,
  type AIProviderCatalogModelInfo,
  type AIProviderSettingsInfo,
  type AIRouteSettingsInfo,
  type AIRuntimeInfo,
  type AISettingsInfo,
  type AIUsageBreakdownInfo,
  type AIUsageBudgetPolicyInfo,
  type AIUsageInfo,
  createTetherSysopMockApi,
  type OverviewVariantKey,
  tetherSysopFixture,
} from "./model"
import "./tether-ai.css"

export type AITabKey = "config" | "providers" | "routes" | "runtime" | "usage" | "audit" | "budgets"

type BoolSelect = "" | "true" | "false"

type DetailView =
  | { kind: "provider"; item: AIProviderSettingsInfo }
  | { kind: "route"; item: AIRouteSettingsInfo }
  | { kind: "audit"; item: AIAuditEventInfo }
  | { kind: "budget"; item: AIBudgetInfo }

interface PolicyFormState {
  allowReasoning: BoolSelect
  allowTools: BoolSelect
  allowAttachments: BoolSelect
  maxOutputTokens: string
  maxCostUSD: string
  usageBudgetMaxCostUSD: string
  usageBudgetWindow: string
  usageBudgetScope: string
}

interface ProviderFormState {
  originalID?: string
  id: string
  type: string
  model: string
  models: string[]
  defaultModel: string
  secretRef: string
  baseURL: string
  enabled: boolean
  policy: PolicyFormState
}

interface RouteFormState {
  originalKey?: string
  provider: string
  model: string
  mode: string
  intent: string
  requiresReasoning: BoolSelect
  requiresTools: BoolSelect
  policy: PolicyFormState
}

const REF_TIME_MS = new Date("2026-10-04T14:30:00Z").getTime()

export function formatRelativeTime(timestamp?: string | null): string {
  if (!timestamp) return "—"
  const time = new Date(timestamp).getTime()
  if (Number.isNaN(time)) return timestamp
  const diffSec = Math.max(0, Math.floor((REF_TIME_MS - time) / 1000))
  if (diffSec < 60) return `${diffSec}s ago`
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

function _splitList(raw: string): string[] {
  return raw
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function boolToSelect(value?: boolean): BoolSelect {
  if (value === true) return "true"
  if (value === false) return "false"
  return ""
}

function selectToBool(value: BoolSelect): boolean | undefined {
  if (value === "true") return true
  if (value === "false") return false
  return undefined
}

function parseOptionalNumber(raw: string): number | undefined {
  const trimmed = raw.trim()
  if (!trimmed) return undefined
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : undefined
}

function emptyPolicyForm(): PolicyFormState {
  return {
    allowReasoning: "",
    allowTools: "",
    allowAttachments: "",
    maxOutputTokens: "",
    maxCostUSD: "",
    usageBudgetMaxCostUSD: "",
    usageBudgetWindow: "",
    usageBudgetScope: "",
  }
}

function policyToForm(policy?: AIPolicyInfo): PolicyFormState {
  return {
    allowReasoning: boolToSelect(policy?.allow_reasoning),
    allowTools: boolToSelect(policy?.allow_tools),
    allowAttachments: boolToSelect(policy?.allow_attachments),
    maxOutputTokens: policy?.max_output_tokens ? String(policy.max_output_tokens) : "",
    maxCostUSD: policy?.max_cost_usd ? String(policy.max_cost_usd) : "",
    usageBudgetMaxCostUSD: policy?.usage_budget?.max_cost_usd
      ? String(policy.usage_budget.max_cost_usd)
      : "",
    usageBudgetWindow: policy?.usage_budget?.window ?? "",
    usageBudgetScope: policy?.usage_budget?.scope ?? "",
  }
}

function formToPolicy(form: PolicyFormState): AIPolicyInfo | undefined {
  const usageBudget: AIUsageBudgetPolicyInfo | undefined =
    form.usageBudgetMaxCostUSD.trim() ||
    form.usageBudgetWindow.trim() ||
    form.usageBudgetScope.trim()
      ? {
          max_cost_usd: parseOptionalNumber(form.usageBudgetMaxCostUSD),
          window: form.usageBudgetWindow.trim() || undefined,
          scope: form.usageBudgetScope.trim() || undefined,
        }
      : undefined
  const policy: AIPolicyInfo = {
    allow_reasoning: selectToBool(form.allowReasoning),
    allow_tools: selectToBool(form.allowTools),
    allow_attachments: selectToBool(form.allowAttachments),
    max_output_tokens: parseOptionalNumber(form.maxOutputTokens),
    max_cost_usd: parseOptionalNumber(form.maxCostUSD),
    usage_budget: usageBudget,
  }
  const hasValue = Object.values(policy).some((value) => value !== undefined)
  return hasValue ? policy : undefined
}

function emptyProviderForm(): ProviderFormState {
  return {
    id: "",
    type: "anthropic",
    model: "",
    models: [],
    defaultModel: "",
    secretRef: "",
    baseURL: "",
    enabled: true,
    policy: emptyPolicyForm(),
  }
}

function providerToForm(provider: AIProviderSettingsInfo): ProviderFormState {
  return {
    originalID: provider.id,
    id: provider.id,
    type: provider.type,
    model: provider.model ?? "",
    models: provider.models ?? [],
    defaultModel: provider.default_model ?? "",
    secretRef: provider.secret_ref ?? "",
    baseURL: provider.base_url ?? "",
    enabled: provider.enabled,
    policy: policyToForm(provider.policy),
  }
}

function _formToProvider(form: ProviderFormState): AIProviderSettingsInfo {
  const models = form.models.map((item) => item.trim()).filter(Boolean)
  return {
    id: form.id.trim(),
    type: form.type.trim(),
    model: form.model.trim() || undefined,
    models: models.length > 0 ? models : undefined,
    default_model: form.defaultModel.trim() || undefined,
    secret_ref: form.secretRef.trim() || undefined,
    base_url: form.baseURL.trim() || undefined,
    enabled: form.enabled,
    policy: formToPolicy(form.policy),
  }
}

function compactTokenCount(value?: number): string | null {
  if (!value) return null
  if (value >= 1_000_000)
    return `${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M ctx`
  if (value >= 1_000) return `${(value / 1_000).toFixed(value % 1_000 === 0 ? 0 : 1)}K ctx`
  return `${value} ctx`
}

function modelCatalogDescription(model: AIProviderCatalogModelInfo): string {
  const parts = [model.name, model.family].filter(Boolean)
  return parts.join(" · ")
}

function modelCatalogMeta(model: AIProviderCatalogModelInfo): string {
  const parts: string[] = []
  const context = compactTokenCount(model.context_window)
  if (context) parts.push(context)
  if (model.supports_tools) parts.push("tools")
  if (model.supports_reasoning) parts.push("reasoning")
  if (model.supports_attachments) parts.push("attachments")
  if (model.input_modalities?.length) parts.push(`in ${model.input_modalities.join("/")}`)
  return parts.join(" · ")
}

function fallbackModelItem(id: string) {
  return {
    value: id,
    label: id,
    description: "Custom model ID",
    meta: "manual",
    keywords: [id],
  }
}

function routeKey(route: AIRouteSettingsInfo): string {
  return [route.provider, route.model, route.mode ?? "", route.intent ?? ""].join("::")
}

function emptyRouteForm(): RouteFormState {
  return {
    provider: "",
    model: "",
    mode: "",
    intent: "",
    requiresReasoning: "",
    requiresTools: "",
    policy: emptyPolicyForm(),
  }
}

function routeToForm(route: AIRouteSettingsInfo): RouteFormState {
  return {
    originalKey: routeKey(route),
    provider: route.provider,
    model: route.model,
    mode: route.mode ?? "",
    intent: route.intent ?? "",
    requiresReasoning: boolToSelect(route.requires_reasoning),
    requiresTools: boolToSelect(route.requires_tools),
    policy: policyToForm(route.policy),
  }
}

function _formToRoute(form: RouteFormState): AIRouteSettingsInfo {
  return {
    provider: form.provider.trim(),
    model: form.model.trim(),
    mode: form.mode.trim() || undefined,
    intent: form.intent.trim() || undefined,
    requires_reasoning: selectToBool(form.requiresReasoning),
    requires_tools: selectToBool(form.requiresTools),
    policy: formToPolicy(form.policy),
  }
}

function compactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}

function formatUSD(value?: number): string {
  if (!value) return "$0.00"
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value < 1 ? 3 : 2,
    maximumFractionDigits: value < 1 ? 3 : 2,
  }).format(value)
}

function toneForOptionalBool(value?: boolean): "success" | "warning" | "neutral" {
  if (value === true) return "success"
  if (value === false) return "warning"
  return "neutral"
}

function boolLabel(value?: boolean, trueLabel = "allow", falseLabel = "deny"): string {
  if (value === true) return trueLabel
  if (value === false) return falseLabel
  return "inherit"
}

function policySummary(policy?: AIPolicyInfo): string {
  if (!policy) return "inherit"
  const parts: string[] = []
  if (policy.allow_tools !== undefined) parts.push(`tools ${policy.allow_tools ? "on" : "off"}`)
  if (policy.allow_reasoning !== undefined)
    parts.push(`reasoning ${policy.allow_reasoning ? "on" : "off"}`)
  if (policy.allow_attachments !== undefined)
    parts.push(`attachments ${policy.allow_attachments ? "on" : "off"}`)
  if (policy.max_output_tokens) parts.push(`max out ${policy.max_output_tokens}`)
  if (policy.max_cost_usd) parts.push(`max cost ${formatUSD(policy.max_cost_usd)}`)
  if (policy.usage_budget?.max_cost_usd) {
    parts.push(
      `budget ${formatUSD(policy.usage_budget.max_cost_usd)}/${policy.usage_budget.window ?? "window"}`,
    )
  }
  return parts.length > 0 ? parts.join(" · ") : "inherit"
}

function DetailField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="contents">
      <dt className="truncate text-text-subtle">{label}</dt>
      <dd className="break-words text-text-soft">{children}</dd>
    </div>
  )
}

function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="block">
      <span className="mb-1 block text-label uppercase tracking-label text-text-subtle">
        {label}
      </span>
      {children}
    </div>
  )
}

function MetricCard({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <div className="tether-metric-card">
      <div className="tether-metric-label">{label}</div>
      <div className="tether-metric-value">{value}</div>
      {sub ? <div className="tether-metric-sub">{sub}</div> : null}
    </div>
  )
}

function PolicyFields({
  value,
  onChange,
  readOnly = false,
}: {
  value: PolicyFormState
  onChange?: (next: PolicyFormState) => void
  readOnly?: boolean
}) {
  function patch(patchValue: Partial<PolicyFormState>) {
    if (readOnly) return
    onChange?.({ ...value, ...patchValue })
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <FormField label="Allow tools">
        <select
          className="tether-select"
          value={value.allowTools}
          disabled={readOnly}
          onChange={(event) => patch({ allowTools: event.target.value as BoolSelect })}
        >
          <option value="">inherit</option>
          <option value="true">allow</option>
          <option value="false">deny</option>
        </select>
      </FormField>
      <FormField label="Allow reasoning">
        <select
          className="tether-select"
          value={value.allowReasoning}
          disabled={readOnly}
          onChange={(event) => patch({ allowReasoning: event.target.value as BoolSelect })}
        >
          <option value="">inherit</option>
          <option value="true">allow</option>
          <option value="false">deny</option>
        </select>
      </FormField>
      <FormField label="Allow attachments">
        <select
          className="tether-select"
          value={value.allowAttachments}
          disabled={readOnly}
          onChange={(event) => patch({ allowAttachments: event.target.value as BoolSelect })}
        >
          <option value="">inherit</option>
          <option value="true">allow</option>
          <option value="false">deny</option>
        </select>
      </FormField>
      <FormField label="Max output tokens">
        <input
          className="tether-input"
          value={value.maxOutputTokens}
          readOnly={readOnly}
          onChange={(event) => patch({ maxOutputTokens: event.target.value })}
          placeholder="4096"
        />
      </FormField>
      <FormField label="Max request cost USD">
        <input
          className="tether-input"
          value={value.maxCostUSD}
          readOnly={readOnly}
          onChange={(event) => patch({ maxCostUSD: event.target.value })}
          placeholder="0.500"
        />
      </FormField>
      <div className="tether-section-box sm:col-span-2">
        <div className="mb-3 text-caption uppercase tracking-label text-text-subtle">
          Durable usage budget
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <FormField label="Max spend USD">
            <input
              className="tether-input"
              value={value.usageBudgetMaxCostUSD}
              readOnly={readOnly}
              onChange={(event) => patch({ usageBudgetMaxCostUSD: event.target.value })}
              placeholder="25.00"
            />
          </FormField>
          <FormField label="Window">
            <select
              className="tether-select"
              value={value.usageBudgetWindow}
              disabled={readOnly}
              onChange={(event) => patch({ usageBudgetWindow: event.target.value })}
            >
              <option value="">unset</option>
              <option value="day">day</option>
              <option value="month">month</option>
            </select>
          </FormField>
          <FormField label="Scope">
            <select
              className="tether-select"
              value={value.usageBudgetScope}
              disabled={readOnly}
              onChange={(event) => patch({ usageBudgetScope: event.target.value })}
            >
              <option value="">unset</option>
              <option value="total">total</option>
              <option value="caller">caller</option>
              <option value="session">session</option>
            </select>
          </FormField>
        </div>
      </div>
    </div>
  )
}

function BreakdownTable({ title, rows }: { title: string; rows?: AIUsageBreakdownInfo[] }) {
  const data = rows ?? []
  return (
    <div className="tether-breakdown-table-box">
      <div className="tether-breakdown-title">{title}</div>
      {data.length === 0 ? (
        <div className="px-3 py-4 text-xs text-text-subtle">No data yet.</div>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-full text-left text-xs">
            <thead className="border-b border-border bg-surface text-text-subtle">
              <tr>
                <th className="px-3 py-2 font-medium">Key</th>
                <th className="px-3 py-2 font-medium">Requests</th>
                <th className="px-3 py-2 font-medium">Success</th>
                <th className="px-3 py-2 font-medium">Errors</th>
                <th className="px-3 py-2 font-medium">Latency</th>
                <th className="px-3 py-2 font-medium">Input</th>
                <th className="px-3 py-2 font-medium">Output</th>
                <th className="px-3 py-2 font-medium">Cost</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.key} className="border-b border-border/60 last:border-b-0">
                  <td className="px-3 py-2 font-mono text-text">{row.key}</td>
                  <td className="px-3 py-2 font-mono tabular-nums text-text">{row.requests}</td>
                  <td className="px-3 py-2 font-mono tabular-nums text-text">{row.successes}</td>
                  <td className="px-3 py-2 font-mono tabular-nums text-text">{row.errors}</td>
                  <td className="px-3 py-2 font-mono tabular-nums text-text-soft">
                    {row.latency_ms}ms
                  </td>
                  <td className="px-3 py-2 font-mono tabular-nums text-text-soft">
                    {row.input_tokens ?? 0}
                  </td>
                  <td className="px-3 py-2 font-mono tabular-nums text-text-soft">
                    {row.output_tokens ?? 0}
                  </td>
                  <td className="px-3 py-2 font-mono tabular-nums text-text-soft">
                    {formatUSD(row.estimated_cost_usd)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const providerColumns: ColumnDef<AIProviderSettingsInfo>[] = [
  {
    key: "id",
    header: "Provider",
    width: "fill",
    cell: (provider) => <CopyableId id={provider.id} />,
    sortValue: (provider) => provider.id,
  },
  {
    key: "type",
    header: "Type",
    cell: (provider) => provider.type,
    sortValue: (provider) => provider.type,
  },
  {
    key: "default_model",
    header: "Default model",
    width: "fill",
    cell: (provider) => (
      <span className="block truncate font-mono text-label text-text-soft">
        {provider.default_model || provider.model || provider.models?.[0] || "—"}
      </span>
    ),
    sortValue: (provider) => provider.default_model || provider.model || provider.models?.[0] || "",
  },
  {
    key: "models",
    header: "Models",
    align: "right",
    cell: (provider) => provider.models?.length ?? (provider.model ? 1 : 0),
    sortValue: (provider) => provider.models?.length ?? (provider.model ? 1 : 0),
  },
  {
    key: "secret_ref",
    header: "Secret",
    cell: (provider) =>
      provider.secret_ref ? (
        <Pill tone="success">configured</Pill>
      ) : (
        <span className="text-text-subtle">—</span>
      ),
    sortValue: (provider) => (provider.secret_ref ? 1 : 0),
  },
  {
    key: "enabled",
    header: "State",
    cell: (provider) => (
      <Pill tone={provider.enabled ? "success" : "neutral"}>
        {provider.enabled ? "enabled" : "disabled"}
      </Pill>
    ),
    sortValue: (provider) => (provider.enabled ? 1 : 0),
  },
]

const routeColumns: ColumnDef<AIRouteSettingsInfo>[] = [
  {
    key: "provider",
    header: "Provider",
    cell: (route) => <CopyableId id={route.provider} />,
    sortValue: (route) => route.provider,
  },
  {
    key: "model",
    header: "Model",
    width: "fill",
    cell: (route) => <span className="font-mono text-xs text-text">{route.model}</span>,
    sortValue: (route) => route.model,
  },
  {
    key: "mode",
    header: "Mode",
    cell: (route) => route.mode || "—",
    sortValue: (route) => route.mode || "",
  },
  {
    key: "intent",
    header: "Intent",
    cell: (route) => route.intent || "—",
    sortValue: (route) => route.intent || "",
  },
  {
    key: "requires_tools",
    header: "Tools",
    cell: (route) => (
      <Pill tone={toneForOptionalBool(route.requires_tools)}>
        {boolLabel(route.requires_tools, "need", "avoid")}
      </Pill>
    ),
    sortValue: (route) => `${route.requires_tools}`,
  },
  {
    key: "requires_reasoning",
    header: "Reasoning",
    cell: (route) => (
      <Pill tone={toneForOptionalBool(route.requires_reasoning)}>
        {boolLabel(route.requires_reasoning, "need", "avoid")}
      </Pill>
    ),
    sortValue: (route) => `${route.requires_reasoning}`,
  },
]

const runtimeProviderColumns: ColumnDef<AIRuntimeInfo["providers"][number]>[] = [
  {
    key: "id",
    header: "Provider",
    cell: (provider) => <CopyableId id={provider.id} />,
    sortValue: (provider) => provider.id,
  },
  {
    key: "type",
    header: "Type",
    cell: (provider) => provider.type,
    sortValue: (provider) => provider.type,
  },
  {
    key: "default_model",
    header: "Default model",
    width: "fill",
    cell: (provider) => provider.default_model || provider.models?.[0] || "—",
    sortValue: (provider) => provider.default_model || provider.models?.[0] || "",
  },
  {
    key: "models",
    header: "Models",
    align: "right",
    cell: (provider) => provider.models?.length ?? 0,
    sortValue: (provider) => provider.models?.length ?? 0,
  },
]

const runtimeModelColumns: ColumnDef<AIRuntimeInfo["models"][number]>[] = [
  {
    key: "id",
    header: "Model",
    width: "fill",
    cell: (model) => <span className="font-mono text-xs text-text">{model.id}</span>,
    sortValue: (model) => model.id,
  },
  {
    key: "configured_provider_id",
    header: "Provider",
    cell: (model) => model.configured_provider_id,
    sortValue: (model) => model.configured_provider_id,
  },
  {
    key: "family",
    header: "Family",
    cell: (model) => model.family || "—",
    sortValue: (model) => model.family || "",
  },
  {
    key: "context_window",
    header: "Context",
    align: "right",
    cell: (model) => model.context_window ?? "—",
    sortValue: (model) => model.context_window ?? 0,
  },
  {
    key: "max_output_tokens",
    header: "Max out",
    align: "right",
    cell: (model) => model.max_output_tokens ?? "—",
    sortValue: (model) => model.max_output_tokens ?? 0,
  },
]

const runtimeRouteColumns: ColumnDef<AIRuntimeInfo["routes"][number]>[] = [
  {
    key: "provider",
    header: "Provider",
    cell: (route) => route.provider,
    sortValue: (route) => route.provider,
  },
  {
    key: "model",
    header: "Model",
    width: "fill",
    cell: (route) => <span className="font-mono text-xs text-text">{route.model}</span>,
    sortValue: (route) => route.model,
  },
  {
    key: "mode",
    header: "Mode",
    cell: (route) => route.mode || "—",
    sortValue: (route) => route.mode || "",
  },
  {
    key: "policy",
    header: "Policy",
    width: "fill",
    cell: (route) => <span className="text-label text-text-soft">{policySummary(route)}</span>,
    sortValue: (route) => policySummary(route),
  },
]

const auditColumns: ColumnDef<AIAuditEventInfo>[] = [
  {
    key: "event_type",
    header: "Event",
    cell: (event) => (
      <Pill
        tone={
          event.success
            ? "success"
            : event.event_type === "budget_rejection"
              ? "warning"
              : "neutral"
        }
      >
        {event.event_type}
      </Pill>
    ),
    sortValue: (event) => event.event_type,
  },
  {
    key: "provider",
    header: "Provider",
    cell: (event) => event.provider || "—",
    sortValue: (event) => event.provider || "",
  },
  {
    key: "model",
    header: "Model",
    width: "fill",
    cell: (event) => (
      <span className="font-mono text-label text-text-soft">{event.model || "—"}</span>
    ),
    sortValue: (event) => event.model || "",
  },
  {
    key: "operation",
    header: "Op",
    cell: (event) => event.operation,
    sortValue: (event) => event.operation,
  },
  {
    key: "cost",
    header: "Cost",
    align: "right",
    cell: (event) => (
      <span className="font-mono tabular-nums">{formatUSD(event.estimated_cost_usd)}</span>
    ),
    sortValue: (event) => event.estimated_cost_usd ?? 0,
  },
  {
    key: "timestamp",
    header: "When",
    align: "right",
    cell: (event) => (
      <span className="text-label text-text-soft">{formatRelativeTime(event.timestamp)}</span>
    ),
    sortValue: (event) => event.timestamp,
  },
]

const budgetColumns: ColumnDef<AIBudgetInfo>[] = [
  {
    key: "provider",
    header: "Provider",
    cell: (budget) => budget.provider,
    sortValue: (budget) => budget.provider,
  },
  {
    key: "model",
    header: "Model",
    width: "fill",
    cell: (budget) => <span className="font-mono text-label text-text-soft">{budget.model}</span>,
    sortValue: (budget) => budget.model,
  },
  {
    key: "window",
    header: "Window",
    cell: (budget) => budget.usage_budget.window || "—",
    sortValue: (budget) => budget.usage_budget.window || "",
  },
  {
    key: "scope",
    header: "Scope",
    cell: (budget) => budget.usage_budget.scope || "—",
    sortValue: (budget) => budget.usage_budget.scope || "",
  },
  {
    key: "spent",
    header: "Spent",
    align: "right",
    cell: (budget) => (
      <span className="font-mono tabular-nums">{formatUSD(budget.spent_cost_usd)}</span>
    ),
    sortValue: (budget) => budget.spent_cost_usd ?? 0,
  },
  {
    key: "remaining",
    header: "Remaining",
    align: "right",
    cell: (budget) => (
      <span className="font-mono tabular-nums">{formatUSD(budget.remaining_cost_usd)}</span>
    ),
    sortValue: (budget) => budget.remaining_cost_usd ?? 0,
  },
  {
    key: "status",
    header: "Status",
    cell: (budget) => (
      <Pill tone={budget.error ? "warning" : budget.exhausted ? "warning" : "success"}>
        {budget.error ? "needs input" : budget.exhausted ? "exhausted" : "available"}
      </Pill>
    ),
    sortValue: (budget) => `${budget.error}:${budget.exhausted}`,
  },
]

let globalAILeaseSeq = 0
let globalAITicketSeq = 0
export const activeAILeases = new Set<number>()
export const retiredAILeases = new Set<number>()

export function getDetailEntityId(view: DetailView | null): string {
  if (!view) return ""
  switch (view.kind) {
    case "provider":
      return `provider::${view.item.id}`
    case "route":
      return `route::${routeKey(view.item)}`
    case "audit":
      return `audit::${view.item.id}`
    case "budget":
      return `budget::${view.item.provider}::${view.item.model || "*"}`
  }
}

export function getProviderFormEntityId(form: ProviderFormState | null): string {
  if (!form) return ""
  return `provider-form::${form.originalID || form.id || "new"}`
}

export function getRouteFormEntityId(form: RouteFormState | null): string {
  if (!form) return ""
  return `route-form::${form.originalKey || `${form.provider}::${form.model}` || "new"}`
}

export function isElementVisibleAndActive(el: HTMLElement): boolean {
  if (!el.isConnected) return false
  if (el.hasAttribute("hidden") || el.closest("[hidden]")) return false
  if (el.getAttribute("aria-hidden") === "true" || el.closest('[aria-hidden="true"]')) return false
  if (el.hasAttribute("inert") || el.closest("[inert]")) return false
  if (el.closest("details:not([open])")) return false
  if (el.closest("template")) return false

  if (el.hasAttribute("data-closed") || el.closest("[data-closed]")) return false
  if (el.hasAttribute("data-ending") || el.closest("[data-ending]")) return false
  if (el.getAttribute("data-state") === "closed" || el.closest('[data-state="closed"]')) {
    return false
  }

  if (typeof window !== "undefined" && typeof window.getComputedStyle === "function") {
    let curr: HTMLElement | null = el
    while (curr && curr !== document.documentElement) {
      const style = window.getComputedStyle(curr)
      if (
        style.display === "none" ||
        style.visibility === "hidden" ||
        style.visibility === "collapse" ||
        style.opacity === "0"
      ) {
        return false
      }
      curr = curr.parentElement
    }
  }

  const rect = el.getBoundingClientRect()
  if (rect.width === 0 && rect.height === 0) {
    return false
  }

  return true
}

export function hasCompetingOverlay(activePopup?: HTMLElement | null): boolean {
  if (typeof document === "undefined") return false
  const overlays = document.querySelectorAll<HTMLElement>(
    '[role="dialog"], [role="alertdialog"], [role="menu"], [role="listbox"]',
  )
  for (const el of Array.from(overlays)) {
    if (!isElementVisibleAndActive(el)) continue
    if (activePopup) {
      if (el === activePopup) continue
      if (el.contains(activePopup)) continue
      return true
    }
    return true
  }
  return false
}

export interface AIGatewayPageProps {
  initialTab?: AITabKey
  tab?: AITabKey
  onTabChange?: (tab: AITabKey) => void
  variant?: OverviewVariantKey
  forcedAppearance?: "ready" | "loading" | "error" | "empty"
  forcedErrorMessage?: string
  showIdentityLinks?: boolean
  showVariantSelector?: boolean
  onVariantChange?: (variant: OverviewVariantKey) => void
  onRefresh?: () => void
}

export function AIGatewayPage({
  initialTab = "config",
  tab: controlledTab,
  onTabChange,
  variant: controlledVariant,
  forcedAppearance = "ready",
  forcedErrorMessage,
  showIdentityLinks = true,
  showVariantSelector = true,
  onVariantChange,
  onRefresh,
}: AIGatewayPageProps) {
  const [internalVariant, setInternalVariant] = useState<OverviewVariantKey>("standard")
  const currentVariant = controlledVariant ?? internalVariant

  const [internalTab, setInternalTab] = useState<AITabKey>(initialTab)
  const tab = controlledTab ?? internalTab
  const [settings, setSettings] = useState<AISettingsInfo | null>(() => {
    if (
      forcedAppearance === "loading" ||
      forcedAppearance === "empty" ||
      forcedAppearance === "error"
    ) {
      return null
    }
    return tetherSysopFixture.ai.settings as AISettingsInfo
  })
  const [draftConfig, setDraftConfig] = useState<AIConfigInfo | null>(() => {
    if (
      forcedAppearance === "loading" ||
      forcedAppearance === "empty" ||
      forcedAppearance === "error"
    ) {
      return null
    }
    return (tetherSysopFixture.ai.settings as AISettingsInfo).config
  })
  const [runtime, setRuntime] = useState<AIRuntimeInfo | null>(() => {
    if (
      forcedAppearance === "loading" ||
      forcedAppearance === "empty" ||
      forcedAppearance === "error"
    ) {
      return null
    }
    return tetherSysopFixture.ai.runtime as AIRuntimeInfo
  })
  const [usage, setUsage] = useState<AIUsageInfo | null>(() => {
    if (
      forcedAppearance === "loading" ||
      forcedAppearance === "empty" ||
      forcedAppearance === "error"
    ) {
      return null
    }
    return tetherSysopFixture.ai.usage as AIUsageInfo
  })
  const [audit, setAudit] = useState<AIAuditInfo | null>(() => {
    if (
      forcedAppearance === "loading" ||
      forcedAppearance === "empty" ||
      forcedAppearance === "error"
    ) {
      return null
    }
    return tetherSysopFixture.ai.audit as AIAuditInfo
  })
  const [budgets, setBudgets] = useState<AIBudgetsInfo | null>(() => {
    if (
      forcedAppearance === "loading" ||
      forcedAppearance === "empty" ||
      forcedAppearance === "error"
    ) {
      return null
    }
    return tetherSysopFixture.ai.budgets as AIBudgetsInfo
  })
  const [error, setError] = useState<string | null>(() => {
    if (forcedAppearance === "error") {
      return forcedErrorMessage ?? "Could not load AI gateway data"
    }
    return null
  })
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(forcedAppearance === "loading")
  const [reloadingDaemon] = useState(false)
  const [providerForm, setProviderForm] = useState<ProviderFormState | null>(null)
  const [routeForm, setRouteForm] = useState<RouteFormState | null>(null)
  const [providerCatalogs, setProviderCatalogs] = useState<
    Record<string, AIProviderCatalogInfo | undefined>
  >({})
  const [detailView, setDetailView] = useState<DetailView | null>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  // Bound popup DOM refs and entity/open tickets
  const detailTicketRef = useRef(0)
  const detailEntityIdRef = useRef("")
  const [detailTicket, setDetailTicket] = useState(0)
  const [detailEntityId, setDetailEntityId] = useState("")
  const detailDialogRef = useRef<HTMLDivElement | null>(null)
  const detailViewRef = useRef<DetailView | null>(null)
  detailViewRef.current = detailView

  const providerTicketRef = useRef(0)
  const providerEntityIdRef = useRef("")
  const [providerTicket, setProviderTicket] = useState(0)
  const [providerEntityId, setProviderEntityId] = useState("")
  const providerDialogRef = useRef<HTMLDivElement | null>(null)
  const providerFormRef = useRef<ProviderFormState | null>(null)
  providerFormRef.current = providerForm

  const routeTicketRef = useRef(0)
  const routeEntityIdRef = useRef("")
  const [routeTicket, setRouteTicket] = useState(0)
  const [routeEntityId, setRouteEntityId] = useState("")
  const routeDialogRef = useRef<HTMLDivElement | null>(null)
  const routeFormRef = useRef<RouteFormState | null>(null)
  routeFormRef.current = routeForm

  // Track activation lease per mount and variant lifecycle:
  // Allocate ONLY in committed effects, not in render initializers!
  const [activationLease, setActivationLease] = useState<number>(0)
  const currentLeaseRef = useRef(0)
  const requestSeqRef = useRef(0)
  const currentVariantRef = useRef(currentVariant)
  currentVariantRef.current = currentVariant

  // Advance lease on variant transition and mount lifecycle; permanently retire previous lease
  useLayoutEffect(() => {
    void currentVariant
    const lease = ++globalAILeaseSeq
    activeAILeases.add(lease)
    currentLeaseRef.current = lease
    setActivationLease(lease)

    return () => {
      activeAILeases.delete(lease)
      retiredAILeases.add(lease)
      if (currentLeaseRef.current === lease) {
        currentLeaseRef.current = 0
      }
    }
  }, [currentVariant])

  // Source & lease validity for async requests and subscriptions
  const isSourceValid = useCallback((leaseToVerify: number): boolean => {
    if (
      leaseToVerify === 0 ||
      !activeAILeases.has(leaseToVerify) ||
      retiredAILeases.has(leaseToVerify) ||
      leaseToVerify !== currentLeaseRef.current
    ) {
      return false
    }
    if (!rootRef.current?.isConnected || !document.contains(rootRef.current)) {
      return false
    }
    return true
  }, [])

  // Event admission check (source validity PLUS overlay veto)
  const isAdmitted = useCallback(
    (leaseToVerify: number, popupContext?: HTMLElement | null): boolean => {
      if (!isSourceValid(leaseToVerify)) {
        return false
      }
      if (hasCompetingOverlay(popupContext)) {
        return false
      }
      return true
    },
    [isSourceValid],
  )

  const api = useMemo(() => createTetherSysopMockApi(currentVariant), [currentVariant])

  const load = useCallback((): boolean => {
    if (!isAdmitted(activationLease)) {
      return false
    }

    const capturedLease = activationLease
    const capturedVariant = currentVariant
    const requestLease = ++requestSeqRef.current

    if (typeof window !== "undefined") {
      const w = window as unknown as { __tetherAIRequestCount?: number }
      w.__tetherAIRequestCount = (w.__tetherAIRequestCount ?? 0) + 1
    }

    setLoading(true)
    Promise.all([
      api.getAISettings(),
      api.getAIRuntime(),
      api.getAIUsage(),
      api.getAIAudit(),
      api.getAIBudgets(),
    ])
      .then(([settingsInfo, runtimeInfo, usageInfo, auditInfo, budgetsInfo]) => {
        // Source validity check: do NOT veto on temporary overlays so loading cannot be stuck
        if (
          !isSourceValid(capturedLease) ||
          requestLease !== requestSeqRef.current ||
          capturedVariant !== currentVariantRef.current
        ) {
          return
        }
        if (forcedAppearance === "empty") {
          setSettings(null)
          setDraftConfig(null)
          setRuntime(null)
          setUsage(null)
          setAudit(null)
          setBudgets(null)
          setError(null)
        } else if (forcedAppearance === "error") {
          setSettings(null)
          setDraftConfig(null)
          setRuntime(null)
          setUsage(null)
          setAudit(null)
          setBudgets(null)
          setError(forcedErrorMessage ?? "Could not load AI gateway data")
        } else {
          setSettings(settingsInfo)
          setDraftConfig(settingsInfo.config)
          setRuntime(runtimeInfo)
          setUsage(usageInfo)
          setAudit(auditInfo)
          setBudgets(budgetsInfo)
          setError(
            settingsInfo.error ??
              runtimeInfo.error ??
              usageInfo.error ??
              auditInfo.error ??
              budgetsInfo.error ??
              null,
          )
        }
      })
      .catch((err: unknown) => {
        if (
          !isSourceValid(capturedLease) ||
          requestLease !== requestSeqRef.current ||
          capturedVariant !== currentVariantRef.current
        ) {
          return
        }
        setError(err instanceof Error ? err.message : String(err))
      })
      .finally(() => {
        if (
          !isSourceValid(capturedLease) ||
          requestLease !== requestSeqRef.current ||
          capturedVariant !== currentVariantRef.current
        ) {
          return
        }
        setLoading(false)
      })
    return true
  }, [
    activationLease,
    api,
    currentVariant,
    forcedAppearance,
    forcedErrorMessage,
    isAdmitted,
    isSourceValid,
  ])

  useEffect(() => {
    if (forcedAppearance === "error") {
      setSettings(null)
      setDraftConfig(null)
      setRuntime(null)
      setUsage(null)
      setAudit(null)
      setBudgets(null)
      setError(forcedErrorMessage ?? "Could not load AI gateway data")
      setLoading(false)
      return
    }
    if (forcedAppearance === "loading") {
      setSettings(null)
      setDraftConfig(null)
      setRuntime(null)
      setUsage(null)
      setAudit(null)
      setBudgets(null)
      setLoading(true)
      return
    }
    if (forcedAppearance === "empty") {
      setSettings(null)
      setDraftConfig(null)
      setRuntime(null)
      setUsage(null)
      setAudit(null)
      setBudgets(null)
      setError(null)
      setLoading(false)
      return
    }
    load()
  }, [load, forcedAppearance, forcedErrorMessage])

  const handleVariantChange = useCallback(
    (next: OverviewVariantKey): boolean => {
      if (!isAdmitted(activationLease)) return false
      if (controlledVariant === undefined) {
        setInternalVariant(next)
      }
      onVariantChange?.(next)
      return true
    },
    [activationLease, controlledVariant, isAdmitted, onVariantChange],
  )

  const handleRefresh = useCallback((): boolean => {
    if (!isAdmitted(activationLease) || loading) return false
    if (typeof window !== "undefined") {
      const w = window as unknown as { __tetherAIRefreshCount?: number }
      w.__tetherAIRefreshCount = (w.__tetherAIRefreshCount ?? 0) + 1
    }
    onRefresh?.()
    return load()
  }, [activationLease, isAdmitted, loading, onRefresh, load])

  const handleTabChange = useCallback(
    (next: AITabKey): boolean => {
      if (!isAdmitted(activationLease)) return false
      if (controlledTab === undefined) {
        setInternalTab(next)
      }
      onTabChange?.(next)
      return true
    },
    [activationLease, controlledTab, isAdmitted, onTabChange],
  )

  // Lazy-load provider catalog when form is opened
  useEffect(() => {
    const providerType = providerForm?.type.trim()
    if (!providerType || providerCatalogs[providerType]) return
    let cancelled = false
    const ticket = providerTicketRef.current
    api
      .getAIProviderCatalog(providerType)
      .then((info) => {
        const ownedPopup = (providerDialogRef.current?.closest('[role="dialog"]') ??
          providerDialogRef.current) as HTMLElement | null
        if (
          !cancelled &&
          ticket === providerTicketRef.current &&
          isAdmitted(currentLeaseRef.current, ownedPopup)
        ) {
          setProviderCatalogs((current) => ({ ...current, [providerType]: info }))
        }
      })
      .catch((err: unknown) => {
        const ownedPopup = (providerDialogRef.current?.closest('[role="dialog"]') ??
          providerDialogRef.current) as HTMLElement | null
        if (
          !cancelled &&
          ticket === providerTicketRef.current &&
          isAdmitted(currentLeaseRef.current, ownedPopup)
        ) {
          setProviderCatalogs((current) => ({
            ...current,
            [providerType]: {
              provider_type: providerType,
              models: [],
              error: err instanceof Error ? err.message : String(err),
            },
          }))
        }
      })
    return () => {
      cancelled = true
    }
  }, [api, isAdmitted, providerCatalogs, providerForm?.type])

  // Keyboard navigation & shortcut guard
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return
      if (e.isComposing || e.keyCode === 229) return
      if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return
      if (e.key !== "r" && e.key !== "R") return

      const target = e.target as HTMLElement | null
      const isTargetScoped =
        target &&
        (target === rootRef.current ||
          rootRef.current?.contains(target) ||
          target === document.body)

      if (!isTargetScoped) return

      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target?.isContentEditable
      ) {
        return
      }

      if (!isAdmitted(activationLease)) return

      e.preventDefault()
      handleRefresh()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [activationLease, handleRefresh, isAdmitted])

  const providerList = draftConfig?.providers ?? []
  const routeList = draftConfig?.routes ?? []
  const runtimeProviderList = runtime?.providers ?? []
  const runtimeModelList = runtime?.models ?? []
  const runtimeRouteList = runtime?.routes ?? []
  const auditList = audit?.events ?? []
  const budgetList = budgets?.budgets ?? []

  const dirty = false

  const tabs: TabStripItem<AITabKey>[] = [
    {
      key: "config",
      label: "Config",
      icon: <Shield className="h-3.5 w-3.5" />,
    },
    {
      key: "providers",
      label: "Providers",
      icon: <Bot className="h-3.5 w-3.5" />,
      count: providerList.length,
    },
    {
      key: "routes",
      label: "Routes",
      icon: <Route className="h-3.5 w-3.5" />,
      count: routeList.length,
    },
    {
      key: "runtime",
      label: "Runtime",
      icon: <BrainCircuit className="h-3.5 w-3.5" />,
      count: runtimeRouteList.length,
    },
    {
      key: "usage",
      label: "Usage",
      icon: <CircleDollarSign className="h-3.5 w-3.5" />,
    },
    {
      key: "audit",
      label: "Audit",
      icon: <Shield className="h-3.5 w-3.5" />,
      count: audit?.count ?? 0,
    },
    {
      key: "budgets",
      label: "Budgets",
      icon: <CircleDollarSign className="h-3.5 w-3.5" />,
      count: budgets?.count ?? 0,
    },
  ]

  const summaryCards: SummaryCard[] = [
    {
      label: "Configured",
      value: draftConfig ? providerList.length : "...",
    },
    {
      label: "Enabled",
      value: draftConfig ? providerList.filter((provider) => provider.enabled).length : "...",
      accentColor: "var(--color-success)",
    },
    {
      label: "Routes",
      value: draftConfig ? routeList.length : "...",
    },
    {
      label: "Runtime providers",
      value: runtime ? runtimeProviderList.length : "...",
    },
    {
      label: "Requests",
      value: usage ? compactNumber(usage.summary.requests) : "...",
    },
    {
      label: "Spend",
      value: usage ? formatUSD(usage.summary.estimated_cost_usd) : "...",
      accentColor: "var(--color-info)",
    },
    {
      label: "Config state",
      value: "current (specimen)",
      accentColor: "var(--color-success)",
    },
  ]

  const handleOpenDetail = useCallback(
    (view: DetailView): boolean => {
      if (!isAdmitted(activationLease)) return false
      const nextTicket = ++globalAITicketSeq
      const nextEntityId = getDetailEntityId(view)
      detailTicketRef.current = nextTicket
      detailEntityIdRef.current = nextEntityId
      setDetailTicket(nextTicket)
      setDetailEntityId(nextEntityId)
      setDetailView(view)
      return true
    },
    [activationLease, isAdmitted],
  )

  const handleCloseDetail = useCallback(
    (capturedTicket?: number, capturedEntityId?: string): boolean => {
      const ticketToVerify = capturedTicket ?? detailTicketRef.current
      const entityToVerify = capturedEntityId ?? detailEntityIdRef.current
      if (ticketToVerify === 0 || ticketToVerify !== detailTicketRef.current) return false
      if (
        !entityToVerify ||
        entityToVerify !== detailEntityIdRef.current ||
        !detailViewRef.current
      ) {
        return false
      }
      const container = detailDialogRef.current
      if (!container?.isConnected) return false
      if (container.getAttribute("data-dialog-ticket") !== String(ticketToVerify)) return false
      if (container.getAttribute("data-dialog-entity") !== entityToVerify) return false
      const ownedPopup = (container.closest('[role="dialog"]') ?? container) as HTMLElement
      if (!isAdmitted(activationLease, ownedPopup)) return false
      detailTicketRef.current = 0
      detailEntityIdRef.current = ""
      setDetailTicket(0)
      setDetailEntityId("")
      setDetailView(null)
      return true
    },
    [activationLease, isAdmitted],
  )

  const handleOpenAddProvider = useCallback((): boolean => {
    if (!isAdmitted(activationLease)) return false
    const nextTicket = ++globalAITicketSeq
    const nextEntityId = "provider-form::new"
    providerTicketRef.current = nextTicket
    providerEntityIdRef.current = nextEntityId
    setProviderTicket(nextTicket)
    setProviderEntityId(nextEntityId)
    setProviderForm(emptyProviderForm())
    return true
  }, [activationLease, isAdmitted])

  const handleOpenAddRoute = useCallback((): boolean => {
    if (!isAdmitted(activationLease)) return false
    const nextTicket = ++globalAITicketSeq
    const nextEntityId = "route-form::new"
    routeTicketRef.current = nextTicket
    routeEntityIdRef.current = nextEntityId
    setRouteTicket(nextTicket)
    setRouteEntityId(nextEntityId)
    setRouteForm(emptyRouteForm())
    return true
  }, [activationLease, isAdmitted])

  const handleEditProvider = useCallback(
    (
      capturedTicket: number,
      capturedEntityId: string,
      provider: AIProviderSettingsInfo,
    ): boolean => {
      if (capturedTicket === 0 || capturedTicket !== detailTicketRef.current) return false
      if (
        !capturedEntityId ||
        capturedEntityId !== detailEntityIdRef.current ||
        !detailViewRef.current
      ) {
        return false
      }
      const container = detailDialogRef.current
      if (!container?.isConnected) return false
      if (container.getAttribute("data-dialog-ticket") !== String(capturedTicket)) return false
      if (container.getAttribute("data-dialog-entity") !== capturedEntityId) return false
      const ownedPopup = (container.closest('[role="dialog"]') ?? container) as HTMLElement
      if (!isAdmitted(activationLease, ownedPopup)) return false

      detailTicketRef.current = 0
      detailEntityIdRef.current = ""
      setDetailTicket(0)
      setDetailEntityId("")
      setDetailView(null)

      const nextTicket = ++globalAITicketSeq
      const nextEntityId = `provider-form::${provider.id}`
      providerTicketRef.current = nextTicket
      providerEntityIdRef.current = nextEntityId
      setProviderTicket(nextTicket)
      setProviderEntityId(nextEntityId)
      setProviderForm(providerToForm(provider))
      return true
    },
    [activationLease, isAdmitted],
  )

  const handleEditRoute = useCallback(
    (capturedTicket: number, capturedEntityId: string, route: AIRouteSettingsInfo): boolean => {
      if (capturedTicket === 0 || capturedTicket !== detailTicketRef.current) return false
      if (
        !capturedEntityId ||
        capturedEntityId !== detailEntityIdRef.current ||
        !detailViewRef.current
      ) {
        return false
      }
      const container = detailDialogRef.current
      if (!container?.isConnected) return false
      if (container.getAttribute("data-dialog-ticket") !== String(capturedTicket)) return false
      if (container.getAttribute("data-dialog-entity") !== capturedEntityId) return false
      const ownedPopup = (container.closest('[role="dialog"]') ?? container) as HTMLElement
      if (!isAdmitted(activationLease, ownedPopup)) return false

      detailTicketRef.current = 0
      detailEntityIdRef.current = ""
      setDetailTicket(0)
      setDetailEntityId("")
      setDetailView(null)

      const nextTicket = ++globalAITicketSeq
      const nextEntityId = `route-form::${routeKey(route)}`
      routeTicketRef.current = nextTicket
      routeEntityIdRef.current = nextEntityId
      setRouteTicket(nextTicket)
      setRouteEntityId(nextEntityId)
      setRouteForm(routeToForm(route))
      return true
    },
    [activationLease, isAdmitted],
  )

  const handleCloseProviderForm = useCallback(
    (capturedTicket?: number, capturedEntityId?: string): boolean => {
      const ticketToVerify = capturedTicket ?? providerTicketRef.current
      const entityToVerify = capturedEntityId ?? providerEntityIdRef.current
      if (ticketToVerify === 0 || ticketToVerify !== providerTicketRef.current) return false
      if (
        !entityToVerify ||
        entityToVerify !== providerEntityIdRef.current ||
        !providerFormRef.current
      ) {
        return false
      }
      const container = providerDialogRef.current
      if (!container?.isConnected) return false
      if (container.getAttribute("data-dialog-ticket") !== String(ticketToVerify)) return false
      if (container.getAttribute("data-dialog-entity") !== entityToVerify) return false
      const ownedPopup = (container.closest('[role="dialog"]') ?? container) as HTMLElement
      if (!isAdmitted(activationLease, ownedPopup)) return false
      providerTicketRef.current = 0
      providerEntityIdRef.current = ""
      setProviderTicket(0)
      setProviderEntityId("")
      setProviderForm(null)
      return true
    },
    [activationLease, isAdmitted],
  )

  const handleCloseRouteForm = useCallback(
    (capturedTicket?: number, capturedEntityId?: string): boolean => {
      const ticketToVerify = capturedTicket ?? routeTicketRef.current
      const entityToVerify = capturedEntityId ?? routeEntityIdRef.current
      if (ticketToVerify === 0 || ticketToVerify !== routeTicketRef.current) return false
      if (!entityToVerify || entityToVerify !== routeEntityIdRef.current || !routeFormRef.current) {
        return false
      }
      const container = routeDialogRef.current
      if (!container?.isConnected) return false
      if (container.getAttribute("data-dialog-ticket") !== String(ticketToVerify)) return false
      if (container.getAttribute("data-dialog-entity") !== entityToVerify) return false
      const ownedPopup = (container.closest('[role="dialog"]') ?? container) as HTMLElement
      if (!isAdmitted(activationLease, ownedPopup)) return false
      routeTicketRef.current = 0
      routeEntityIdRef.current = ""
      setRouteTicket(0)
      setRouteEntityId("")
      setRouteForm(null)
      return true
    },
    [activationLease, isAdmitted],
  )

  const handleProviderFormChange = useCallback(
    (
      next: ProviderFormState | null,
      capturedTicket?: number,
      capturedEntityId?: string,
    ): boolean => {
      const ticketToVerify = capturedTicket ?? providerTicketRef.current
      const entityToVerify = capturedEntityId ?? providerEntityIdRef.current
      if (ticketToVerify === 0 || ticketToVerify !== providerTicketRef.current) return false
      if (
        !entityToVerify ||
        entityToVerify !== providerEntityIdRef.current ||
        !providerFormRef.current
      ) {
        return false
      }
      const container = providerDialogRef.current
      if (!container?.isConnected) return false
      if (container.getAttribute("data-dialog-ticket") !== String(ticketToVerify)) return false
      if (container.getAttribute("data-dialog-entity") !== entityToVerify) return false
      const ownedPopup = (container.closest('[role="dialog"]') ?? container) as HTMLElement
      if (!isAdmitted(activationLease, ownedPopup)) return false
      setProviderForm(next)
      return true
    },
    [activationLease, isAdmitted],
  )

  const handleRouteFormChange = useCallback(
    (next: RouteFormState | null, capturedTicket?: number, capturedEntityId?: string): boolean => {
      const ticketToVerify = capturedTicket ?? routeTicketRef.current
      const entityToVerify = capturedEntityId ?? routeEntityIdRef.current
      if (ticketToVerify === 0 || ticketToVerify !== routeTicketRef.current) return false
      if (!entityToVerify || entityToVerify !== routeEntityIdRef.current || !routeFormRef.current) {
        return false
      }
      const container = routeDialogRef.current
      if (!container?.isConnected) return false
      if (container.getAttribute("data-dialog-ticket") !== String(ticketToVerify)) return false
      if (container.getAttribute("data-dialog-entity") !== entityToVerify) return false
      const ownedPopup = (container.closest('[role="dialog"]') ?? container) as HTMLElement
      if (!isAdmitted(activationLease, ownedPopup)) return false
      setRouteForm(next)
      return true
    },
    [activationLease, isAdmitted],
  )

  // Effectful write controls are INERT fixture specimens
  const saveConfig = useCallback((): boolean => {
    if (!isAdmitted(activationLease)) return false
    setMessage(
      "Fixture specimen: save is inert. Local drafts are demonstration-only and not persisted.",
    )
    return true
  }, [activationLease, isAdmitted])

  const reloadDaemon = useCallback((): boolean => {
    if (!isAdmitted(activationLease)) return false
    setMessage("Fixture specimen: daemon reload is inert. Presentation and inspection only.")
    return true
  }, [activationLease, isAdmitted])

  const saveProvider = useCallback(
    (capturedTicket?: number, capturedEntityId?: string): boolean => {
      const ticketToVerify = capturedTicket ?? providerTicketRef.current
      const entityToVerify = capturedEntityId ?? providerEntityIdRef.current
      if (ticketToVerify === 0 || ticketToVerify !== providerTicketRef.current) return false
      if (
        !entityToVerify ||
        entityToVerify !== providerEntityIdRef.current ||
        !providerFormRef.current
      ) {
        return false
      }
      const container = providerDialogRef.current
      if (!container?.isConnected) return false
      if (container.getAttribute("data-dialog-ticket") !== String(ticketToVerify)) return false
      if (container.getAttribute("data-dialog-entity") !== entityToVerify) return false
      const ownedPopup = (container.closest('[role="dialog"]') ?? container) as HTMLElement
      if (!isAdmitted(activationLease, ownedPopup)) return false
      setMessage("Fixture specimen: provider changes are inert and not persisted.")
      return true
    },
    [activationLease, isAdmitted],
  )

  const deleteProvider = useCallback(
    (
      capturedTicket: number,
      capturedEntityId: string,
      _provider: AIProviderSettingsInfo,
    ): boolean => {
      if (capturedTicket === 0 || capturedTicket !== detailTicketRef.current) return false
      if (
        !capturedEntityId ||
        capturedEntityId !== detailEntityIdRef.current ||
        !detailViewRef.current
      ) {
        return false
      }
      const container = detailDialogRef.current
      if (!container?.isConnected) return false
      if (container.getAttribute("data-dialog-ticket") !== String(capturedTicket)) return false
      if (container.getAttribute("data-dialog-entity") !== capturedEntityId) return false
      const ownedPopup = (container.closest('[role="dialog"]') ?? container) as HTMLElement
      if (!isAdmitted(activationLease, ownedPopup)) return false
      setMessage("Fixture specimen: provider deletion is inert and not persisted.")
      return true
    },
    [activationLease, isAdmitted],
  )

  const saveRoute = useCallback(
    (capturedTicket?: number, capturedEntityId?: string): boolean => {
      const ticketToVerify = capturedTicket ?? routeTicketRef.current
      const entityToVerify = capturedEntityId ?? routeEntityIdRef.current
      if (ticketToVerify === 0 || ticketToVerify !== routeTicketRef.current) return false
      if (!entityToVerify || entityToVerify !== routeEntityIdRef.current || !routeFormRef.current) {
        return false
      }
      const container = routeDialogRef.current
      if (!container?.isConnected) return false
      if (container.getAttribute("data-dialog-ticket") !== String(ticketToVerify)) return false
      if (container.getAttribute("data-dialog-entity") !== entityToVerify) return false
      const ownedPopup = (container.closest('[role="dialog"]') ?? container) as HTMLElement
      if (!isAdmitted(activationLease, ownedPopup)) return false
      setMessage("Fixture specimen: route changes are inert and not persisted.")
      return true
    },
    [activationLease, isAdmitted],
  )

  const deleteRoute = useCallback(
    (capturedTicket: number, capturedEntityId: string, _route: AIRouteSettingsInfo): boolean => {
      if (capturedTicket === 0 || capturedTicket !== detailTicketRef.current) return false
      if (
        !capturedEntityId ||
        capturedEntityId !== detailEntityIdRef.current ||
        !detailViewRef.current
      ) {
        return false
      }
      const container = detailDialogRef.current
      if (!container?.isConnected) return false
      if (container.getAttribute("data-dialog-ticket") !== String(capturedTicket)) return false
      if (container.getAttribute("data-dialog-entity") !== capturedEntityId) return false
      const ownedPopup = (container.closest('[role="dialog"]') ?? container) as HTMLElement
      if (!isAdmitted(activationLease, ownedPopup)) return false
      setMessage("Fixture specimen: route deletion is inert and not persisted.")
      return true
    },
    [activationLease, isAdmitted],
  )

  // Register active DOM handlers and lease state on window for custody verification
  useEffect(() => {
    if (typeof window === "undefined") return

    const w = window as unknown as {
      __tetherAIActiveRefreshHandler?: () => boolean
      __tetherAIActiveVariantHandler?: (next: OverviewVariantKey) => boolean
      __tetherAIActiveTabHandler?: (next: AITabKey) => boolean
      __tetherAIActiveLoadHandler?: () => boolean
      __tetherAIActiveOpenDetail?: (view: DetailView) => boolean
      __tetherAIActiveOpenProvider?: () => boolean
      __tetherAIActiveOpenRoute?: () => boolean
      __tetherAIActiveSaveConfig?: () => boolean
      __tetherAIActiveReloadDaemon?: () => boolean
      __tetherAIActivationLease?: number
      __tetherAIActiveLeases?: Set<number>
      __tetherAIRetiredLeases?: Set<number>
      __tetherAIRetainedCallback?: () => boolean
      __tetherAICallbackHistory?: Array<() => boolean>
      __tetherAIActiveCloseDetail?: () => boolean
      __tetherAIActiveEditProvider?: (provider: AIProviderSettingsInfo) => boolean
      __tetherAIActiveEditRoute?: (route: AIRouteSettingsInfo) => boolean
      __tetherAIActiveCloseProvider?: () => boolean
      __tetherAIActiveSaveProvider?: () => boolean
      __tetherAIActiveProviderFormChange?: (next: ProviderFormState | null) => boolean
      __tetherAIActiveCloseRoute?: () => boolean
      __tetherAIActiveSaveRoute?: () => boolean
      __tetherAIActiveRouteFormChange?: (next: RouteFormState | null) => boolean
      __tetherAIDetailTicket?: number
      __tetherAIDetailEntityId?: string
      __tetherAIProviderTicket?: number
      __tetherAIProviderEntityId?: string
      __tetherAIRouteTicket?: number
      __tetherAIRouteEntityId?: string
    }
    w.__tetherAIActiveRefreshHandler = handleRefresh
    w.__tetherAIActiveVariantHandler = handleVariantChange
    w.__tetherAIActiveTabHandler = handleTabChange
    w.__tetherAIActiveLoadHandler = load
    w.__tetherAIActiveOpenDetail = handleOpenDetail
    w.__tetherAIActiveOpenProvider = handleOpenAddProvider
    w.__tetherAIActiveOpenRoute = handleOpenAddRoute
    w.__tetherAIActiveSaveConfig = saveConfig
    w.__tetherAIActiveReloadDaemon = reloadDaemon
    w.__tetherAIActivationLease = activationLease
    w.__tetherAIActiveLeases = activeAILeases
    w.__tetherAIRetiredLeases = retiredAILeases
    w.__tetherAIRetainedCallback = handleRefresh
    w.__tetherAIActiveCloseDetail = detailView
      ? () => handleCloseDetail(detailTicket, detailEntityId)
      : undefined
    w.__tetherAIActiveEditProvider = detailView
      ? (p) => handleEditProvider(detailTicket, detailEntityId, p)
      : undefined
    w.__tetherAIActiveEditRoute = detailView
      ? (r) => handleEditRoute(detailTicket, detailEntityId, r)
      : undefined
    w.__tetherAIActiveCloseProvider = providerForm
      ? () => handleCloseProviderForm(providerTicket, providerEntityId)
      : undefined
    w.__tetherAIActiveSaveProvider = providerForm
      ? () => saveProvider(providerTicket, providerEntityId)
      : undefined
    w.__tetherAIActiveProviderFormChange = providerForm
      ? (next) => handleProviderFormChange(next, providerTicket, providerEntityId)
      : undefined
    w.__tetherAIActiveCloseRoute = routeForm
      ? () => handleCloseRouteForm(routeTicket, routeEntityId)
      : undefined
    w.__tetherAIActiveSaveRoute = routeForm
      ? () => saveRoute(routeTicket, routeEntityId)
      : undefined
    w.__tetherAIActiveRouteFormChange = routeForm
      ? (next) => handleRouteFormChange(next, routeTicket, routeEntityId)
      : undefined
    w.__tetherAIDetailTicket = detailTicket
    w.__tetherAIDetailEntityId = detailEntityId
    w.__tetherAIProviderTicket = providerTicket
    w.__tetherAIProviderEntityId = providerEntityId
    w.__tetherAIRouteTicket = routeTicket
    w.__tetherAIRouteEntityId = routeEntityId

    if (!w.__tetherAICallbackHistory) {
      w.__tetherAICallbackHistory = []
    }
    w.__tetherAICallbackHistory.push(handleRefresh)
  }, [
    activationLease,
    detailEntityId,
    detailTicket,
    detailView,
    handleCloseDetail,
    handleCloseProviderForm,
    handleCloseRouteForm,
    handleEditProvider,
    handleEditRoute,
    handleOpenAddProvider,
    handleOpenAddRoute,
    handleOpenDetail,
    handleProviderFormChange,
    handleRefresh,
    handleRouteFormChange,
    handleTabChange,
    handleVariantChange,
    load,
    providerEntityId,
    providerForm,
    providerTicket,
    reloadDaemon,
    routeEntityId,
    routeForm,
    routeTicket,
    saveConfig,
    saveProvider,
    saveRoute,
  ])

  const isReachable =
    currentVariant === "blocked-health" ? false : (settings?.runtime.daemon_reachable ?? true)

  if (forcedAppearance === "error" || (error && !settings && !runtime)) {
    return (
      <div
        ref={rootRef}
        className="tether-empty-box tether-ai-root"
        data-screen="ai"
        data-testid="tether-ai-error"
      >
        <EmptyState
          variant="error"
          title="Could not load AI gateway data"
          description={error ?? forcedErrorMessage ?? "Could not load AI gateway data"}
        />
      </div>
    )
  }

  if (forcedAppearance === "loading" || (loading && !settings && !runtime)) {
    return (
      <div
        ref={rootRef}
        className="tether-empty-box tether-ai-root"
        data-screen="ai"
        data-testid="tether-ai-loading"
      >
        <EmptyState
          variant="empty"
          title="Loading AI gateway data..."
          description="Reading global.yaml and runtime surfaces."
          aria-busy="true"
        />
      </div>
    )
  }

  if (forcedAppearance === "empty" || (!settings && !runtime)) {
    return (
      <div
        ref={rootRef}
        className="tether-empty-box tether-ai-root"
        data-screen="ai"
        data-testid="tether-ai-empty"
      >
        <EmptyState
          variant="empty"
          title="No AI providers"
          description="Add an AI provider to begin routing requests."
        />
      </div>
    )
  }

  return (
    <div ref={rootRef} className="tether-ai-root" data-screen="ai">
      <header className="tether-ai-header">
        <div className="tether-ai-header-left">
          <div className="flex items-center gap-2">
            <h1 className="tether-ai-caption">Tether AI Gateway</h1>
            <span className="tether-ai-specimen-badge">Specimen</span>
          </div>
          <div className="tether-ai-catalog-root">/home/chrispian/.tether/catalog</div>
        </div>

        {showIdentityLinks && (
          <nav aria-label="Operations identity links" className="tether-ai-links">
            <a href="/?example=torque" className="tether-id-link">
              Torque Operations
            </a>
            <a href="/?view=Event+Ledger" className="tether-id-link">
              Event Ledger
            </a>
            <a href="/?view=Run+Explorer" className="tether-id-link">
              Run Explorer
            </a>
            <a href="/?example=administration" className="tether-id-link">
              Administration
            </a>
            <a href="/?example=tether&screen=overview" className="tether-id-link">
              Overview
            </a>
          </nav>
        )}

        <div className="tether-ai-header-right">
          {showVariantSelector && (
            <label className="flex items-center gap-1.5 text-xs text-text-subtle">
              <span>Dataset:</span>
              <select
                aria-label="Dataset variant"
                className="tether-select text-xs h-7 py-0 px-2 w-auto"
                value={currentVariant}
                onChange={(e) => handleVariantChange(e.target.value as OverviewVariantKey)}
              >
                <option value="standard">standard</option>
                <option value="blocked-health">blocked-health</option>
                <option value="degraded-reliability">degraded-reliability</option>
                <option value="combined-adverse">combined-adverse</option>
              </select>
            </label>
          )}

          <span
            className="dash-status-badge shrink-0"
            data-status={isReachable ? "done" : "blocked"}
          >
            <StatusBadge status={isReachable ? "done" : "blocked"} />
          </span>
        </div>
      </header>

      <ListPageLayout
        header={null}
        scrollRef={scrollRef}
        tabs={
          <TabStrip
            tabs={tabs}
            value={tab}
            onChange={handleTabChange}
            actions={
              <div className="flex items-center gap-2">
                {tab === "providers" && (
                  <Button variant="outline" size="sm" onClick={handleOpenAddProvider}>
                    <Plus className="h-3.5 w-3.5" />
                    Add provider (specimen)
                  </Button>
                )}
                {tab === "routes" && (
                  <Button variant="outline" size="sm" onClick={handleOpenAddRoute}>
                    <Plus className="h-3.5 w-3.5" />
                    Add route (specimen)
                  </Button>
                )}
                <Button
                  variant={dirty ? "default" : "outline"}
                  size="sm"
                  onClick={saveConfig}
                  disabled={!draftConfig}
                  title="Effectful writes are inert fixture specimens"
                >
                  Save config (specimen)
                </Button>
                <Button
                  variant={isReachable ? "outline" : "default"}
                  size="sm"
                  onClick={reloadDaemon}
                  disabled={reloadingDaemon}
                  title="cerberus resource reload tether-daemon-service (specimen)"
                >
                  <RefreshCw className={cn("h-3.5 w-3.5", reloadingDaemon && "animate-spin")} />
                  {reloadingDaemon ? "Reloading" : "Reload daemon (specimen)"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={loading}
                  aria-label="Refresh AI gateway data"
                >
                  <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
                  Refresh
                </Button>
              </div>
            }
          />
        }
        summary={
          <div className="dash-summary-cards">
            <SummaryCards cards={summaryCards} />
          </div>
        }
        filters={
          <div className="tether-ai-filters">
            <div className="tether-ai-filters-content">
              <span className="text-text-subtle">
                Manage the `global.yaml` AI gateway config, then reload the daemon so provider and
                routing changes take effect at runtime.
              </span>
              <span className="tether-ai-specimen-badge">Fixture specimen: mutations inert</span>
              {settings?.runtime.last_error && (
                <span className="text-status-blocked">{settings.runtime.last_error}</span>
              )}
              {message && <span className="text-status-done">{message}</span>}
              {error && <span className="text-status-blocked">{error}</span>}
            </div>
          </div>
        }
      >
        {tab === "config" && draftConfig && (
          <div className="grid gap-3 p-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <section className="tether-section-box">
              <div className="tether-section-title">
                <Shield className="h-4 w-4 text-text-soft" />
                <h2>Routing defaults</h2>
              </div>
              <div className="grid gap-3">
                <FormField label="Default provider order">
                  <textarea
                    className="tether-textarea"
                    value={(draftConfig.default_provider_order ?? []).join("\n")}
                    readOnly
                    placeholder={"anthropic\ngemini\nopenai"}
                  />
                </FormField>
              </div>
            </section>

            <section className="tether-section-box">
              <div className="tether-section-title">
                <Shield className="h-4 w-4 text-text-soft" />
                <h2>Global policy</h2>
              </div>
              <PolicyFields value={policyToForm(draftConfig.policy)} readOnly />
            </section>
          </div>
        )}

        {tab === "providers" && (
          <DataTable
            items={providerList}
            columns={providerColumns}
            getRowId={(provider) => provider.id}
            initialSort={{ key: "id", dir: "asc" }}
            onRowOpen={(_, item) => handleOpenDetail({ kind: "provider", item })}
            rowAriaLabel={(provider) => `Open AI provider ${provider.id}`}
            scrollRootRef={scrollRef}
            emptyState={
              <EmptyState
                variant="empty"
                title={loading ? "Loading providers..." : "No AI providers"}
                description={
                  loading ? "Reading global.yaml." : "Add an AI provider to begin routing requests."
                }
              />
            }
          />
        )}

        {tab === "routes" && (
          <DataTable
            items={routeList}
            columns={routeColumns}
            getRowId={(route) => routeKey(route)}
            initialSort={{ key: "provider", dir: "asc" }}
            onRowOpen={(_, item) => handleOpenDetail({ kind: "route", item })}
            rowAriaLabel={(route) => `Open AI route ${route.provider} ${route.model}`}
            scrollRootRef={scrollRef}
            emptyState={
              <EmptyState
                variant="empty"
                title={loading ? "Loading routes..." : "No explicit routes"}
                description={
                  loading
                    ? "Reading global.yaml."
                    : "Routes are optional. The daemon falls back to provider/model order when none are configured."
                }
              />
            }
          />
        )}

        {tab === "runtime" && (
          <div className="grid gap-3 p-3 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="grid gap-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <MetricCard
                  label="Daemon"
                  value={isReachable ? "reachable" : "offline"}
                  sub={settings?.runtime.last_error || "AI read surfaces are available."}
                />
                <MetricCard label="Providers" value={runtimeProviderList.length} />
                <MetricCard label="Models" value={runtimeModelList.length} />
              </div>
              <div className="tether-section-box p-0 overflow-hidden">
                <div className="border-b border-border px-3 py-2 text-caption uppercase tracking-label text-text-subtle">
                  Live providers
                </div>
                <DataTable
                  items={runtimeProviderList}
                  columns={runtimeProviderColumns}
                  getRowId={(provider) => provider.id}
                  initialSort={{ key: "id", dir: "asc" }}
                  scrollRootRef={scrollRef}
                />
              </div>
              <div className="tether-section-box p-0 overflow-hidden">
                <div className="border-b border-border px-3 py-2 text-caption uppercase tracking-label text-text-subtle">
                  Live routes
                </div>
                <DataTable
                  items={runtimeRouteList}
                  columns={runtimeRouteColumns}
                  getRowId={(route) =>
                    `${route.provider}:${route.model}:${route.mode ?? ""}:${route.intent ?? ""}`
                  }
                  initialSort={{ key: "provider", dir: "asc" }}
                  scrollRootRef={scrollRef}
                />
              </div>
            </div>
            <div className="tether-section-box p-0 overflow-hidden">
              <div className="border-b border-border px-3 py-2 text-caption uppercase tracking-label text-text-subtle">
                Configured model runtime view
              </div>
              <DataTable
                items={runtimeModelList}
                columns={runtimeModelColumns}
                getRowId={(model) => `${model.configured_provider_id}:${model.id}`}
                initialSort={{ key: "configured_provider_id", dir: "asc" }}
                scrollRootRef={scrollRef}
              />
            </div>
          </div>
        )}

        {tab === "usage" && (
          <div className="grid gap-3 p-3">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
              <MetricCard label="Requests" value={usage?.summary.requests ?? 0} />
              <MetricCard label="Successes" value={usage?.summary.successes ?? 0} />
              <MetricCard label="Errors" value={usage?.summary.errors ?? 0} />
              <MetricCard
                label="Input tokens"
                value={compactNumber(usage?.summary.input_tokens ?? 0)}
              />
              <MetricCard
                label="Output tokens"
                value={compactNumber(usage?.summary.output_tokens ?? 0)}
              />
              <MetricCard
                label="Estimated cost"
                value={formatUSD(usage?.summary.estimated_cost_usd)}
              />
            </div>
            <div className="grid gap-3 xl:grid-cols-3">
              <BreakdownTable title="By provider" rows={usage?.summary.by_provider} />
              <BreakdownTable title="By model" rows={usage?.summary.by_model} />
              <BreakdownTable title="By operation" rows={usage?.summary.by_operation} />
            </div>
          </div>
        )}

        {tab === "audit" && (
          <DataTable
            items={auditList}
            columns={auditColumns}
            getRowId={(event) => `${event.id}`}
            initialSort={{ key: "timestamp", dir: "desc" }}
            onRowOpen={(_, item) => handleOpenDetail({ kind: "audit", item })}
            rowAriaLabel={(event) => `Open AI audit event ${event.id}`}
            scrollRootRef={scrollRef}
            emptyState={
              <EmptyState
                variant="empty"
                title={loading ? "Loading audit..." : "No AI audit rows"}
                description={
                  loading
                    ? "Reading daemon audit surfaces."
                    : "Run AI traffic through the gateway to populate audit history."
                }
              />
            }
          />
        )}

        {tab === "budgets" && (
          <DataTable
            items={budgetList}
            columns={budgetColumns}
            getRowId={(budget) =>
              `${budget.provider}:${budget.model}:${budget.mode ?? ""}:${budget.intent ?? ""}`
            }
            initialSort={{ key: "provider", dir: "asc" }}
            onRowOpen={(_, item) => handleOpenDetail({ kind: "budget", item })}
            rowAriaLabel={(budget) => `Open AI budget ${budget.provider} ${budget.model}`}
            scrollRootRef={scrollRef}
            emptyState={
              <EmptyState
                variant="empty"
                title={loading ? "Loading budgets..." : "No durable budgets"}
                description={
                  loading
                    ? "Reading daemon budget surfaces."
                    : "Add usage_budget policy to a global, provider, or route policy block."
                }
              />
            }
          />
        )}
      </ListPageLayout>

      <ProviderDialog
        form={providerForm}
        ticket={providerTicket}
        entityId={providerEntityId}
        containerRef={providerDialogRef}
        catalog={providerForm ? providerCatalogs[providerForm.type] : undefined}
        onChange={(next) => handleProviderFormChange(next, providerTicket, providerEntityId)}
        onClose={() => handleCloseProviderForm(providerTicket, providerEntityId)}
        onSave={() => saveProvider(providerTicket, providerEntityId)}
      />
      <RouteDialog
        form={routeForm}
        ticket={routeTicket}
        entityId={routeEntityId}
        containerRef={routeDialogRef}
        onChange={(next) => handleRouteFormChange(next, routeTicket, routeEntityId)}
        onClose={() => handleCloseRouteForm(routeTicket, routeEntityId)}
        onSave={() => saveRoute(routeTicket, routeEntityId)}
      />
      <AIDetailDialog
        detail={detailView}
        ticket={detailTicket}
        entityId={detailEntityId}
        containerRef={detailDialogRef}
        onClose={() => handleCloseDetail(detailTicket, detailEntityId)}
        onEditProvider={(provider) => handleEditProvider(detailTicket, detailEntityId, provider)}
        onDeleteProvider={(provider) => deleteProvider(detailTicket, detailEntityId, provider)}
        onEditRoute={(route) => handleEditRoute(detailTicket, detailEntityId, route)}
        onDeleteRoute={(route) => deleteRoute(detailTicket, detailEntityId, route)}
      />
    </div>
  )
}

function ProviderDialog({
  form,
  ticket,
  entityId,
  containerRef,
  catalog,
  onChange,
  onClose,
  onSave,
}: {
  form: ProviderFormState | null
  ticket: number
  entityId: string
  containerRef: React.RefObject<HTMLDivElement | null>
  catalog?: AIProviderCatalogInfo
  onChange: (next: ProviderFormState | null) => void
  onClose: () => void
  onSave: () => void
}) {
  const [customModel, setCustomModel] = useState("")

  const formKey = `${form?.id ?? ""}:${form?.type ?? ""}`
  useEffect(() => {
    if (formKey) {
      setCustomModel("")
    }
  }, [formKey])

  function update(patch: Partial<ProviderFormState>) {
    if (form) onChange({ ...form, ...patch })
  }

  const catalogItems: TransferListItem[] = useMemo(() => {
    const mapped: TransferListItem[] =
      catalog?.models.map((model) => ({
        value: model.id,
        label: model.id,
        description: modelCatalogDescription(model),
        meta: modelCatalogMeta(model),
        keywords: [
          model.id,
          model.name ?? "",
          model.family ?? "",
          ...(model.input_modalities ?? []),
          ...(model.output_modalities ?? []),
        ],
      })) ?? []
    if (!form) return mapped
    const present = new Set(mapped.map((item) => item.value))
    const manual = form.models.filter((id) => !present.has(id)).map(fallbackModelItem)
    return [...mapped, ...manual]
  }, [catalog?.models, form])

  const defaultModelItems = useMemo(() => {
    if (!form) return []
    const itemMap = new Map(catalogItems.map((item) => [item.value, item]))
    return form.models.map((id) => itemMap.get(id) ?? fallbackModelItem(id))
  }, [catalogItems, form])

  function addCustomModel() {
    if (!form) return
    const next = customModel.trim()
    if (!next || form.models.includes(next)) return
    const nextModels = [...form.models, next]
    update({
      models: nextModels,
      defaultModel: form.defaultModel || next,
    })
    setCustomModel("")
  }

  return (
    <DetailDialog
      open={form !== null}
      onClose={onClose}
      title={form?.id ? `Edit ${form.id} (specimen)` : "Add AI provider (specimen)"}
      widthClassName="w-[760px] max-w-[calc(100vw-2rem)]"
      footer={
        <div className="flex justify-between items-center w-full gap-2">
          <span className="text-caption text-text-subtle uppercase tracking-wider">
            Fixture specimen: writes inert
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="default" size="sm" onClick={onSave} disabled={!form}>
              Save (specimen)
            </Button>
          </div>
        </div>
      }
    >
      <div
        ref={containerRef}
        data-dialog-ticket={ticket}
        data-dialog-entity={entityId}
        data-dialog-type="provider"
      >
        {form && (
          <>
            <DetailSection title="Provider">
              <div className="grid gap-3">
                <div className="grid gap-3 sm:grid-cols-[1fr_12rem_8rem]">
                  <FormField label="Provider ID">
                    <input
                      aria-label="Provider ID"
                      className="tether-input"
                      value={form.id}
                      onChange={(event) => update({ id: event.target.value })}
                      placeholder="provider-primary"
                    />
                  </FormField>
                  <FormField label="Type">
                    <select
                      className="tether-select"
                      value={form.type}
                      onChange={(event) => update({ type: event.target.value })}
                    >
                      <option value="anthropic">anthropic</option>
                      <option value="gemini">gemini</option>
                      <option value="openai">openai</option>
                      <option value="openai-compatible">openai-compatible</option>
                    </select>
                  </FormField>
                  <FormField label="Enabled">
                    <label className="flex h-8 items-center gap-2 border border-border bg-bg px-2 text-xs text-text-soft rounded-sm">
                      <input
                        type="checkbox"
                        checked={form.enabled}
                        onChange={(event) => update({ enabled: event.target.checked })}
                      />
                      Enabled
                    </label>
                  </FormField>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <FormField label="Legacy single model">
                    <input
                      className="tether-input"
                      value={form.model}
                      onChange={(event) => update({ model: event.target.value })}
                      placeholder="claude-sonnet-4-20250514"
                    />
                  </FormField>
                  <FormField label="Default model">
                    <div className="flex h-8 items-center">
                      <Combobox
                        items={defaultModelItems}
                        value={form.defaultModel || null}
                        onChange={(value) => update({ defaultModel: value ?? "" })}
                        ariaLabel="Select default model"
                        placeholder={
                          form.models.length > 0 ? "Select default model" : "Add models first"
                        }
                        searchPlaceholder="Search selected models"
                        emptyText="No selected models."
                        clearable
                      />
                    </div>
                  </FormField>
                </div>
                <FormField label="Configured models">
                  <div className="grid gap-3">
                    <TransferList
                      items={catalogItems}
                      selected={form.models}
                      onChange={(next) =>
                        update({
                          models: next,
                          defaultModel: next.includes(form.defaultModel)
                            ? form.defaultModel
                            : (next[0] ?? ""),
                        })
                      }
                      availableTitle={
                        catalog?.vendor_provider_name
                          ? `${catalog.vendor_provider_name} suggestions`
                          : "Available models"
                      }
                      selectedTitle="Configured models"
                      emptyAvailableText={
                        catalog?.error
                          ? "Model catalog unavailable right now."
                          : "No catalog models found for this provider type."
                      }
                      emptySelectedText="No configured models yet."
                    />
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input
                        className="tether-input"
                        value={customModel}
                        onChange={(event) => setCustomModel(event.target.value)}
                        placeholder="Add custom model ID for local or vendor-specific variants"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addCustomModel}
                        disabled={!customModel.trim()}
                      >
                        Add custom model
                      </Button>
                    </div>
                    <div className="text-label text-text-subtle">
                      {catalog?.error
                        ? `Catalog lookup error: ${catalog.error}`
                        : form.type === "gemini"
                          ? catalog?.last_fetched_at
                            ? `Gemini suggestions come from Google models.dev. Fetched ${formatRelativeTime(catalog.last_fetched_at)}.`
                            : "Gemini suggestions come from Google models.dev when available."
                          : form.type === "openai-compatible"
                            ? "OpenAI-compatible uses the OpenAI catalog as a suggestion set. Add custom local model IDs when needed."
                            : catalog?.last_fetched_at
                              ? `Catalog data fetched ${formatRelativeTime(catalog.last_fetched_at)}.`
                              : "Catalog suggestions come from models.dev when available."}
                    </div>
                  </div>
                </FormField>
                <div className="grid gap-3 sm:grid-cols-2">
                  <FormField label="Secret ref">
                    <input
                      className="tether-input"
                      value={form.secretRef}
                      onChange={(event) => update({ secretRef: event.target.value })}
                      placeholder="keychain://provider/account"
                    />
                  </FormField>
                  <FormField label="Base URL">
                    <input
                      className="tether-input"
                      value={form.baseURL}
                      onChange={(event) => update({ baseURL: event.target.value })}
                      placeholder="http://127.0.0.1:11434/v1"
                    />
                  </FormField>
                </div>
              </div>
            </DetailSection>
            <DetailSection title="Policy">
              <PolicyFields value={form.policy} onChange={(next) => update({ policy: next })} />
            </DetailSection>
          </>
        )}
      </div>
    </DetailDialog>
  )
}

function RouteDialog({
  form,
  ticket,
  entityId,
  containerRef,
  onChange,
  onClose,
  onSave,
}: {
  form: RouteFormState | null
  ticket: number
  entityId: string
  containerRef: React.RefObject<HTMLDivElement | null>
  onChange: (next: RouteFormState | null) => void
  onClose: () => void
  onSave: () => void
}) {
  function update(patch: Partial<RouteFormState>) {
    if (form) onChange({ ...form, ...patch })
  }

  return (
    <DetailDialog
      open={form !== null}
      onClose={onClose}
      title={form?.provider ? `Edit route ${form.provider} (specimen)` : "Add AI route (specimen)"}
      widthClassName="w-[760px] max-w-[calc(100vw-2rem)]"
      footer={
        <div className="flex justify-between items-center w-full gap-2">
          <span className="text-caption text-text-subtle uppercase tracking-wider">
            Fixture specimen: writes inert
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="default" size="sm" onClick={onSave} disabled={!form}>
              Save (specimen)
            </Button>
          </div>
        </div>
      }
    >
      <div
        ref={containerRef}
        data-dialog-ticket={ticket}
        data-dialog-entity={entityId}
        data-dialog-type="route"
      >
        {form && (
          <>
            <DetailSection title="Route">
              <div className="grid gap-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <FormField label="Provider">
                    <input
                      className="tether-input"
                      value={form.provider}
                      onChange={(event) => update({ provider: event.target.value })}
                      placeholder="anthropic-primary"
                    />
                  </FormField>
                  <FormField label="Model">
                    <input
                      className="tether-input"
                      value={form.model}
                      onChange={(event) => update({ model: event.target.value })}
                      placeholder="claude-sonnet-4-20250514"
                    />
                  </FormField>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <FormField label="Mode">
                    <input
                      className="tether-input"
                      value={form.mode}
                      onChange={(event) => update({ mode: event.target.value })}
                      placeholder="summarize"
                    />
                  </FormField>
                  <FormField label="Intent">
                    <input
                      className="tether-input"
                      value={form.intent}
                      onChange={(event) => update({ intent: event.target.value })}
                      placeholder="support"
                    />
                  </FormField>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <FormField label="Requires tools">
                    <select
                      className="tether-select"
                      value={form.requiresTools}
                      onChange={(event) =>
                        update({ requiresTools: event.target.value as BoolSelect })
                      }
                    >
                      <option value="">unset</option>
                      <option value="true">true</option>
                      <option value="false">false</option>
                    </select>
                  </FormField>
                  <FormField label="Requires reasoning">
                    <select
                      className="tether-select"
                      value={form.requiresReasoning}
                      onChange={(event) =>
                        update({
                          requiresReasoning: event.target.value as BoolSelect,
                        })
                      }
                    >
                      <option value="">unset</option>
                      <option value="true">true</option>
                      <option value="false">false</option>
                    </select>
                  </FormField>
                </div>
              </div>
            </DetailSection>
            <DetailSection title="Policy">
              <PolicyFields value={form.policy} onChange={(next) => update({ policy: next })} />
            </DetailSection>
          </>
        )}
      </div>
    </DetailDialog>
  )
}

function AIDetailDialog({
  detail,
  ticket,
  entityId,
  containerRef,
  onClose,
  onEditProvider,
  onDeleteProvider,
  onEditRoute,
  onDeleteRoute,
}: {
  detail: DetailView | null
  ticket: number
  entityId: string
  containerRef: React.RefObject<HTMLDivElement | null>
  onClose: () => void
  onEditProvider: (provider: AIProviderSettingsInfo) => void
  onDeleteProvider: (provider: AIProviderSettingsInfo) => void
  onEditRoute: (route: AIRouteSettingsInfo) => void
  onDeleteRoute: (route: AIRouteSettingsInfo) => void
}) {
  const provider = detail?.kind === "provider" ? detail.item : null
  const route = detail?.kind === "route" ? detail.item : null
  const audit = detail?.kind === "audit" ? detail.item : null
  const budget = detail?.kind === "budget" ? detail.item : null

  return (
    <DetailDialog
      open={detail !== null}
      onClose={onClose}
      title={
        provider
          ? `Provider ${provider.id}`
          : route
            ? `Route ${route.provider}`
            : audit
              ? `Audit ${audit.id}`
              : budget
                ? `Budget ${budget.provider}`
                : ""
      }
      badge={
        provider ? (
          <Pill tone={provider.enabled ? "success" : "neutral"}>
            {provider.enabled ? "enabled" : "disabled"}
          </Pill>
        ) : route ? (
          <Pill tone="neutral">route</Pill>
        ) : audit ? (
          <Pill
            tone={
              audit.success
                ? "success"
                : audit.event_type === "budget_rejection"
                  ? "warning"
                  : "neutral"
            }
          >
            {audit.event_type}
          </Pill>
        ) : budget ? (
          <Pill tone={budget.error ? "warning" : budget.exhausted ? "warning" : "success"}>
            {budget.error ? "needs input" : budget.exhausted ? "exhausted" : "available"}
          </Pill>
        ) : null
      }
      footer={
        provider ? (
          <div className="flex justify-between items-center w-full gap-2">
            <span className="text-caption text-text-subtle uppercase tracking-wider">
              Fixture specimen: mutations inert
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onDeleteProvider(provider)}>
                <Trash2 className="h-3.5 w-3.5" />
                Delete (specimen)
              </Button>
              <Button variant="default" size="sm" onClick={() => onEditProvider(provider)}>
                <Pencil className="h-3.5 w-3.5" />
                Edit (specimen)
              </Button>
            </div>
          </div>
        ) : route ? (
          <div className="flex justify-between items-center w-full gap-2">
            <span className="text-caption text-text-subtle uppercase tracking-wider">
              Fixture specimen: mutations inert
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onDeleteRoute(route)}>
                <Trash2 className="h-3.5 w-3.5" />
                Delete (specimen)
              </Button>
              <Button variant="default" size="sm" onClick={() => onEditRoute(route)}>
                <Pencil className="h-3.5 w-3.5" />
                Edit (specimen)
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-end w-full">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        )
      }
      widthClassName="w-[760px] max-w-[calc(100vw-2rem)]"
    >
      <div
        ref={containerRef}
        data-dialog-ticket={ticket}
        data-dialog-entity={entityId}
        data-dialog-type="detail"
      >
        {provider && (
          <>
            <DetailSection title="Provider">
              <dl className="grid grid-cols-[minmax(8rem,auto)_1fr] gap-x-4 gap-y-1.5 text-xs">
                <DetailField label="ID">
                  <CopyableId id={provider.id} />
                </DetailField>
                <DetailField label="Type">{provider.type}</DetailField>
                <DetailField label="Default model">
                  {provider.default_model || provider.model || "—"}
                </DetailField>
                <DetailField label="Models">{provider.models?.join(", ") || "—"}</DetailField>
                <DetailField label="Secret ref">{provider.secret_ref || "—"}</DetailField>
                <DetailField label="Base URL">{provider.base_url || "—"}</DetailField>
              </dl>
            </DetailSection>
            <DetailSection title="Policy">
              <p className="text-xs text-text-soft">{policySummary(provider.policy)}</p>
            </DetailSection>
          </>
        )}

        {route && (
          <>
            <DetailSection title="Route">
              <dl className="grid grid-cols-[minmax(8rem,auto)_1fr] gap-x-4 gap-y-1.5 text-xs">
                <DetailField label="Provider">{route.provider}</DetailField>
                <DetailField label="Model">{route.model}</DetailField>
                <DetailField label="Mode">{route.mode || "—"}</DetailField>
                <DetailField label="Intent">{route.intent || "—"}</DetailField>
                <DetailField label="Requires tools">
                  {String(route.requires_tools ?? "unset")}
                </DetailField>
                <DetailField label="Requires reasoning">
                  {String(route.requires_reasoning ?? "unset")}
                </DetailField>
              </dl>
            </DetailSection>
            <DetailSection title="Policy">
              <p className="text-xs text-text-soft">{policySummary(route.policy)}</p>
            </DetailSection>
          </>
        )}

        {audit && (
          <>
            <DetailSection title="Event">
              <dl className="grid grid-cols-[minmax(8rem,auto)_1fr] gap-x-4 gap-y-1.5 text-xs">
                <DetailField label="Type">{audit.event_type}</DetailField>
                <DetailField label="Request ID">{audit.request_id || "—"}</DetailField>
                <DetailField label="Provider">{audit.provider || "—"}</DetailField>
                <DetailField label="Model">{audit.model || "—"}</DetailField>
                <DetailField label="Success">{audit.success ? "true" : "false"}</DetailField>
                <DetailField label="Latency">{audit.latency_ms}ms</DetailField>
                <DetailField label="Input tokens">{audit.input_tokens ?? 0}</DetailField>
                <DetailField label="Output tokens">{audit.output_tokens ?? 0}</DetailField>
                <DetailField label="Cost">{formatUSD(audit.estimated_cost_usd)}</DetailField>
                <DetailField label="When">{audit.timestamp}</DetailField>
              </dl>
            </DetailSection>
            <DetailSection title="Summaries">
              <div className="space-y-3 text-xs text-text-soft">
                <div>
                  <div className="mb-1 text-caption uppercase tracking-label text-text-subtle">
                    Request
                  </div>
                  <p>{audit.request_summary || "—"}</p>
                </div>
                <div>
                  <div className="mb-1 text-caption uppercase tracking-label text-text-subtle">
                    Response
                  </div>
                  <p>{audit.response_summary || audit.error || audit.refusal || "—"}</p>
                </div>
              </div>
            </DetailSection>
          </>
        )}

        {budget && (
          <>
            <DetailSection title="Budget">
              <dl className="grid grid-cols-[minmax(8rem,auto)_1fr] gap-x-4 gap-y-1.5 text-xs">
                <DetailField label="Provider">{budget.provider}</DetailField>
                <DetailField label="Model">{budget.model}</DetailField>
                <DetailField label="Window">{budget.usage_budget.window || "—"}</DetailField>
                <DetailField label="Scope">{budget.usage_budget.scope || "—"}</DetailField>
                <DetailField label="Max cost">
                  {formatUSD(budget.usage_budget.max_cost_usd)}
                </DetailField>
                <DetailField label="Spent">{formatUSD(budget.spent_cost_usd)}</DetailField>
                <DetailField label="Remaining">{formatUSD(budget.remaining_cost_usd)}</DetailField>
                <DetailField label="Window start">{budget.window_start}</DetailField>
                <DetailField label="Filter">
                  <span className="font-mono text-label">{JSON.stringify(budget.filter)}</span>
                </DetailField>
              </dl>
            </DetailSection>
            {budget.error && (
              <DetailSection title="Runtime note">
                <p className="text-xs text-status-blocked">{budget.error}</p>
              </DetailSection>
            )}
          </>
        )}
      </div>
    </DetailDialog>
  )
}
