import { expect, test } from "@playwright/test"
import {
  activityModel,
  aiModel,
  createTetherSysopMockApi,
  overviewModel,
  registryModel,
  tetherSysopFixture,
} from "../src/tether-sysop/model"

test("tether-sysop fixture bundle identity and structure", () => {
  expect(tetherSysopFixture.version).toBe("tether-sysop/v1")
  expect(tetherSysopFixture.generator).toBe("parallax/v10")
  expect(tetherSysopFixture.seed).toBe(4421)
  expect(tetherSysopFixture.clock).toBe("2026-10-04T14:30:00Z")
  expect(tetherSysopFixture.operationsVersion).toBe("operations/v2")
})

test("overview model provides standard and required variants", () => {
  const standard = overviewModel("standard")
  expect(standard.health.status).toBe("ok")
  expect(standard.tool_calls.success_pct).toBeGreaterThanOrEqual(95)
  expect(standard.messages.unread).toBe(0)
  expect(standard.sessions.trend.length).toBe(24)
  expect(standard.tool_calls.trend.length).toBe(24)
  expect(standard.messages.trend.length).toBe(24)
  expect(standard.events.trend.length).toBe(24)
  expect(standard.ai.trend.length).toBe(24)

  const blocked = overviewModel("blocked-health")
  expect(blocked.health.status).toBe("blocked")
  expect(blocked.health.error).toBeTruthy()

  const degraded = overviewModel("degraded-reliability")
  expect(degraded.tool_calls.success_pct).toBeLessThan(95)
  expect(degraded.messages.unread).toBeGreaterThan(0)
  expect(degraded.tool_calls.slow_calls).toBeGreaterThan(0)
  expect(degraded.sessions.success_pct).toBeLessThan(50)
})

test("ai model covers providers, routes, usage, audit, budgets and catalog", () => {
  const ai = aiModel()

  // Providers (3-4 incl disabled)
  expect(ai.settings.config.providers.length).toBeGreaterThanOrEqual(3)
  expect(ai.settings.config.providers.length).toBeLessThanOrEqual(4)
  expect(ai.settings.config.providers.some((p) => !p.enabled)).toBe(true)

  // Routes (>=5)
  expect(ai.settings.config.routes.length).toBeGreaterThanOrEqual(5)

  // Audit events (>=20 incl refusal)
  expect(ai.audit.events.length).toBeGreaterThanOrEqual(20)
  expect(ai.audit.events.some((e) => Boolean(e.refusal))).toBe(true)

  // Budgets (>=3 incl exhausted)
  expect(ai.budgets.budgets.length).toBeGreaterThanOrEqual(3)
  expect(ai.budgets.budgets.some((b) => b.exhausted)).toBe(true)

  // Catalog
  expect(ai.catalog.length).toBeGreaterThanOrEqual(2)
})

test("activity model covers monotonic events, tool calls spread and scope aggregates", () => {
  const act = activityModel()

  // Events (50-100, monotonic seq)
  expect(act.events.events.length).toBeGreaterThanOrEqual(50)
  expect(act.events.events.length).toBeLessThanOrEqual(100)
  for (let i = 1; i < act.events.events.length; i++) {
    expect(act.events.events[i].seq).toBeGreaterThan(act.events.events[i - 1].seq)
  }

  // Tool calls (~30 with duration spread and errors)
  expect(act.tool_calls.tool_calls.length).toBeGreaterThanOrEqual(25)
  expect(act.tool_calls.tool_calls.length).toBeLessThanOrEqual(35)
  expect(act.tool_calls.tool_calls.some((c) => !c.ok)).toBe(true)
  expect(act.tool_calls.tool_calls.some((c) => c.duration_ms >= 1000)).toBe(true)

  // Scopes
  expect(act.scopes.length).toBe(5)
  const totalEventsInScopes = act.scopes.reduce((sum, s) => sum + s.event_count, 0)
  expect(totalEventsInScopes).toBe(act.events.events.length)
})

test("registry model supports filtering by kind, status and text search", () => {
  const all = registryModel()
  expect(all.length).toBe(12)

  const agents = registryModel({ kind: "agent" })
  expect(agents.length).toBe(8)
  const projects = registryModel({ kind: "project" })
  expect(projects.length).toBe(4)

  const active = registryModel({ status: "active" })
  const deprecated = registryModel({ status: "deprecated" })
  expect(active.length).toBeGreaterThan(0)
  expect(deprecated.length).toBeGreaterThan(0)
  expect(active.length + deprecated.length).toBe(12)

  const searched = registryModel({ query: "tether" })
  expect(searched.length).toBeGreaterThan(0)
  for (const row of searched) {
    const text =
      `${row.display_name} ${row.urn} ${row.title ?? ""} ${row.role ?? ""} ${row.project ?? ""}`.toLowerCase()
    expect(text).toContain("tether")
  }
})

test("tether sysop mock api returns matching payloads", async () => {
  const api = createTetherSysopMockApi("degraded-reliability")

  const overview = await api.getOverview()
  expect(overview.tool_calls.success_pct).toBeLessThan(95)
  expect(overview.messages.unread).toBeGreaterThan(0)

  const aiSettings = await api.getAISettings()
  expect(aiSettings.config.providers.length).toBe(4)

  const events = await api.getEvents()
  expect(events.events.length).toBe(64)

  const toolCalls = await api.getToolCalls()
  expect(toolCalls.tool_calls.length).toBe(30)

  const reg = await api.getRegistry({ kind: "agent" })
  expect(reg.rows.length).toBe(8)
})
