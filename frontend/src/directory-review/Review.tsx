import {
  Badge,
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  EmptyState,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@hollis-labs/design-components"
import { useLayoutEffect, useRef, useState } from "react"
import { createAdminPresentationSession } from "../chimera/admin-session"
import { type Appearance, appearances, directoryModel, relationships } from "./model"
import "./review.css"
export function DirectoryReview({
  context = "populated",
  initialState = "recorded",
  sourceCopy = 0,
}: {
  context?: string
  initialState?: Appearance
  sourceCopy?: number
}) {
  const [state, setState] = useState(initialState),
    [reset, setReset] = useState(0)
  const data = directoryModel(state, context, sourceCopy)
  return (
    <section className="directory-review" aria-label="Directory Review composition">
      <p>
        Fictional administration/v1 snapshot · fixed UTC {data.fixture.clock}. Independent of
        operation playback. Relationships are supplied metadata, not identity assurance or
        authorization.
      </p>
      <div className="directory-controls">
        <Label>
          Directory appearance
          <select
            aria-label="Directory appearance"
            value={state}
            onChange={(e) => setState(e.target.value as Appearance)}
          >
            {appearances.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Label>
        <Button onClick={() => setReset((n) => n + 1)}>Reset directory review</Button>
      </div>
      {data.authored && (
        <p>
          Authored {state} presentation over the supplied fixture; source records remain unchanged.
        </p>
      )}
      <Instance key={`${data.source}/${reset}`} data={data} />
    </section>
  )
}
function Instance({ data }: { data: ReturnType<typeof directoryModel> }) {
  const [selected, setSelected] = useState(data.users[0]?.id ?? ""),
    [tab, setTab] = useState("profile"),
    [open, setOpen] = useState(false),
    [inspection, setInspection] = useState(""),
    [busy, setBusy] = useState(false),
    [queued, setQueued] = useState(0),
    [, refreshLifetime] = useState(0)
  const session = useRef<ReturnType<typeof createAdminPresentationSession> | null>(null),
    releases = useRef<Array<() => void>>([]),
    pending = useRef(false)
  const life = useRef({ alive: true, lease: 0 }),
    trigger = useRef<HTMLButtonElement>(null),
    closeToken = useRef<{ lease: number; target: HTMLButtonElement } | null>(null)
  useLayoutEffect(() => {
    const owned = createAdminPresentationSession(data.source, "directory", ["inspect"])
    session.current = owned
    life.current.alive = true
    life.current.lease++
    refreshLifetime((n) => n + 1)
    return () => {
      owned.dispose()
      life.current.alive = false
      life.current.lease++
      closeToken.current = null
    }
  }, [data.source])
  const lease = life.current.lease
  const current = () => life.current.alive && life.current.lease === lease
  const relation = relationships(data, selected)
  const retire = () => {
    session.current?.reset(data.source, `directory/${life.current.lease + 1}`)
    pending.current = false
    setBusy(false)
    life.current.lease++
    closeToken.current = null
    setOpen(false)
    setInspection("")
  }
  const choose = (id: string) => {
    if (!current() || !data.users.some((u) => u.id === id) || id === selected) return
    retire()
    setSelected(id)
    setTab("profile")
  }
  const changeTab = (value: unknown) => {
    if (
      !current() ||
      typeof value !== "string" ||
      !["profile", "roles", "permissions"].includes(value) ||
      value === tab
    )
      return
    retire()
    setTab(value)
  }
  const popup = (next: boolean) => {
    if (!current() || !relation || next === open) return
    const target = trigger.current
    if (!next) {
      session.current?.reset(data.source, `directory/${life.current.lease + 1}`)
      pending.current = false
      setBusy(false)
      setInspection("")
    }
    life.current.lease++
    closeToken.current = !next && target ? { lease: life.current.lease, target } : null
    setOpen(next)
  }
  const inspect = () => {
    if (!current() || !open || !relation || pending.current || !session.current) return
    pending.current = true
    setBusy(true)
    setInspection("")
    const ticket = session.current.begin("inspect")
    const id = relation.user.id
    releases.current.push(() => {
      if (!current() || !life.current.alive || !pending.current) return
      ticket.commit(() => {
        pending.current = false
        setBusy(false)
        setInspection(`Inspected ${id} supplied relationship metadata only`)
      })
    })
    setQueued(releases.current.length)
  }
  const release = () => {
    if (!current()) return
    releases.current.shift()?.()
    setQueued(releases.current.length)
  }
  if (!relation)
    return (
      <EmptyState
        variant="empty"
        title={
          data.blocked
            ? `Directory ${data.state === "recorded" ? "denied" : data.state}`
            : "No supplied users"
        }
        description={
          data.blocked
            ? "Personal details and relationship destinations are withheld; no successful directory receipt is invented."
            : "Successful empty directory appearance: 0 users. No profile selected."
        }
      />
    )
  return (
    <div className="directory-grid">
      <aside aria-label="Supplied users">
        <h2>Supplied users · {data.users.length}</h2>
        {data.users.map((u) => (
          <Button
            key={u.id}
            variant={u.id === selected ? "default" : "outline"}
            onClick={() => choose(u.id)}
            aria-pressed={u.id === selected}
          >
            {u.id} · {u.name}
          </Button>
        ))}
      </aside>
      <Card data-testid="directory-card">
        <CardHeader>
          <CardTitle>
            <h2>{relation.user.name}</h2>
          </CardTitle>
          <CardDescription>
            {relation.user.id} · fictional principal · contact reference {relation.user.contactId}
          </CardDescription>
          <CardAction>
            <Popover open={open} onOpenChange={popup}>
              <PopoverTrigger ref={trigger} render={<Button variant="outline" />}>
                Inspect provenance
              </PopoverTrigger>
              <PopoverContent
                aria-label="Directory provenance"
                finalFocus={() => {
                  const token = closeToken.current
                  closeToken.current = null
                  return token &&
                    life.current.alive &&
                    token.lease === life.current.lease &&
                    token.target.isConnected
                    ? token.target
                    : false
                }}
              >
                <h3>Supplied provenance</h3>
                <p>administration/v1 · fixed UTC {data.fixture.clock}</p>
                <p className="directory-source">Source {data.source}</p>
                <p>
                  Selected {relation.user.id}; role IDs{" "}
                  {relation.user.roleIds.join(", ") || "0 supplied references"}. This metadata
                  performs no authorization.
                </p>
                <Button onClick={inspect} disabled={busy}>
                  Inspect current metadata
                </Button>
                <Button onClick={release} disabled={!queued}>
                  Release oldest metadata inspection ({queued})
                </Button>
                {busy && <p role="status">Local metadata inspection pending; no records change.</p>}
                {inspection && <p role="status">{inspection}</p>}
              </PopoverContent>
            </Popover>
          </CardAction>
        </CardHeader>
        <CardContent>
          <Badge
            variant={
              relation.user.state === "locked"
                ? "outline"
                : relation.user.state === "identified"
                  ? "secondary"
                  : "ghost"
            }
          >
            {relation.user.state}
          </Badge>
          <p>
            Badge is a presentation label, not evaluated access. Locked fixture remains readable; no
            edit controls exist.
          </p>
          <Tabs value={tab} onValueChange={changeTab}>
            <TabsList aria-label="Directory profile sections">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="roles">Roles</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
            </TabsList>
            <TabsContent value="profile">
              <h3>Readonly profile</h3>
              <dl>
                <dt>Fictional email</dt>
                <dd>{relation.user.email}</dd>
                <dt>Role references</dt>
                <dd>{relation.roles.length}</dd>
                <dt>Known distinct permission references</dt>
                <dd>
                  {relation.complete
                    ? relation.permissions.length
                    : "Unknown · unresolved relationship"}
                </dd>
              </dl>
            </TabsContent>
            <TabsContent value="roles">
              <h3>Supplied roles</h3>
              {relation.roles.length ? (
                relation.roles.map((r) => (
                  <section key={r.id}>
                    <h4>{r.record?.label ?? "Missing referenced role"}</h4>
                    <p>{r.id}</p>
                    <Badge variant={r.record ? "outline" : "destructive"}>
                      {r.record
                        ? `${r.record.permissionIds.length} permission references`
                        : "Unknown relationship"}
                    </Badge>
                  </section>
                ))
              ) : (
                <p>0 role references supplied.</p>
              )}
            </TabsContent>
            <TabsContent value="permissions">
              <h3>Supplied permissions</h3>
              {!relation.complete && (
                <p>
                  Permission set unavailable: unresolved role or permission reference. This is not
                  zero permissions.
                </p>
              )}
              {relation.permissions.map((p) => (
                <section key={p.id}>
                  <h4>{p.record?.label ?? "Missing referenced permission"}</h4>
                  <p>
                    {p.id} · {p.record?.description ?? "Unknown description"}
                  </p>
                  <Badge variant="outline">Supplied metadata</Badge>
                </section>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <p>
            Source snapshot {data.fixture.clock} · {relation.roles.length} role references ·{" "}
            {relation.complete
              ? `${relation.permissions.length} distinct permission references`
              : "Unknown permission count"}
            . No profile, role or permission changes.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
