import {
  createAppShellAsideStore,
  createMemoryStorage,
  useAppShellAside,
} from "@hollis-labs/design-app-runtime"
import {
  AppShell,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  InspectionDialog,
  OverlaySidebar,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  useLongPress,
  useShortcut,
} from "@hollis-labs/design-components"
import { OperationsListPage } from "@hollis-labs/kit-dashboard/layout"
import {
  Activity as ActivityIcon,
  ClipboardList,
  GitBranch,
  Play,
  Server,
  Settings,
  Terminal,
  Users,
} from "lucide-react"
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { competingLayer, currentLayer } from "../flux-chat/ownership"
import {
  type Action,
  contributions,
  type Fixture,
  fixture,
  type Group,
  type Item,
  reference,
  resolve,
  type Scenario,
  scenarios,
  subnav,
} from "./model"
import { routePath } from "./route-grammar"

export const diagnostics: {
  actions: string[]
  retained: (() => boolean)[]
  replace?: () => void
  access?: () => void
  layer?: () => void
  fresh: Record<string, () => boolean>
} = { actions: [], retained: [], fresh: {} }
const icons = {
  users: Users,
  play: Play,
  terminal: Terminal,
  activity: ActivityIcon,
  "clipboard-list": ClipboardList,
  server: Server,
  "git-branch": GitBranch,
  settings: Settings,
}
function Icon({ group }: { group: Group }) {
  const Glyph = icons[group.icon as keyof typeof icons] ?? ActivityIcon
  return <Glyph aria-hidden size={18} />
}

