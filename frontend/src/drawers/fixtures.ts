import type { DrawerPinnedCard, DynamicCardTab } from "./types"

export const FIXTURE_CLOCK = "2026-10-04T14:30:00Z"
export const FIXTURE_CLOCK_MS = Date.parse(FIXTURE_CLOCK)
export const FIXTURE_SEED = 4421

export interface DocumentItem {
  id: string
  name: string
  mimeType: string
  sizeBytes: number
  included: boolean
  scope: "session" | "project"
  content: string
}

export interface ReportItem {
  id: string
  title: string
  category: string
  summary: string
  metric: string
  status: "ok" | "warn" | "error"
}

export interface DiffItem {
  id: string
  file: string
  additions: number
  deletions: number
  patch: string
}

export interface ToolCallItemFixture {
  id: string
  toolName: string
  status: "running" | "done" | "error"
  args: Record<string, unknown>
  result?: string
  durationMs: number
}

export interface ArtifactItem {
  id: string
  name: string
  sizeBytes: number
  hash: string
  mimeType: string
  createdTime: string
}

export interface RuntimeFeedItem {
  id: string
  timestamp: string
  level: "info" | "warn" | "error"
  message: string
  source: string
}

export interface ContextSlotItem {
  name: string
  tokens: number
  compactable: boolean
  description: string
}

export interface DrawerFixtureSet {
  availability?: "available" | "unavailable"
  sessionId: string
  sessionTitle: string
  documents: DocumentItem[]
  reports: ReportItem[]
  diffs: DiffItem[]
  toolCalls: ToolCallItemFixture[]
  pinnedCards: DrawerPinnedCard[]
  scratchpadContent: string
  terminal1Output: string[]
  terminal2Output: string[]
  artifacts: ArtifactItem[]
  runtimeFeed: RuntimeFeedItem[]
  tokenUsage: {
    used: number
    ceiling: number
    estimatedCost: string
  }
  contextSlots: ContextSlotItem[]
  initialCardTabs: DynamicCardTab[]
}

