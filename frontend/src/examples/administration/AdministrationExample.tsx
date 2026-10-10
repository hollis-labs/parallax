import {
  AppShell,
  Button,
  OverlaySidebar,
  useControlledRecordNavigation,
} from "@hollis-labs/design-components"
import { SettingsProvenanceRenderer } from "@hollis-labs/kit-settings"
import { useLayoutEffect, useRef, useState } from "react"
import { AccountReview } from "../../account-review/Review"
import { DirectoryReview } from "../../directory-review/Review"
import { settingsReviewModel } from "../../settings-review/model"
import {
  type AdministrationState,
  adminAppearances,
  administrationHref,
  administrationModel,
  adminPages,
  defaultAdministrationState,
  normalizeAdministrationState,
} from "./model"
import "./administration.css"

const titles = {
  directory: "Directory",
  profile: "Profile",
  roles: "Roles",
  permissions: "Permissions",
  account: "Current Account",
  settings: "Desired Settings",
  setup: "Setup Preview",
}
export function AdministrationExample({
  state: provided = defaultAdministrationState,
  onChange,
}: {
  state?: AdministrationState
  onChange?: (s: AdministrationState) => void
}) {
  const [local, setLocal] = useState(provided),
    [revision, setRevision] = useState(0)
  const state = onChange ? provided : local,
    data = administrationModel(state),
    identity = JSON.stringify([data.source, revision])
  const [navOpen, setNavOpen] = useState(false),
    [reviewOpen, setReviewOpen] = useState(false),
    [lease, setLease] = useState(0)
  const life = useRef({ alive: false, lease: 0, identity }),
    rendered = useRef(identity),
    heading = useRef<HTMLHeadingElement>(null),
    body = useRef<HTMLElement>(null),
    lastPage = useRef(state.page),
    focusNext = useRef(false)
  rendered.current = identity
  useLayoutEffect(() => {
    if (lastPage.current !== state.page) {
      lastPage.current = state.page
      if (body.current) body.current.scrollTop = 0
    }
  }, [state.page])
  useLayoutEffect(() => {
    heading.current?.focus()
  }, [])
  useLayoutEffect(() => {
    life.current.alive = true
    life.current.identity = identity
    life.current.lease++
    setLease(life.current.lease)
    setNavOpen(false)
    setReviewOpen(false)
    if (focusNext.current || document.activeElement === document.body) {
      focusNext.current = false
      heading.current?.focus()
    }
    return () => {
      life.current.alive = false
      life.current.lease++
    }
  }, [identity])
  const current = () =>
    life.current.alive &&
    life.current.lease === lease &&
    life.current.identity === identity &&
    rendered.current === identity
  function change(patch: Partial<AdministrationState>, focus = false) {
    if (!current()) return
    focusNext.current = focus
    const next = normalizeAdministrationState(new URLSearchParams({ ...state, ...patch }))
    if (onChange) onChange(next)
    else setLocal(next)
  }
  function sheet(kind: "nav" | "review", next: boolean) {
    if (!current()) return
    const prev = kind === "nav" ? navOpen : reviewOpen
    if (next === prev) return
    life.current.lease++
    setLease(life.current.lease)
    if (kind === "nav") setNavOpen(next)
    else setReviewOpen(next)
  }
  const nav = (
    <nav className="administration-navigation" aria-label="Administration application navigation">
      <strong>Administration</strong>
      {adminPages.map((page) => (
        <a
          key={page}
          href={administrationHref({ ...state, page })}
          aria-current={state.page === page ? "page" : undefined}
          onClick={(e) => {
            e.preventDefault()
            change({ page }, true)
          }}
        >
          {titles[page]}
        </a>
      ))}
      <a href="/?view=Review+Workbench">Back to review lab</a>
    </nav>
  )
  const controls = (
    <section
      className="administration-review-controls"
      aria-label="Administration fixture controls"
    >
      <h2>Fixture review</h2>
      <p>
        {data.fixture.version} · {data.fixture.clock}. Independent snapshot; no operations cutoff.
      </p>
      <label>
        Appearance
        <select
          aria-label="Administration appearance"
          value={state.appearance}
          onChange={(e) =>
            change({ appearance: e.target.value as AdministrationState["appearance"] }, true)
          }
        >
          {adminAppearances.map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>
      </label>
      <label>
        Theme
        <select
          aria-label="Administration theme"
          value={state.theme}
          onChange={(e) => change({ theme: e.target.value as AdministrationState["theme"] }, true)}
        >
          {["p4-white", "p1-green-phosphor", "p3-amber-phosphor", "hi-contrast"].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <label>
        Mode
        <select
          aria-label="Administration mode"
          value={state.mode}
          onChange={(e) => change({ mode: e.target.value as AdministrationState["mode"] }, true)}
        >
          <option>light</option>
          <option>dark</option>
        </select>
      </label>
      <Button
        onClick={() => {
          if (!current()) return
          change({ ...defaultAdministrationState, theme: state.theme, mode: state.mode }, true)
          setRevision((n) => n + 1)
        }}
      >
        Reset administration context
      </Button>
    </section>
  )
  const refused = !data.accessible
    ? `${state.appearance}: records withheld; count Unknown.`
    : "Known empty snapshot appearance · 0 supplied users/settings."
  const profile = ["profile", "roles", "permissions"].includes(state.page)
  const profileNavigation = useControlledRecordNavigation({
    orderedIds: data.matches.map((user) => user.id),
    selectedId: state.user || null,
    active: profile,
    accessible: data.accessible,
    sourceGeneration: identity,
    boundaryPolicy: "stop",
    onSelect: (user) => change({ user }, true),
  })
  const settings = settingsReviewModel("recorded")
  return (
    <AppShell
      className="administration-example"
      nav={<aside className="administration-sidebar">{nav}</aside>}
      header={
        <header className="administration-header">
          <div className="administration-mobile">
            <OverlaySidebar
              side="left"
              title="Administration navigation"
              open={navOpen}
              onOpenChange={(v) => sheet("nav", v)}
              trigger={
                <Button size="sm" variant="outline">
                  Menu
                </Button>
              }
            >
              {nav}
            </OverlaySidebar>
          </div>
          <div>
            <h1 ref={heading} tabIndex={-1}>
              {titles[state.page]}
            </h1>
            <small>Snapshot · Review only</small>
          </div>
          <OverlaySidebar
            side="right"
            title="Administration fixture review"
            open={reviewOpen}
            onOpenChange={(v) => sheet("review", v)}
            trigger={
              <Button size="sm" variant="outline">
                Review
              </Button>
            }
          >
            {controls}
          </OverlaySidebar>
        </header>
      }
    >
      <main ref={body} className="administration-page" aria-label="Administration page">
        <p className="administration-context">
          Fictional directory and desired-value metadata. No authorization, persistence or setup
          execution.
        </p>
        {state.appearance !== "recorded" && (
          <p>Authored {state.appearance} presentation; original snapshot unchanged.</p>
        )}
        {!data.accessible || state.appearance === "empty" ? (
          <p role="status">{refused}</p>
        ) : (
          <div>
            {state.page === "directory" && (
              <section aria-label="Administration directory">
                <h2>
                  People · {data.matches.length} matching / {data.users.length} supplied
                </h2>
                <label>
                  Search directory
                  <input
                    aria-label="Search administration directory"
                    value={state.query}
                    onChange={(e) => change({ query: e.target.value })}
                  />
                </label>
                <div className="administration-user-list">
                  {data.matches.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => change({ page: "profile", user: u.id }, true)}
                    >
                      <strong>{u.name}</strong>
                      <span>
                        {u.id} · {u.state} · contact {u.contactId}
                      </span>
                      <span>
                        {u.email} · {u.roleIds.length} supplied role references
                      </span>
                    </button>
                  ))}
                </div>
                {!data.matches.length && <p>Known no matches · 0 displayed users.</p>}
              </section>
            )}
            {profile &&
              (data.user ? (
                <>
                  <div className="administration-selection">
                    <label>
                      Selected directory user
                      <select
                        aria-label="Selected administration user"
                        value={state.user}
                        onChange={(e) => change({ user: e.target.value }, true)}
                      >
                        {data.matches.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.id} · {u.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <Button
                      variant="outline"
                      disabled={!profileNavigation.availability.previous}
                      onClick={() => profileNavigation.navigate(-1)}
                    >
                      Previous directory user
                    </Button>
                    <span>
                      {profileNavigation.position + 1} of {data.matches.length} matching users ·
                      stops at ends
                    </span>
                    <Button
                      variant="outline"
                      disabled={!profileNavigation.availability.next}
                      onClick={() => profileNavigation.navigate(1)}
                    >
                      Next directory user
                    </Button>
                    <Button variant="outline" onClick={() => change({ page: "directory" }, true)}>
                      Back to directory
                    </Button>
                  </div>
                  <DirectoryReview
                    key={`${identity}/${lease}`}
                    context="populated"
                    initialState={
                      state.appearance === "long"
                        ? "long"
                        : state.appearance === "missing"
                          ? "missing"
                          : state.appearance === "locked"
                            ? "locked"
                            : "recorded"
                    }
                    embedded={{
                      user: data.user.id,
                      tab: state.page as "profile" | "roles" | "permissions",
                      onTab: (tab) => change({ page: tab }, true),
                    }}
                  />
                </>
              ) : (
                <section>
                  <h2>No admitted profile selected</h2>
                  <p>
                    Choose a current directory user; missing selection is not another person's
                    profile.
                  </p>
                  <Button onClick={() => change({ page: "directory" }, true)}>
                    Open directory
                  </Button>
                </section>
              ))}
            {state.page === "account" && (
              <section>
                <h2>Current principal · {data.fixture.currentUserId}</h2>
                <p>
                  Independent of selected directory user {state.user || "none"}. Profile changes
                  below only inspect a local candidate; they never establish identity or change
                  access.
                </p>
                <AccountReview
                  key={`${identity}/${lease}`}
                  embedded
                  onEmbeddedReset={() => {
                    if (!current()) return
                    focusNext.current = true
                    setRevision((n) => n + 1)
                  }}
                  initialState={
                    state.appearance === "locked"
                      ? "read-only"
                      : state.appearance === "long"
                        ? "long"
                        : "recorded"
                  }
                />
              </section>
            )}
            {state.page === "settings" && (
              <section aria-label="Desired settings provenance">
                <h2>Immutable desired settings</h2>
                <p>
                  Supplied default/environment/file/override provenance and restart metadata. These
                  are desired values, not a successful runtime observation. Application policy is
                  read-only; Save/Reset/Apply/Check actions are omitted.
                </p>
                <SettingsProvenanceRenderer
                  contractVersion={1}
                  groups={settings.groups
                    .filter((g) => g.id !== "review-controls")
                    .map((g) => ({
                      ...g,
                      capabilities: {
                        can_read: true,
                        can_update: false,
                        can_validate: false,
                        can_reset: false,
                      },
                    }))}
                  states={settings.states}
                  readOnlyContext
                  onDraftChange={() => {}}
                />
                <h3>Exact supplied desired values</h3>
                <section
                  className="administration-table-region"
                  aria-label="Supplied settings metadata"
                  // biome-ignore lint/a11y/noNoninteractiveTabindex: Native keyboard scrolling of the bounded readonly metadata table.
                  tabIndex={0}
                >
                  <table>
                    <thead>
                      <tr>
                        <th>Setting</th>
                        <th>Value / source</th>
                        <th>Source policy</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.fixture.settings.map((v) => (
                        <tr key={v.key}>
                          <th>{v.label}</th>
                          <td>
                            {v.value}
                            <br />
                            {v.source} · {v.sourceLabel}
                          </td>
                          <td>
                            {v.editable ? "Source editable metadata" : "Source locked"} ·{" "}
                            {v.pending ? "Pending restart" : "Active desired declaration"}
                            <br />
                            {v.reason || "No lock reason supplied"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
                <p>
                  Secret values are not supplied by this snapshot. No secret inputs or credentials
                  exist here.
                </p>
              </section>
            )}
            {state.page === "setup" && (
              <section aria-label="Read-only setup plan preview">
                <h2>Setup plan preview</h2>
                <p>
                  App-owned projection of the four supplied desired values. No installation,
                  connectivity check or completed setup receipt is supplied.
                </p>
                <ol className="administration-setup-list">
                  {data.fixture.settings.map((v) => (
                    <li key={v.key}>
                      <h3>{v.label}</h3>
                      <p>
                        {v.key} = {v.value}
                      </p>
                      <p>
                        {v.sourceLabel} ·{" "}
                        {v.pending
                          ? "Would require restart according to source metadata"
                          : "No restart requirement declared"}
                      </p>
                      <p>Check result: Unreported · Execution: Not performed</p>
                    </li>
                  ))}
                </ol>
                <Button variant="outline" onClick={() => change({ page: "settings" }, true)}>
                  Inspect desired provenance
                </Button>
              </section>
            )}
          </div>
        )}
      </main>
      <footer className="administration-example-footer">
        Independent administration snapshot · {data.fixture.clock} · No identity or configuration
        changes
      </footer>
    </AppShell>
  )
}
