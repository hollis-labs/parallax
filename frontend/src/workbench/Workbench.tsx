import { Button, SearchInput } from "@hollis-labs/design-components"
import { useLayoutEffect, useRef, useState } from "react"
import {
  destinations,
  type Group,
  groups,
  matchDestinations,
  storyDestination,
  viewIcon,
} from "./catalog"
import "./workbench.css"
export function ReviewWorkbench({
  cutoff,
  selected,
  source,
  host,
  onNavigate,
  initialQuery = "",
  initialGroup = "All",
}: {
  cutoff: string
  selected: string | null
  source: string
  host: string
  onNavigate: (id: string) => void
  initialQuery?: string
  initialGroup?: Group
}) {
  return (
    <Instance
      key={`${source}/${initialGroup}/${initialQuery}`}
      cutoff={cutoff}
      selected={selected}
      host={host}
      onNavigate={onNavigate}
      initialQuery={initialQuery}
      initialGroup={initialGroup}
    />
  )
}
function Instance({
  cutoff,
  selected,
  host,
  onNavigate,
  initialQuery,
  initialGroup,
}: {
  cutoff: string
  selected: string | null
  host: string
  onNavigate: (id: string) => void
  initialQuery: string
  initialGroup: Group
}) {
  const [query, setQuery] = useState(initialQuery),
    [group, setGroup] = useState(initialGroup),
    [revision, setRevision] = useState(0)
  const current = useRef({ alive: false, lease: 0 }),
    [, refresh] = useState(0)
  useLayoutEffect(() => {
    current.current.alive = true
    current.current.lease++
    refresh((n) => n + 1)
    return () => {
      current.current.alive = false
      current.current.lease++
    }
  }, [])
  const lease = current.current.lease,
    admitted = () => current.current.alive && current.current.lease === lease
  const matched = matchDestinations(query, group)
  function changeQuery(next: string) {
    if (!admitted() || next === query) return
    current.current.lease++
    setQuery(next)
  }
  function changeGroup(next: string) {
    if (!admitted() || next === group || !groups.includes(next as Group)) return
    current.current.lease++
    setGroup(next as Group)
  }
  function reset() {
    if (!admitted()) return
    current.current.lease++
    setQuery("")
    setGroup("All")
    setRevision((n) => n + 1)
  }
  return (
    <section aria-label="Review destination catalogue" className="workbench">
      <p>
        Explore 26 supplied views. Workbench entry pauses playback; current projected cutoff{" "}
        <time>{cutoff}</time> is retained.{" "}
        {selected ? `Current selected record: ${selected}.` : "No current record selected."} Reload
        restores the known view/settings at its snapshot; cutoff and selection are not serialized.
      </p>
      <div className="workbench-controls">
        <SearchInput
          key={revision}
          value={query}
          onChange={changeQuery}
          ariaLabel="Search review destinations"
          placeholder="Find a view, fixture or limitation…"
          debounceMs={100}
        />
        <label>
          Review group
          <select
            aria-label="Review group"
            value={group}
            onChange={(e) => changeGroup(e.target.value)}
          >
            {groups.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </label>
        <Button onClick={reset}>Reset workbench filters</Button>
      </div>
      <p role="status">
        {matched.length} matching destinations / {destinations.length} declared views. Local review
        navigation; no new data collection.
      </p>
      {!matched.length && (
        <p>No matching review destinations. Clear the search or choose another group.</p>
      )}
      <div className="workbench-grid">
        {matched.map((d) => {
          const Icon = viewIcon(d.icon),
            story = storyDestination(host, d.story)
          return (
            <article key={d.id} aria-label={`${d.id} review destination`}>
              <h2>
                <Icon aria-hidden="true" className="size-4" />
                {d.id}
              </h2>
              <p className="workbench-kind">
                {d.group} · {d.source}
              </p>
              <p>{d.scope}</p>
              <p className="muted">Review limit: {d.gap}</p>
              <div className="workbench-card-actions">
                <Button
                  onClick={() => {
                    if (admitted() && matchDestinations(query, group).some((v) => v.id === d.id))
                      onNavigate(d.id)
                  }}
                >
                  Open {d.id}
                </Button>
                {story ? (
                  <a href={story}>Portable {d.id} story</a>
                ) : (
                  <span>Portable story link unavailable for this host.</span>
                )}
              </div>
              <p className="workbench-story">Representative story: {d.story}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}
