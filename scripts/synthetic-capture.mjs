// Deterministic, synthetic capture for the browser tests. Nothing here comes from a live Torque,
// Tether or Tachyon: every name, id, address and timestamp is invented (fixed in 2026-10). The raw
// inputs go through the same projectors the real capture scripts use, so the output keeps the
// shape (and the allowlists) of a real capture.
//   node scripts/synthetic-capture.mjs        writes frontend/tests/data/synthetic-capture.json
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { projectCapture } from './capture-snapshots.mjs'
import { projectPlanner } from './capture-planner.mjs'
import { projectConsole } from './project-console.mjs'
import { validateConsole } from './validate-console.mjs'

const root = new URL('../', import.meta.url)
const out = fileURLToPath(new URL('frontend/tests/data/synthetic-capture.json', root))
const overview = JSON.parse(readFileSync(new URL('frontend/src/fixtures/tether-sysop.json', root))).overview
const at = (day, hour = 9, minute = 0) => new Date(Date.UTC(2026, 9, day, hour, minute)).toISOString()
const capturedAt = at(18, 16)
const pad = (n, w = 3) => String(n).padStart(w, '0')
const origins = {
  torque: 'https://torque.example.test',
  tether: 'https://tether.example.test',
  tachyon: 'https://tachyon.example.test',
}

// ---- Torque tasks and scopes -------------------------------------------------------------
const projects = [
  ['proj-console', 'Example Console'],
  ['proj-platform', 'Example Platform'],
  ['proj-docs', 'Example Docs'],
]
const epics = [
  ['epic-board', 'Review board polish'],
  ['epic-fleet', 'Fleet visibility'],
  ['epic-docs', 'Reference docs'],
]
const sprints = [
  ['sprint-01', 'Sprint 2026-10-A'],
  ['sprint-02', 'Sprint 2026-10-B'],
]
const scopes = [
  ...projects.map(([id, name]) => ({ kind: 'project', id, name })),
  ...epics.map(([id, name]) => ({ kind: 'epic', id, name })),
  ...sprints.map(([id, name]) => ({ kind: 'sprint', id, name })),
]
const statuses = ['doing', 'todo', 'review', 'queued', 'backlog', 'done', 'blocked', 'paused', 'done', 'todo', 'doing', 'backlog']
const verbs = ['Align', 'Document', 'Audit', 'Refactor', 'Tighten', 'Prototype', 'Review', 'Split', 'Measure', 'Simplify', 'Verify', 'Sketch']
const nouns = [
  'filter bar spacing', 'session table sort', 'planner board ages', 'agent timeline labels',
  'keyboard focus order', 'narrow layout wrapping', 'team seat editor', 'export button states',
  'empty state wording', 'tag colour tokens', 'dialog close behaviour', 'overview trend chart',
]
const tagSets = [[], [['ui', 'blue']], [['docs', 'green']], [['ui', 'blue'], ['a11y', 'orange']], [['ops', 'gray']]]
const tasks = Array.from({ length: 36 }, (_, i) => {
  const created = at(1 + (i % 12), 8 + (i % 6), (i * 7) % 60)
  const inbox = i % 6 === 1
  return {
    id: `CW-20261001-${pad(i + 1, 4)}`,
    title: `${verbs[i % verbs.length]} ${nouns[(i * 5) % nouns.length]}`,
    status: statuses[i % statuses.length],
    priority: 1 + (i % 4),
    manual: i % 5 === 0,
    kind: i % 9 === 8 ? 'internal' : 'task',
    executor: ['codex', 'claude', ''][i % 3],
    project_id: projects[i % 3][0],
    epic_id: i % 4 === 3 ? null : epics[i % 3][0],
    sprint_id: i % 2 ? sprints[(i >> 1) % 2][0] : null,
    parent_id: i > 20 && i % 7 === 0 ? `CW-20261001-${pad(i - 19, 4)}` : null,
    collection_id: inbox ? 'coll-reading-list' : null,
    collection_name: inbox ? 'Reading list' : null,
    added_to_collections_at: inbox || i % 6 === 2 ? created : null,
    created_at: created,
    updated_at: at(13 + (i % 6), 6 + ((i * 3) % 14), (i * 11) % 60),
    tags: tagSets[i % tagSets.length].map(([name, color]) => ({ name, slug: name, color })),
    metadata: i % 4 === 0 ? { tether_workstream_id: `ws-${pad(1 + (i % 3))}`, tether_workstream_status: 'active' } : {},
  }
})