/** Slots consume declarative local actions. Popup identity, not ancestry, owns execution. */
function MenuSlot({
  label,
  run,
  generation,
  accessible,
  context = false,
}: {
  label: string
  run: (action: Action) => void
  generation: unknown
  accessible: boolean
  context?: boolean
}) {
  const [open, setOpen] = useState(false)
  const popup = useRef<HTMLDivElement>(null),
    trigger = useRef<HTMLButtonElement>(null)
  const live = useShortcut({
    key: "",
    enabled: false,
    sourceGeneration: generation,
    accessible,
    onTrigger: () => {},
  }).isLive
  const openedGeneration = useRef(generation)
  useLayoutEffect(() => {
    if (openedGeneration.current !== generation || !accessible) setOpen(false)
  }, [generation, accessible])
  const admitted = () =>
    live() && accessible && openedGeneration.current === generation && currentLayer(popup.current)
  const press = useLongPress({
    sourceGeneration: generation,
    activationGeneration: label,
    accessible,
    isAdmitted: () => live() && accessible && !competingLayer(),
    onLongPress: () => {
      openedGeneration.current = generation
      setOpen(true)
    },
  })
  useLayoutEffect(() => {
    const handle = () => {
      if (!admitted()) return false
      run(contributions[0].action)
      return true
    }
    diagnostics.retained.push(handle)
    diagnostics.fresh[label] = handle
  })
  return (
    <DropdownMenu
      open={open}
      modal={false}
      onOpenChange={(value) => {
        if (
          live() &&
          accessible &&
          (value
            ? !competingLayer()
            : !competingLayer([popup.current]) &&
              (!!popup.current?.contains(document.activeElement) ||
                document.activeElement === trigger.current ||
                document.activeElement === document.body))
        ) {
          if (value) openedGeneration.current = generation
          setOpen(value)
        }
      }}
    >
      <DropdownMenuTrigger
        render={
          <Button
            ref={trigger}
            size="sm"
            disabled={!accessible}
            {...(context
              ? {
                  ...press.bindings,
                  onContextMenu: (event: React.MouseEvent) => {
                    if (live() && accessible && !competingLayer()) {
                      event.preventDefault()
                      openedGeneration.current = generation
                      setOpen(true)
                    }
                  },
                }
              : {})}
          />
        }
      >
        {label}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        ref={popup}
        aria-label={label}
        finalFocus={() =>
          openedGeneration.current === generation &&
          live() &&
          accessible &&
          !competingLayer() &&
          (document.activeElement === document.body ||
            popup.current?.contains(document.activeElement))
            ? trigger.current
            : false
        }
      >
        {contributions.map((c) => (
          <DropdownMenuItem
            key={c.id}
            onClick={() => {
              if (admitted()) {
                setOpen(false)
                run(c.action)
              }
            }}
          >
            {c.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
function FixtureRecords({
  generation,
  accessible,
  active,
  navigate,
  run,
}: {
  generation: unknown
  accessible: boolean
  active: boolean
  navigate: (path: string) => void
  run: (action: Action) => void
}) {
  const records = useMemo(
    () => ["4421-alpha", "4421-beta", "board", "opaque/id ? # %"].map((id) => ({ id })),
    [],
  )
  const [query, setQuery] = useState(""),
    [selected, setSelected] = useState<string[]>([]),
    [opened, setOpened] = useState<string | null>(null)
  const matched = records.filter((r) => r.id.includes(query))
  return (
    <div className="h-96 min-h-0 min-w-0">
      <OperationsListPage
        title="Fixture records"
        admittedItems={records}
        matchedItems={matched}
        sourceGeneration={generation}
        accessible={accessible}
        active={active}
        searchQuery={query}
        onSearchChange={setQuery}
        searchAriaLabel="Search fixture records"
        columns={[
          {
            key: "id",
            header: "Local record",
            width: "fill",
            cell: (r) => (
              <div className="flex flex-wrap items-center gap-2 whitespace-normal">
                <span className="mr-auto break-all">Fixture record {r.id}</span>
                <Button size="sm" onClick={() => navigate(routePath("/work/:id", { id: r.id }))}>
                  Inspect {r.id}
                </Button>
                <MenuSlot
                  label={`Row ${r.id}`}
                  generation={generation}
                  accessible={accessible}
                  run={run}
                  context
                />
              </div>
            ),
          },
        ]}
        getRowId={(r) => r.id}
        selectedIds={selected}
        onSelectionChange={setSelected}
        inspector={{
          mode: "inline",
          selectedId: opened,
          onSelect: setOpened,
          title: (r) => `Record ${r.id}`,
          renderBody: (r, scope) => (
            <div className="p-3">
              <p>Local fixture evidence for {r.id}</p>
              <Button onClick={() => scope.run(() => run({ kind: "command", command: "inspect" }))}>
                Inspect admitted record locally
              </Button>
            </div>
          ),
        }}
      />
    </div>
  )
}
function GroupFlyout({
  group,
  items,
  accessible,
  navigate,
}: {
  group: Group
  items: Item[]
  accessible: boolean
  navigate: (route: string, owner?: HTMLElement | null) => void
}) {
  const popup = useRef<HTMLDivElement>(null)
  const live = useShortcut({ key: "", enabled: false, onTrigger: () => {} }).isLive
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            data-nav-control
            aria-label={group.label}
            className="rounded-control p-3 hover:bg-surface-hover"
          />
        }
      >
        <Icon group={group} />
      </DropdownMenuTrigger>
      <DropdownMenuContent ref={popup} aria-label={`${group.label} flyout`}>
        {items.map((item) => (
          <DropdownMenuItem
            key={item.id}
            disabled={!accessible || !!item.reason}
            onClick={() => {
              if (live() && currentLayer(popup.current)) navigate(item.route, popup.current)
            }}
          >
            {item.label}
            {item.reason && ` · ${item.reason}`}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
function Nav({
  model,
  active,
  collapsed,
  navigate,
}: {
  model: Fixture
  active?: Item
  collapsed: boolean
  navigate: (route: string, owner?: HTMLElement | null) => void
}) {
  const [closed, setClosed] = useState<string[]>([]),
    [roving, setRoving] = useState(0)
  const root = useRef<HTMLElement>(null)
  const buttons = () =>
    Array.from(
      root.current?.querySelectorAll<HTMLElement>("[data-nav-control]:not([disabled])") ?? [],
    )
  const move = (delta: number) => {
    const list = buttons()
    const index = list.indexOf(document.activeElement as HTMLElement)
    const next = (Math.max(index, 0) + delta + list.length) % list.length
    setRoving(next)
    list[next]?.focus()
  }
  useShortcut({
    key: "ArrowDown",
    scopeElement: () => root.current,
    sourceGeneration: model,
    isAdmitted: () => !!root.current?.contains(document.activeElement),
    onTrigger: () => move(1),
  })
  useShortcut({
    key: "ArrowUp",
    scopeElement: () => root.current,
    sourceGeneration: model,
    isAdmitted: () => !!root.current?.contains(document.activeElement),
    onTrigger: () => move(-1),
  })
  const groups = (footer: boolean) =>
    model.groups
      .filter((g) => !!g.footer === footer)
      .map((g) => {
        const children = model.items.filter((i) => i.group === g.id && !i.hidden)
        if (collapsed)
          return (
            <GroupFlyout
              key={g.id}
              group={g}
              items={children}
              accessible={model.accessible}
              navigate={navigate}
            />
          )

        return (
          <section
            key={g.id}
            className="space-y-1"
            aria-label={`${g.label} group`}
            data-owner={g.owner}
            data-explicit-owner={g.explicitOwner}
            data-active-path={active?.group === g.id}
          >
            <button
              type="button"
              data-nav-control
              aria-label={g.label}
              aria-expanded={!closed.includes(g.id)}
              className="flex w-full items-center gap-2 rounded-control px-3 py-2 text-caption font-semibold hover:bg-surface-hover"
              onClick={() =>
                setClosed((old) =>
                  old.includes(g.id) ? old.filter((id) => id !== g.id) : [...old, g.id],
                )
              }
            >
              <Icon group={g} />
              {g.label}
              <span className="ml-auto">{closed.includes(g.id) ? "+" : "−"}</span>
            </button>
            {!closed.includes(g.id) &&
              children.map((i) => (
                <button
                  type="button"
                  data-nav-control
                  data-nav-id={i.id}
                  data-active-path={active?.id === i.id || active?.parent === i.id}
                  key={i.id}
                  disabled={!model.accessible || !!i.reason}
                  title={i.reason}
                  aria-current={active?.id === i.id ? "page" : undefined}
                  className={`block w-full rounded-control py-2 pr-3 text-left text-caption ${i.parent ? "pl-8" : "pl-3"} ${active?.id === i.id ? "bg-brand-muted text-brand" : "hover:bg-surface-hover"}`}
                  onClick={() => navigate(i.route)}
                >
                  {i.label}
                  {i.reason && <small className="block text-fg-muted">{i.reason}</small>}
                </button>
              ))}
          </section>
        )
      })
  useLayoutEffect(() => {
    buttons().forEach((node, index) => {
      node.tabIndex = index === Math.min(roving, buttons().length - 1) ? 0 : -1
    })
  })
  return (
    <nav
      ref={root}
      aria-label="Module navigation"
      className={`flex h-full min-h-0 flex-col border-r border-border bg-surface ${collapsed ? "w-16" : "w-64"}`}
    >
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2">{groups(false)}</div>
      <footer className="shrink-0 border-t border-border p-2">{groups(true)}</footer>
    </nav>
  )
}
function PageNavigation({
  tabs,
  variant,
  hash,
  navigate,
  children,
}: {
  tabs: { label: string; route: string }[]
  variant: "top" | "left"
  hash: string
  navigate: (route: string) => void
  children: React.ReactNode
}) {
  const active = tabs.find((t) => `#${t.route}` === hash.split("?")[0])?.route ?? tabs[0]?.route
  if (!active) return <div className="mt-4">{children}</div>
  return (
    <Tabs
      value={active}
      onValueChange={(value) => {
        if (typeof value === "string") navigate(value)
      }}
      orientation={variant === "top" ? "horizontal" : "vertical"}
      className={`mt-4 flex gap-4 ${variant === "top" ? "flex-col" : "flex-col sm:flex-row"}`}
    >
      <nav aria-label="Page sub-navigation">
        <TabsList
          variant="line"
          className={variant === "left" ? "flex flex-col" : "flex flex-wrap"}
        >
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.route}
              value={tab.route}
              nativeButton={false}
              render={<a href={`#${tab.route}`} onClick={(event) => event.preventDefault()} />}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </nav>
      <TabsContent value={active} className="min-w-0 flex-1">
        {children}
      </TabsContent>
    </Tabs>
  )
}
export function TachyonNav({
  initialScenario = "populated",
  initialVariant = "top",
}: {
  initialScenario?: Scenario
  initialVariant?: "top" | "left"
}) {
  const [scenario, setScenario] = useState(initialScenario),
    [variant, setVariant] = useState(initialVariant),
    [rail, setRail] = useState(false),
    [drawer, setDrawer] = useState(false),
    [hash, setHash] = useState(() => location.hash || "#/work"),
    [epoch, setEpoch] = useState(0),
    [access, setAccess] = useState(true),
    [layer, setLayer] = useState(true),
    [message, setMessage] = useState("No local action yet"),
    [modal, setModal] = useState(false),
    [nested, setNested] = useState(false)
  const modalOpener = useRef<HTMLElement | null>(null)
  const modalGeneration = useRef<unknown>(null)
  const drawerGeneration = useRef<unknown>(null)
  const popup = useRef<HTMLDivElement>(null),
    drawerPopup = useRef<HTMLDivElement>(null),
    frameRoot = useRef<HTMLDivElement>(null),
    heading = useRef<HTMLHeadingElement>(null)
  const model = useMemo(() => fixture(scenario), [scenario])
  const generation = useMemo(
    () => ({ epoch, scenario, access, layer }),
    [epoch, scenario, access, layer],
  )
  const [asideStore] = useState(() =>
    createAppShellAsideStore({
      appNamespace: "tachyon-nav-fixture",
      defaultCollapsed: true,
      storage: createMemoryStorage(),
    }),
  )
  const aside = useAppShellAside({
    store: asideStore,
    sourceGeneration: generation,
    focusFallbackTarget: () => heading.current,
    isTriggerAdmitted: () => access && layer,
    isFallbackAdmitted: () => access && layer,
  })
  useLayoutEffect(() => {
    if (modalGeneration.current !== generation) {
      setModal(false)
      setNested(false)
    }
    if (drawerGeneration.current !== generation) setDrawer(false)
  }, [generation])
  const lifetime = useRef({ active: false, generation })
  useLayoutEffect(() => {
    lifetime.current = { active: true, generation }
    return () => {
      lifetime.current.active = false
    }
  }, [generation])
  const lease = useShortcut({
    key: "",
    enabled: false,
    sourceGeneration: generation,
    onTrigger: () => {},
  }).isLive
  const alive = useCallback(
    () =>
      lease() &&
      lifetime.current.active &&
      lifetime.current.generation === generation &&
      access &&
      layer &&
      model.accessible,
    [lease, generation, access, layer, model],
  )
  const background = () => alive() && !competingLayer()
  useEffect(() => {
    const update = () => setHash(location.hash)
    window.addEventListener("hashchange", update)
    return () => window.removeEventListener("hashchange", update)
  }, [])
  useLayoutEffect(() => {
    diagnostics.replace = () => setEpoch((n) => n + 1)
    diagnostics.access = () => setAccess((v) => !v)
    diagnostics.layer = () => setLayer((v) => !v)
    return () => {
      diagnostics.replace = undefined
      diagnostics.access = undefined
      diagnostics.layer = undefined
    }
  }, [])
  const route = resolve(hash, model),
    item = route.item,
    group = model.groups.find((g) => g.id === item?.group)
  const navigate = (path: string, owner?: HTMLElement | null) => {
    if (!alive()) return
    // The drawer is an explicitly identified owner; a newer popup still vetoes.
    if (
      owner ? !currentLayer(owner) : drawer ? !currentLayer(drawerPopup.current) : competingLayer()
    )
      return
    location.hash = path
    setDrawer(false)
  }
  const run = (action: Action) => {
    if (!alive()) return
    if (action.kind === "navigate") {
      if (!resolve(`#${action.route}`, model).reason) location.hash = action.route
    } else if (action.kind === "modal") {
      modalGeneration.current = generation
      modalOpener.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null
      setModal(true)
    } else {
      diagnostics.actions.push("inspect")
      setMessage("Fixture inspected locally; no delivery or mutation")
    }
  }
  const search = useRef<HTMLInputElement>(null)
  useShortcut({
    key: "/",
    scopeElement: () => frameRoot.current,
    sourceGeneration: generation,
    isAdmitted: background,
    onTrigger: () => search.current?.focus(),
  })
  const tabs = group && group.id in subnav ? subnav[group.id as keyof typeof subnav] : []
  const navigation = (
    <Nav
      model={{ ...model, accessible: model.accessible && access && layer }}
      active={item}
      collapsed={rail}
      navigate={navigate}
    />
  )
  return (
    <div ref={frameRoot} data-testid="tachyon-nav" className="bg-bg text-fg">
      <AppShell
        {...aside.asideProps}
        aside={
          aside.isNarrow ? undefined : (
            <p className="p-4 text-caption">
              Fixture context only. Declared owner: {group?.owner}. No provider execution.
            </p>
          )
        }
        asideLabel="Fixture context"
        asideHeader={
          <Button onClick={() => aside.setCollapsed(true)}>Collapse fixture context</Button>
        }
        nav={<div className="hidden h-full lg:block">{navigation}</div>}
        header={
          <header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border p-2">
            <div className="lg:hidden">
              <OverlaySidebar
                open={drawer}
                onOpenChange={(value) => {
                  if (value) drawerGeneration.current = generation
                  setDrawer(value)
                }}
                contentRef={drawerPopup}
                side="left"
                title="Module drawer"
                description="Fixture navigation"
                trigger={<Button size="sm">Modules</Button>}
                focusReturn={{
                  isAdmitted: () => alive() && drawerGeneration.current === generation,
                  isFallbackAdmitted: () => alive() && drawerGeneration.current === generation,
                  fallbackTarget: () => heading.current,
                }}
              >
                <Nav model={model} active={item} collapsed={false} navigate={navigate} />
              </OverlaySidebar>
            </div>
            <h1 ref={heading} tabIndex={-1} className="mr-auto font-semibold">
              Tachyon navigation
            </h1>
            <Button
              size="sm"
              className="hidden lg:inline-flex"
              aria-expanded={!rail}
              onClick={() => {
                if (background()) setRail(!rail)
              }}
            >
              Toggle icon rail
            </Button>
            <Button
              className="hidden lg:inline-flex"
              size="sm"
              ref={(node) => {
                aside.triggerRef.current = node
              }}
              onClick={() => {
                if (background()) aside.toggleCollapsed()
              }}
            >
              Toggle context aside
            </Button>
            <MenuSlot
              label="Header menu"
              generation={generation}
              accessible={access && layer && model.accessible}
              run={run}
            />
            <MenuSlot
              label="Hamburger menu"
              generation={generation}
              accessible={access && layer && model.accessible}
              run={run}
            />
          </header>
        }
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border p-3">
            <label className="text-caption">
              Source{" "}
              <select
                aria-label="Fixture source"
                value={scenario}
                onChange={(e) => setScenario(e.target.value as Scenario)}
              >
                {scenarios.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="text-caption">
              Sub-nav{" "}
              <select
                aria-label="Sub-nav variant"
                value={variant}
                onChange={(e) => setVariant(e.target.value as "top" | "left")}
              >
                <option>top</option>
                <option>left</option>
              </select>
            </label>
            <input
              ref={search}
              aria-label="Local navigation note"
              placeholder="Local note · / to focus"
              className="min-w-0 flex-1 rounded-control border border-border bg-bg px-2 py-1"
            />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <p className="mb-3 text-caption text-fg-muted">
              Fixture only · seed 4421 · {reference}
            </p>
            <nav aria-label="Breadcrumbs" className="mb-4 flex flex-wrap gap-2 text-caption">
              <span>{group?.label ?? "Modules"}</span>
              <span>/</span>
              <span>{item?.label ?? "Unavailable route"}</span>
              {route.detail && (
                <>
                  <span>/</span>
                  <span>{route.detail}</span>
                </>
              )}
            </nav>
            <p role="status">{model.status}</p>
            {!access && <p role="alert">Fixture access retired</p>}
            {!layer && <p role="alert">Fixture layer retired</p>}
            {model.refusals.map((r) => (
              <p key={r.id} role="status" className="text-caption text-fg-muted">
                {r.id}: {r.reason}
              </p>
            ))}
            <PageNavigation
              tabs={tabs}
              variant={variant}
              hash={hash}
              navigate={(path) => {
                if (background()) navigate(path)
              }}
            >
              <section
                aria-label="Routed fixture page"
                className="min-w-0 flex-1 rounded-panel border border-border bg-surface p-4"
              >
                {route.reason ? (
                  <p role="alert">{route.reason}</p>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="mr-auto text-heading-sm">
                        {route.detail ? `Task ${route.detail}` : item?.label}
                      </h2>
                      <MenuSlot
                        label="Page toolbar"
                        generation={generation}
                        accessible={access && layer && model.accessible}
                        run={run}
                      />
                    </div>
                    <p className="my-3 text-caption text-fg-muted">
                      {item?.owner} · source-declared route · Parallax fixture view · {hash}
                    </p>
                    <FixtureRecords
                      generation={generation}
                      accessible={access && layer && model.accessible}
                      active={!drawer && !modal}
                      navigate={(path) => {
                        if (background()) navigate(path)
                      }}
                      run={run}
                    />
                    <p role="status" className="mt-4 text-caption">
                      {message}
                    </p>
                    <p className="mt-2 text-caption text-fg-muted">
                      Right-click or deliberate hold on row action. Background-only long-press;
                      unavailable inside modal drawer.
                    </p>
                  </>
                )}
              </section>
            </PageNavigation>
          </div>
        </div>
      </AppShell>
      <InspectionDialog
        ref={popup}
        open={modal}
        onOpenChange={(value) => {
          if (
            alive() &&
            (!value
              ? !competingLayer([popup.current]) &&
                (!!popup.current?.contains(document.activeElement) ||
                  document.activeElement === modalOpener.current ||
                  document.activeElement === document.body)
              : !competingLayer())
          )
            setModal(value)
        }}
        title="Fixture details"
        returnFocus={{
          trigger: () => modalOpener.current,
          isAdmitted: () => alive() && modalGeneration.current === generation,
          fallbackTarget: () => heading.current,
          isFallbackAdmitted: () => alive() && modalGeneration.current === generation,
        }}
        footer={
          <Button
            onClick={() => {
              if (alive() && currentLayer(popup.current)) {
                setModal(false)
                if (!competingLayer([popup.current])) heading.current?.focus()
              }
            }}
          >
            Close fixture details
          </Button>
        }
      >
        <div className="space-y-3 p-4">
          <p>Local modal specimen. No provider, command transport, or receipt.</p>
          <input aria-label="Fixture details note" />
          <Button
            onClick={() => {
              if (alive() && currentLayer(popup.current)) setNested(true)
            }}
          >
            Open nested fixture
          </Button>
          <InspectionDialog open={nested} onOpenChange={setNested} title="Nested fixture">
            <div className="p-4">
              <input aria-label="Nested fixture note" />
            </div>
          </InspectionDialog>
        </div>
      </InspectionDialog>
    </div>
  )
}
