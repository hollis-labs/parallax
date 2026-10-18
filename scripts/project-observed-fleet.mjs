// Run in the authorized Tachyon browser before downloading anything. Accepts the
// rendered FleetAgentsView's model, not API payloads or arbitrary React state.
export function projectObservedFleet(view, origin) {
  if (!Array.isArray(view.agents) || !view.history || !Number.isFinite(view.now) || !view.live || view.error) throw Error('A healthy live Agents view is required')
  const states = ['busy', 'idle', 'waiting', 'unknown']
  const text = value => typeof value === 'string' ? value.slice(0, 200) : undefined
  const stamp = value => Number.isFinite(value) ? new Date(value).toISOString() : undefined
  const leaf = value => typeof value === 'string' ? value.split('/').filter(Boolean).at(-1) : undefined
  const capturedAt = stamp(view.now)
  const items = view.agents.slice(0, 400).map(a => {
    if (!a.id || !states.includes(a.state)) throw Error('Invalid observed agent')
    const entries = view.history[a.id]
    const history = Array.isArray(entries) && entries.length ? entries.slice(-60).map(e => {
      if (!Number.isFinite(e.at) || e.at > view.now || !states.includes(e.state) || !['seen', 'started', 'state'].includes(e.kind)) throw Error('Invalid observed transition')
      return { at: stamp(e.at), kind: e.kind, state: e.state }
    }).filter((e, i, all) => all.findIndex(other => other.at === e.at && other.kind === e.kind && other.state === e.state) === i) : undefined
    return {
      id: text(a.id), name: text(a.displayName) || leaf(a.cwd) || text(a.provider) || 'Unknown',
      provider: text(a.provider) || 'unknown', pid: a.pid || undefined,
      sessionId: text(a.sessionId), launchId: text(a.chat?.launch_id),
      group: text(a.workstream?.name) || text(a.workstream?.id) || leaf(a.cwd) || text(a.provider) || 'Unassigned',
      workstreamId: text(a.workstream?.id), state: a.state, confidence: text(a.stateConfidence),
      model: text(a.model), startedAt: stamp(a.startedAt), lastActivity: stamp(a.lastActivity),
      messages: Number.isFinite(a.messages) && a.messages >= 0 ? a.messages : undefined,
      kind: a.chat ? 'chat' : 'process', history,
    }
  })
  return {
    origin: new URL(origin).origin, path: '/agents', capturedAt,
    cache: 'Live page observation frozen at capture', items,
    sourceTotal: Object.keys(view.history).length,
    rosterTotal: view.agents.filter(a => a.chat).length,
    truncated: view.agents.length > items.length,
    roster: { origin: new URL(origin).origin, path: '/agents', capturedAt },
    observation: { method: 'tachyon-page', endedAt: capturedAt },
  }
}