export const DRAWER_FIXTURES: Record<string, DrawerFixtureSet> = {
  "CHAT-001": {
    sessionId: "CHAT-001",
    sessionTitle: "Inspect telemetry sampling",
    documents: [
      {
        id: "doc-001",
        name: "architecture.md",
        mimeType: "text/markdown",
        sizeBytes: 4096,
        included: true,
        scope: "project",
        content:
          "# System Architecture\n\n- Runtime: Local daemon on 127.0.0.1:8990\n- State: Local SQLite with Tesseract memory\n- Frontend: Vite 7 + React 19 with Tailwind 4\n- Drawers: Top primary + bottom working resizable candidate",
      },
      {
        id: "doc-002",
        name: "flux-spec.md",
        mimeType: "text/markdown",
        sizeBytes: 8192,
        included: false,
        scope: "session",
        content:
          "# Flux Fidelity Specification\n\n- Token purity: 100% token snapped\n- Drawer navigation: Horizontal tab strip with pagination\n- Persistence: Per-session layout isolation",
      },
    ],
    reports: [
      {
        id: "rep-001",
        title: "Telemetry Ingestion Rate",
        category: "metrics",
        summary: "Ingestion steady at 124 spans/sec across active workers.",
        metric: "124/s",
        status: "ok",
      },
      {
        id: "rep-002",
        title: "Memory Utilization",
        category: "system",
        summary: "Resident memory within 64MB budget quota.",
        metric: "52MB",
        status: "ok",
      },
    ],
    diffs: [
      {
        id: "diff-001",
        file: "frontend/src/drawers/ChatDrawerTabStrip.tsx",
        additions: 45,
        deletions: 12,
        patch:
          "@@ -10,12 +10,45 @@\n+ export interface ChatDrawerTab {\n+   id: string\n+   label: string\n+   active: boolean\n+   runningPip?: boolean\n+ }\n- // legacy tabs\n+ // new tab strip with keyboard navigation",
      },
      {
        id: "diff-002",
        file: "frontend/src/drawers/ResizableTabbedDrawer.tsx",
        additions: 120,
        deletions: 0,
        patch:
          "@@ -0,0 +1,120 @@\n+ export function ResizableTabbedDrawer(props) {\n+   // Controlled drag and keyboard resizing\n+ }",
      },
    ],
    toolCalls: [
      {
        id: "tool-001",
        toolName: "fetch_system_metrics",
        status: "done",
        args: { scope: "local", windowSec: 300 },
        result: '{"cpu": "4.2%", "mem": "52MB", "status": "nominal"}',
        durationMs: 142,
      },
      {
        id: "tool-002",
        toolName: "stream_telemetry_batch",
        status: "running",
        args: { batchId: "b-9941", limit: 50 },
        durationMs: 820,
      },
    ],
    pinnedCards: [
      {
        id: "pin-001",
        card_type: "metric-card",
        content_ref: "rep-001",
        title: "Telemetry Ingestion Card",
        payload: JSON.stringify({ rate: "124/s", target: "100/s", ok: true }),
      },
    ],
    scratchpadContent:
      "# Session Notes (CHAT-001)\n\n- Verified telemetry span sample rate.\n- Top drawer primary documents reviewed.\n- Tab keyboard traversal tests running.",
    terminal1Output: [
      "$ team ls",
      "running (session: agent):",
      "  launch-w1: launch-worker-1",
      "  t-w1: task-parallax-1",
      "$ curl -s 127.0.0.1:8990/api/v1/tasks/CW-20261010-0084",
      '{"id":"CW-20261010-0084","status":"doing"}',
    ],
    terminal2Output: [
      "[debug] session=CHAT-001 state=active lease=4421",
      "[debug] primary_drawer open=false height=240 tab=documents",
      "[debug] working_drawer open=true height=200 tab=scratchpad",
    ],
    artifacts: [
      {
        id: "art-001",
        name: "telemetry-export-001.json",
        sizeBytes: 15420,
        hash: "sha256:7f4a21e0bb51a9",
        mimeType: "application/json",
        createdTime: "2026-10-04T14:20:00Z",
      },
      {
        id: "art-002",
        name: "proof-manifest.json",
        sizeBytes: 3410,
        hash: "sha256:c3941a87e0fa12",
        mimeType: "application/json",
        createdTime: "2026-10-04T14:25:00Z",
      },
    ],
    runtimeFeed: [
      {
        id: "rt-001",
        timestamp: "2026-10-04T14:28:10Z",
        level: "info",
        message: "Session CHAT-001 initialized with standard profile",
        source: "runtime-host",
      },
      {
        id: "rt-002",
        timestamp: "2026-10-04T14:29:45Z",
        level: "info",
        message: "Streaming telemetry turn in progress (tool-002 active)",
        source: "agent-engine",
      },
    ],
    tokenUsage: {
      used: 8000,
      ceiling: 32000,
      estimatedCost: "$0.00",
    },
    contextSlots: [
      {
        name: "user_context",
        tokens: 1200,
        compactable: false,
        description: "Protected session context prompt",
      },
      {
        name: "tool_history",
        tokens: 3400,
        compactable: true,
        description: "Completed tool call signatures",
      },
      {
        name: "transcript_turns",
        tokens: 3400,
        compactable: true,
        description: "Recent message exchange history",
      },
    ],
    initialCardTabs: [
      {
        id: "card:fixture-info-card",
        label: "Fixture Info Card",
        payload: {
          title: "Telemetry Fixture Card",
          category: "verification",
          details: "Seed 4421 · Reference clock 2026-10-04T14:30:00Z",
        },
        focused: false,
        pinned: false,
        createdAt: FIXTURE_CLOCK_MS,
      },
    ],
  },
  "CHAT-002": {
    sessionId: "CHAT-002",
    sessionTitle: "Review gateway permissions",
    documents: [
      {
        id: "doc-201",
        name: "permissions-policy.json",
        mimeType: "application/json",
        sizeBytes: 2048,
        included: true,
        scope: "project",
        content: '{\n  "version": "1.0",\n  "defaultAllow": false,\n  "audit": true\n}',
      },
    ],
    reports: [
      {
        id: "rep-201",
        title: "Permission Audit Log",
        category: "security",
        summary: "Zero privilege escalations detected in the last 24h.",
        metric: "0 escalations",
        status: "ok",
      },
    ],
    diffs: [
      {
        id: "diff-201",
        file: "config/gateway.yaml",
        additions: 14,
        deletions: 3,
        patch: "@@ -20,3 +20,14 @@\n+ rate_limit:\n+   requests_per_minute: 600",
      },
    ],
    toolCalls: [
      {
        id: "tool-201",
        toolName: "verify_access_matrix",
        status: "done",
        args: { role: "admin", subject: "gateway" },
        result: '{"authorized": true}',
        durationMs: 98,
      },
    ],
    pinnedCards: [],
    scratchpadContent:
      "# Notes on Gateway Permissions\n\n- Reviewed scopes for external callers.\n- Verified token snap contracts.",
    terminal1Output: ["$ gateway-verify --check", "✓ all 18 endpoints validated"],
    terminal2Output: ["[debug] session=CHAT-002 access-gate=passed"],
    artifacts: [],
    runtimeFeed: [
      {
        id: "rt-201",
        timestamp: "2026-10-04T14:15:00Z",
        level: "info",
        message: "Gateway permission evaluation complete",
        source: "security-gate",
      },
    ],
    tokenUsage: {
      used: 4500,
      ceiling: 32000,
      estimatedCost: "$0.00",
    },
    contextSlots: [
      {
        name: "security_policy",
        tokens: 1500,
        compactable: false,
        description: "Mandatory security boundary rules",
      },
    ],
    initialCardTabs: [
      {
        id: "card:gateway-status",
        label: "Gateway Status",
        payload: {
          title: "Gateway Audit",
          status: "verified",
        },
        focused: false,
        pinned: true,
        createdAt: FIXTURE_CLOCK_MS - 100000,
      },
    ],
  },
  "CHAT-003": {
    sessionId: "CHAT-003",
    sessionTitle: "Diagnose runtime failure",
    documents: [
      {
        id: "doc-301",
        name: "crash-trace.log",
        mimeType: "text/plain",
        sizeBytes: 12400,
        included: true,
        scope: "session",
        content: "Error: Connection refused (127.0.0.1:8990)\n  at dialTCP (net.go:120)",
      },
    ],
    reports: [
      {
        id: "rep-301",
        title: "Crash Incident Report",
        category: "incident",
        summary: "Process exited unexpectedly during stream compaction.",
        metric: "Exit 1",
        status: "error",
      },
    ],
    diffs: [],
    toolCalls: [
      {
        id: "tool-301",
        toolName: "diagnose_backbone_service",
        status: "error",
        args: { service: "torque" },
        result: "connect: connection refused",
        durationMs: 310,
      },
    ],
    pinnedCards: [],
    scratchpadContent: "# Crash Analysis\n\n- Service was restarting during turn execution.",
    terminal1Output: [
      "$ systemctl --user status torque",
      "Unit torque.service is inactive (stopped)",
    ],
    terminal2Output: ["[error] trace post connection refused"],
    artifacts: [],
    runtimeFeed: [
      {
        id: "rt-301",
        timestamp: "2026-10-04T14:10:00Z",
        level: "error",
        message: "Connection failed to service endpoint",
        source: "client-adapter",
      },
    ],
    tokenUsage: {
      used: 12000,
      ceiling: 32000,
      estimatedCost: "$0.00",
    },
    contextSlots: [
      {
        name: "error_dump",
        tokens: 6000,
        compactable: true,
        description: "Full backtrace dump",
      },
    ],
    initialCardTabs: [],
  },
}

export const UNAVAILABLE_FIXTURES: DrawerFixtureSet = {
  availability: "unavailable",
  sessionId: "UNAVAILABLE",
  sessionTitle: "Session Unavailable",
  documents: [],
  reports: [],
  diffs: [],
  toolCalls: [],
  pinnedCards: [],
  scratchpadContent: "Session data unavailable.",
  terminal1Output: ["[notice] session data unavailable"],
  terminal2Output: [],
  artifacts: [],
  runtimeFeed: [],
  tokenUsage: {
    used: 0,
    ceiling: 0,
    estimatedCost: "$0.00",
  },
  contextSlots: [],
  initialCardTabs: [],
}

export function getDrawerFixtures(sessionId: string): DrawerFixtureSet {
  if (sessionId && Object.hasOwn(DRAWER_FIXTURES, sessionId)) {
    return DRAWER_FIXTURES[sessionId]
  }
  return {
    ...UNAVAILABLE_FIXTURES,
    sessionId: sessionId || "UNKNOWN",
    sessionTitle: sessionId ? `Session Unavailable (${sessionId})` : "Session Unavailable",
  }
}