// ---- Tether sessions ---------------------------------------------------------------------
const sessionStates = ['running', 'completed', 'completed', 'failed', 'detached', 'completed']
const sessions = Array.from({ length: 36 }, (_, i) => ({
  id: `sess-${pad(i + 1, 4)}-example`,
  launch_id: `launch-${pad(1 + (i % 6))}`,
  project_id: i % 3 === 0 ? 'example-platform' : 'example-console',
  logical_agent_id: `agent-${pad(1 + (i % 6))}`,
  provider_id: i % 2 ? 'codex' : 'claude',
  provider_kind: 'cli',
  state: sessionStates[i % sessionStates.length],
  created_at: at(10 + (i % 8), 7, i),
  updated_at: at(17 + (i % 2), 15 - (i % 14), 59 - i),
  ...(i % 6 === 1 || i % 6 === 2 ? { ended_at: at(17, 14, 59 - i) } : {}),
}))

const base = projectCapture({
  capturedAt,
  torque: {
    origin: origins.torque,
    tasks: {
      path: '/api/v1/tasks?limit=50',
      capturedAt,
      body: { items: tasks, meta: { has_more: true, total: 112, returned: tasks.length, limit: 50 } },
    },
    scopes,
  },
  tether: {
    origin: origins.tether,
    overview: { path: '/api/overview', capturedAt, body: structuredClone(overview) },
    sessions: { path: '/api/sessions', capturedAt, body: { sessions, total: 48 } },
  },
})

// ---- Console (agents, launches, teams, fleet) --------------------------------------------
const rec = (path, body) => ({ origin: origins.tachyon, path, capturedAt, body })
const agentDefs = [
  ['agent-reviewer', 'Example Reviewer', ['reviewer'], 'Reads diffs and reports findings.', ['review-diff'], ['torque.read'], 'default', 'read-only', false, true],
  ['agent-builder', 'Example Builder', ['worker'], 'Implements scoped changes.', ['build', 'test'], ['torque.read', 'torque.write'], 'acceptEdits', 'workspace-write', true, true],
  ['agent-planner', 'Example Planner', ['planner'], 'Drafts and orders plans.', ['plan'], ['torque.read'], 'default', 'read-only', false, true],
  ['agent-operator', 'Example Operator', ['operator'], 'Runs maintenance with full access.', ['ops'], ['*'], 'bypassPermissions', 'danger-full-access', true, true],
  ['agent-writer', 'Example Writer', ['worker'], 'Writes reference documentation.', ['docs'], ['torque.read'], 'default', 'workspace-write', false, true],
  ['agent-retired', 'Example Retired', ['worker'], 'Disabled definition kept for history.', [], [], 'default', 'read-only', false, false],
]
const agents = agentDefs.map(([id, name, roles, description, skills, mcp_scopes, permission_mode, default_sandbox, network, enabled], i) => ({
  id,
  name,
  urn: `urn:example:agent:${id}`,
  enabled,
  roles,
  description,
  skills,
  mcp_scopes,
  mcp: { servers: ['mcp-fs', 'mcp-vcs'].slice(0, 1 + (i % 2)) },
  permissions: { permission_mode, default_sandbox, network },
}))
const launches = [
  ['launch-001', 'agent-reviewer', 'claude'],
  ['launch-002', 'agent-reviewer', 'codex'],
  ['launch-003', 'agent-builder', 'codex'],
  ['launch-004', 'agent-builder', 'claude'],
  ['launch-005', 'agent-planner', 'claude'],
  ['launch-006', 'agent-operator', 'codex'],
  ['launch-007', 'agent-writer', 'claude'],
  ['launch-008', 'agent-retired', 'codex'],
].map(([id, agent, provider], i) => ({
  id,
  agent,
  provider,
  project: i % 2 ? 'example-platform' : 'example-console',
  enabled: id !== 'launch-008',
}))
const seat = (name, role, def, extra = {}) => ({
  name,
  role,
  required: true,
  min: 1,
  max: 1,
  activation: 'on-demand',
  resolution: 'pinned',
  definition_ref: { id: def, revision: 'rev-3', digest: `sha256:${createHash('sha256').update(def).digest('hex').slice(0, 12)}` },
  ...extra,
})
const teams = [
  {
    id: 'team-review', name: 'Review squad', version: 1,
    slots: [seat('lead', 'reviewer', 'agent-reviewer'), seat('scribe', 'worker', 'agent-writer')],
    routing: { coordinator_slot: 'lead' }, authority: { mode: 'scoped' }, policy: { history: 'summary' },
  },
  {
    id: 'team-review', name: 'Review squad', version: 2,
    slots: [
      seat('lead', 'reviewer', 'agent-reviewer'),
      seat('scribe', 'worker', 'agent-writer'),
      seat('builder', 'worker', 'agent-builder', { required: false, min: 0, max: 2 }),
    ],
    routing: { coordinator_slot: 'lead' }, authority: { mode: 'scoped' }, policy: { history: 'full' },
  },
  {
    id: 'team-delivery', name: 'Delivery pair', version: 1,
    slots: [seat('planner', 'planner', 'agent-planner'), seat('builder', 'worker', 'agent-builder')],
    routing: { coordinator_slot: 'planner' }, authority: { mode: 'delegated' }, policy: { history: 'summary' },
  },
]
const procs = [
  ['proc-101', 'claude', 'dashboard-polish', 'ws-001', 'Dashboard polish', 'busy', 4101, 7],
  ['proc-102', 'codex', 'fleet-timeline', 'ws-001', 'Dashboard polish', 'idle', 4102, 11],
  ['proc-103', 'claude', 'docs-sweep', 'ws-002', 'Docs sweep', 'waiting', 4103, 22],
  ['proc-104', 'codex', 'planner-board', 'ws-002', 'Docs sweep', 'busy', 4104, 3],
  ['proc-105', 'claude', 'scratch-review', undefined, undefined, 'unknown', 4105, 50],
  ['proc-106', 'codex', 'ops-maintenance', undefined, undefined, 'idle', 4106, 41],
].map(([id, provider, dir, workstream_id, workstream_name, state, pid, ago]) => ({
  id,
  provider,
  pid,
  state,
  workstream_id,
  workstream_name,
  session_id: `fleet-sess-${id.slice(-3)}`,
  cwd: `/srv/example/work/${dir}`,
  model: provider === 'claude' ? 'example-model-large' : 'example-model-code',
  started_at: at(18, 8, pid % 60),
  last_activity: at(18, 15, 59 - ago),
  unread_messages: ago % 4,
  confidence: { state: 'exact' },
}))
const roster = [
  ['launch-001', 'Reviewer on dashboard', 'fleet-sess-101', 'running', false],
  ['launch-004', 'Builder on timeline', 'fleet-sess-102', 'running', true],
  ['launch-005', 'Planner standby', 'chat-sess-005', 'running', true],
  ['launch-007', 'Writer idle', null, 'stopped', false],
].map(([launch_id, display_name, sid, state, at_turn_boundary]) => ({
  launch_id,
  display_name,
  session: sid ? { id: sid, state, at_turn_boundary, last_activity_at: at(18, 15, 40) } : undefined,
}))
const consoleSnapshot = projectConsole({
  capturedAt,
  agents: rec('/api/agents', { agents }),
  launches: rec('/api/launches', { launches }),
  teams: rec('/api/teams', { imported_at: at(12, 10), teams }),
  fleet: rec('/api/fleet', { agents: procs }),
  roster: rec('/api/roster', { agents: roster }),
})
// A short observed history (page observation); each ends in the captured state.
consoleSnapshot.fleet.observation = { method: 'tachyon-page', endedAt: capturedAt }
const histories = {
  busy: [['seen', 'idle', 15, 30], ['state', 'busy', 15, 40]],
  idle: [['seen', 'busy', 15, 20], ['state', 'idle', 15, 45]],
  waiting: [['seen', 'busy', 15, 10], ['state', 'waiting', 15, 50]],
}
for (const item of consoleSnapshot.fleet.items) {
  const entries = histories[item.state]
  if (!entries) continue
  item.history = entries.map(([kind, state, h, m]) => ({ at: at(18, h, m), kind, state }))
  item.history.at(-1).state = item.state
}
validateConsole(consoleSnapshot)

