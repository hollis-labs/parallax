import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@hollis-labs/design-components"
import { Fragment, useLayoutEffect, useRef, useState } from "react"
import { destinations, type Group, groups, matchDestinations } from "./catalog"
import "./switcher.css"
export function KeyboardSwitcher({
  source,
  onNavigate,
  group = "All",
  initialQuery = "",
  withdrawn = false,
  long = false,
  unavailable = false,
}: {
  source: string
  onNavigate: (id: string) => void
  group?: Group
  initialQuery?: string
  withdrawn?: boolean
  long?: boolean
  unavailable?: boolean
}) {
  return (
    <Instance
      key={`${source}/${group}/${initialQuery}/${withdrawn}/${long}/${unavailable}`}
      onNavigate={onNavigate}
      group={group}
      initialQuery={initialQuery}
      withdrawn={withdrawn}
      long={long}
      unavailable={unavailable}
    />
  )
}
function Instance({
  onNavigate,
  group,
  initialQuery,
  withdrawn,
  long,
  unavailable,
}: {
  onNavigate: (id: string) => void
  group: Group
  initialQuery: string
  withdrawn: boolean
  long: boolean
  unavailable: boolean
}) {
  const [query, setQuery] = useState(initialQuery),
    [selected, setSelected] = useState(
      unavailable ? "" : (matchDestinations(initialQuery, group)[0]?.id ?? ""),
    ),
    [, freshLifetime] = useState(0)
  const life = useRef({ alive: false, lease: 0 }),
    active = useRef(selected),
    initialActive = useRef(selected)
  useLayoutEffect(() => {
    life.current.alive = true
    active.current = initialActive.current
    life.current.lease++
    freshLifetime((n) => n + 1)
    return () => {
      life.current.alive = false
      life.current.lease++
      active.current = ""
    }
  }, [])
  const lease = life.current.lease,
    current = () => life.current.alive && life.current.lease === lease
  const rows = destinations.filter((d) => group === "All" || d.group === group)
  const update = (value: string) => {
    if (!current() || value === query) return
    life.current.lease++
    const next = matchDestinations(value, group)[0]?.id ?? ""
    active.current = next
    setSelected(next)
    setQuery(value)
  }
  const select = (value: string) => {
    if (!current() || !rows.some((d) => d.id === value)) return
    active.current = value
    if (value !== selected) setSelected(value)
  }
  const navigate = (value: string) => {
    if (current() && !unavailable && active.current === value && rows.some((d) => d.id === value))
      onNavigate(value)
  }
  return (
    <section className="keyboard-switcher" aria-label="Inline keyboard review switcher">
      <h2>Keyboard view switcher</h2>
      <p>
        Local review navigation · {rows.length} declared views. Type a query, move with
        arrows/Home/End, then Enter. This list has its own bounded suggestion scroll; no commands
        execute.
      </p>
      {unavailable ? (
        <p>Authored unavailable catalogue appearance. No successful empty list is claimed.</p>
      ) : (
        <Command
          label="Find review view"
          value={selected}
          onValueChange={select}
          filter={(value, search) =>
            value === "authored-withdrawn"
              ? "withdrawn review specimen".includes(search.toLowerCase())
                ? 1
                : 0
              : matchDestinations(search, group).some((d) => d.id === value)
                ? 1
                : 0
          }
        >
          <CommandInput
            aria-label="Find review view"
            placeholder="Find a supplied review view…"
            value={query}
            onValueChange={update}
          />
          <CommandList label="Declared review views">
            <CommandEmpty>No matching review views. Clear the query.</CommandEmpty>
            {groups
              .filter((g) => g !== "All" && (group === "All" || g === group))
              .map((g, i) => (
                <Fragment key={g}>
                  {i > 0 && <CommandSeparator />}
                  <CommandGroup heading={g}>
                    {rows
                      .filter((d) => d.group === g)
                      .map((d) => (
                        <CommandItem
                          key={d.id}
                          value={d.id}
                          keywords={[d.group, d.source, d.scope]}
                          onSelect={navigate}
                        >
                          <div className="switcher-option-copy">
                            <span>{d.id}</span>
                            <span>
                              {long
                                ? `${d.scope} · Authored long literal <script>inert</script> https://example.invalid/metadata`
                                : d.source}
                            </span>
                          </div>
                          <CommandShortcut>Enter</CommandShortcut>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </Fragment>
              ))}
            {withdrawn && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Authored withdrawal specimen">
                  <CommandItem value="authored-withdrawn" disabled>
                    <span>Withdrawn review specimen · unavailable, not a real destination</span>
                    <span className="switcher-unavailable-hint">Unavailable</span>
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      )}
      <p className="muted">
        Current active option: {selected || "None"}.{" "}
        {withdrawn && "Withdrawn row is authored and cannot navigate."}
      </p>
    </section>
  )
}