// ---- Planner -----------------------------------------------------------------------------
const row = (id, title, status, extra = {}) => ({
  id,
  title,
  status,
  tldr: `${title} (synthetic summary).`,
  created: at(3, 9),
  updated: at(15, 11),
  comment_count: id.length % 4,
  ...extra,
})
const lists = {
  priorities: [
    row('pri-001', 'Ship the review board', 'active', { rank: 1, owner: 'team-a' }),
    row('pri-002', 'Stabilise browser tests', 'planned', { rank: 2, owner: 'team-b' }),
    row('pri-003', 'Trim bundle size', 'planned', { rank: 3, owner: 'team-a' }),
    row('pri-004', 'Retire legacy export', 'done', { rank: 4, owner: 'team-b' }),
  ],
  workstreams: [
    row('ws-001', 'Dashboard polish', 'active', { phase: 'build', owner: 'team-a', next_step: 'Review spacing tokens', task_counts: { doing: 2, todo: 3, done: 4 }, tags: ['ui'] }),
    row('ws-002', 'Docs sweep', 'active', { phase: 'review', owner: 'team-b', blockers: ['Waiting for a reviewer'], task_counts: { review: 2, todo: 1 } }),
    row('ws-003', 'Fleet timeline', 'planned', { phase: 'design', owner: 'team-a', task_counts: { backlog: 5 } }),
    row('ws-004', 'Legacy cleanup', 'paused', { phase: 'build', owner: 'team-b' }),
    row('ws-005', 'Export format v2', 'done', { phase: 'landed', owner: 'team-a' }),
  ],
  roadmap: [
    row('road-001', 'Read-only review mode', 'planned', { area: 'review', horizon: 'now', mvp: true }),
    row('road-002', 'Team seat editor', 'exploring', { area: 'builder', horizon: 'next' }),
    row('road-003', 'Overview trends', 'planned', { area: 'ops', horizon: 'later' }),
    row('road-004', 'Dark theme tokens', 'done', { area: 'ui', horizon: 'now', mvp: true }),
  ],
  ideas: [
    row('idea-001', 'Keyboard cheat sheet', 'idea', { kind: 'feature', discuss_in: 'ws-001' }),
    row('idea-002', 'Session diff view', 'exploring', { kind: 'feature' }),
    row('idea-003', 'Planner digest email', 'promoted', { kind: 'process' }),
  ],
  decisions: [
    row('dec-001', 'Adopt the shared table component', 'needs-decision', { area: 'ui', date: '2026-10-14' }),
    row('dec-002', 'Keep captures read-only', 'decided', { area: 'review', date: '2026-10-08' }),
    row('dec-003', 'Defer the export redesign', 'discussing', { area: 'ops', date: '2026-10-16' }),
  ],
  risks: [
    row('risk-001', 'Fixture drift from live data', 'open', { kind: 'quality', severity: 'medium' }),
    row('risk-002', 'Slow table on large lists', 'mitigating', { kind: 'performance', severity: 'low' }),
    row('risk-003', 'Stale reference doc', 'closed', { kind: 'docs', severity: 'low' }),
  ],
  inbox: [
    row('inb-001', 'Typo in settings label', 'new', { kind: 'bug' }),
    row('inb-002', 'Request: pin a view', 'triaged', { kind: 'request' }),
    row('inb-003', 'Duplicate of an older report', 'dismissed', { kind: 'bug' }),
  ],
}
// Decisions are a partial capture (9 at source, 3 captured); the other lists are complete.
const sourceTotals = { priorities: 4, workstreams: 5, roadmap: 4, ideas: 3, decisions: 9, risks: 3, inbox: 3 }
const boardRow = (source, r) => ({ ...r, source })
const ws = lists.workstreams.map((r) => boardRow('workstream', r))
const board = (scope) => ({
  path: `/api/v1/planner/board?scope=${scope}&limit=50`,
  capturedAt,
  body: {
    scope,
    generated_at: capturedAt,
    recent_hours: 72,
    active_hours: 24,
    limit: 50,
    sections: {
      in_flight: [ws[0], ws[1], boardRow('task', row('CW-20261001-0001', 'Align filter bar spacing', 'doing', { workstream: 'Dashboard polish' }))],
      pre_flight: [ws[2], boardRow('task', row('CW-20261001-0002', 'Document session table sort', 'queued', { workstream: 'Fleet timeline' }))],
      landed: [ws[4], boardRow('task', row('CW-20261001-0006', 'Verify export button states', 'done', { workstream: 'Export format v2' }))],
      holds: [boardRow('decision', lists.decisions[0]), boardRow('inbox', lists.inbox[0]), boardRow('risk', lists.risks[0]), ws[3]],
    },
    totals: { in_flight: 5, pre_flight: 7, landed: 12, holds: 6 },
    notices: scope === 'curated' ? ['Curated view: only workstreams tagged board are shown.'] : [],
  },
})
const planner = projectPlanner({
  origin: origins.torque,
  capturedAt,
  lists: Object.fromEntries(
    Object.entries(lists).map(([db, body]) => [db, { path: `/api/v1/planner/${db}`, capturedAt, body, sourceTotal: sourceTotals[db] }]),
  ),
  boards: { curated: board('curated'), all: board('all') },
})

// ---- Assemble ----------------------------------------------------------------------------
const pack = {
  ...base,
  projection:
    'Synthetic test data, not a live capture. Invented tasks, sessions, agents and Planner items shaped like a real capture; see frontend/tests/data/README.md.',
}
delete pack.id
pack.sources = { ...pack.sources, console: consoleSnapshot, torque: { ...pack.sources.torque, planner } }
pack.id = createHash('sha256').update(JSON.stringify(pack)).digest('hex').slice(0, 16)
mkdirSync(dirname(out), { recursive: true })
writeFileSync(`${out}.tmp`, `${JSON.stringify(pack, null, 2)}\n`)
renameSync(`${out}.tmp`, out)
// Keep the committed file in the repository's JSON style so reruns leave no diff.
execFileSync('npx', ['biome', 'format', '--write', out], { cwd: fileURLToPath(new URL('frontend/', root)), stdio: 'ignore' })
console.log(JSON.stringify({ id: pack.id, tasks: tasks.length, sessions: sessions.length, path: out }))
