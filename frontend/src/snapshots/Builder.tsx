import {
  Badge,
  Button,
  CopyableId,
  DetailDialog,
  DetailSection,
  EmptyState,
  Input,
  Textarea,
} from "@hollis-labs/design-components"
import {
  AdminDirectory,
  AdminFacts,
  AdminRecordButton,
  IdentityAvatar,
} from "@hollis-labs/kit-admin"
import { DataTable, FilterEntityCombobox, RecordSummary } from "@hollis-labs/kit-dashboard/data"
import {
  DashboardField,
  DashboardSearchToolbar,
  DashboardToolbar,
  ListPageLayout,
  TabStrip,
} from "@hollis-labs/kit-dashboard/layout"
import { PageHeader, StatusBadge } from "@hollis-labs/kit-dashboard/ui"
import { useState } from "react"
import { CapturedChips, CaptureReceipt } from "./ConsoleParts"
import { type AgentDefinition, type ConsoleSnapshot, privileged } from "./console-model"

type Section = "definitions" | "teams" | "assignments"
type Mode = "details" | "edit" | "lifecycle" | "audit"
interface Draft {
  name: string
  summary: string
  roles: string
  enabled: boolean
}
const newDraft = (a?: AgentDefinition): Draft => ({
  name: a?.name ?? "",
  summary: a?.summary ?? "",
  roles: a?.roles.join(", ") ?? "",
  enabled: a?.enabled ?? true,
})
export function CapturedBuilder({ data, onReset }: { data: ConsoleSnapshot; onReset: () => void }) {
  const [section, setSection] = useState<Section>("definitions"),
    [query, setQuery] = useState(""),
    [provider, setProvider] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null),
    [mode, setMode] = useState<Mode>("details"),
    [draft, setDraft] = useState<Draft>(newDraft()),
    [creating, setCreating] = useState(false),
    [review, setReview] = useState(false)
  const [teamId, setTeamId] = useState<string | null>(null),
    [teamDraft, setTeamDraft] = useState(false),
    [teamName, setTeamName] = useState(""),
    [teamLaunch, setTeamLaunch] = useState(""),
    [teamReview, setTeamReview] = useState(false)
  const [assignment, setAssignment] = useState({ agent: "", type: "task", target: "", role: "" }),
    [staged, setStaged] = useState<(typeof assignment & { id: string })[]>([]),
    [assignmentReview, setAssignmentReview] = useState(false)
  const rows = data.agents.items.filter(
    (a) =>
      `${a.id} ${a.name} ${a.roles.join(" ")}`.toLowerCase().includes(query.toLowerCase()) &&
      (!provider || data.launches.items.some((l) => l.agent === a.id && l.provider === provider)),
  )
  const agent = rows.find((a) => a.id === selected) ?? rows[0]
  const launches = agent ? data.launches.items.filter((l) => l.agent === agent.id) : []
  const providers = [
    ...new Set(data.launches.items.map((l) => l.provider).filter((p): p is string => !!p)),
  ].sort()
  const teamKey = (t: { id: string; version: number }) => `${t.id}@${t.version}`
  const teams = [...data.teams.items].sort(
    (a, b) => a.id.localeCompare(b.id) || b.version - a.version,
  )
  const team = teams.find((t) => teamKey(t) === teamId) ?? teams[0]
  function select(id: string) {
    setSelected(id)
    setMode("details")
    setReview(false)
  }
  function edit(a?: AgentDefinition) {
    setDraft(newDraft(a))
    setReview(false)
    if (a) setMode("edit")
    else setCreating(true)
  }
  const editor = (
    <div className="dash-form-stack">
      <DetailSection title={creating ? "New definition preview" : "Edit definition preview"}>
        <div className="grid gap-4 sm:grid-cols-2">
          <DashboardField label="Name" orientation="stacked">
            <Input
              aria-label="Definition name"
              value={draft.name}
              onChange={(e) => {
                setDraft({ ...draft, name: e.target.value })
                setReview(false)
              }}
            />
          </DashboardField>
          <DashboardField label="Roles" orientation="stacked">
            <Input
              aria-label="Definition roles"
              value={draft.roles}
              onChange={(e) => {
                setDraft({ ...draft, roles: e.target.value })
                setReview(false)
              }}
            />
          </DashboardField>
          <DashboardField label="Summary" orientation="stacked" className="sm:col-span-2">
            <Textarea
              aria-label="Definition summary"
              value={draft.summary}
              onChange={(e) => {
                setDraft({ ...draft, summary: e.target.value })
                setReview(false)
              }}
            />
          </DashboardField>
          <DashboardField label="Status">
            <select
              aria-label="Definition status"
              value={draft.enabled ? "enabled" : "disabled"}
              onChange={(e) => {
                setDraft({ ...draft, enabled: e.target.value === "enabled" })
                setReview(false)
              }}
            >
              <option value="enabled">Enabled</option>
              <option value="disabled">Disabled</option>
            </select>
          </DashboardField>
        </div>
      </DetailSection>
      <p className="dash-support text-fg-muted">
        Local design draft. Prompts, tools and permissions stay outside this preview. Nothing is
        saved to Tether.
      </p>
      <Button variant="outline" disabled={!draft.name.trim()} onClick={() => setReview(true)}>
        Review definition
      </Button>
      {review && (
        <DetailSection title="Definition review">
          <div role="status" className="dash-form-stack">
            <RecordSummary title={draft.name} metadata={draft.summary} />
            <CapturedChips
              values={draft.roles
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)}
            />
            <StatusBadge
              status={draft.enabled ? "Enabled" : "Disabled"}
              tone={draft.enabled ? "done" : "paused"}
            />
            <p className="dash-support">Preview only. The captured definition is unchanged.</p>
          </div>
        </DetailSection>
      )}
    </div>
  )
  return (
    <>
      <ListPageLayout
        header={
          <PageHeader title="Builder">
            <Button variant="outline" onClick={onReset}>
              Reset snapshot
            </Button>
          </PageHeader>
        }
        summary={
          <>
            <DashboardToolbar className="px-4 py-3 border-b border-border">
              <p className="dash-support">Define and configure agents, teams, and assignments.</p>
              <Badge variant="secondary">Captured · local previews</Badge>
            </DashboardToolbar>
            <DashboardToolbar className="px-4 py-2 border-b border-border">
              <span className="dash-support">
                {data.agents.items.length} captured definitions ·{" "}
                {data.agents.items.filter((a) => !a.enabled).length} disabled ·{" "}
                {data.launches.items.length} launch profiles
                {data.agents.truncated || data.launches.truncated ? " · partial capture" : ""}
              </span>
            </DashboardToolbar>
          </>
        }
        tabs={
          <TabStrip
            value={section}
            onChange={setSection}
            tabs={[
              { key: "definitions", label: "Definitions" },
              { key: "teams", label: "Teams" },
              { key: "assignments", label: "Assignments" },
            ]}
            actions={
              section === "definitions" ? (
                <Button variant="outline" onClick={() => edit()}>
                  New agent preview
                </Button>
              ) : undefined
            }
          />
        }
        footer={<CaptureReceipt receipt={data.agents} label="Tether catalog through Tachyon" />}
      >
        {section === "definitions" && (
          <AdminDirectory
            label="Agent definitions"
            controls={
              <DashboardSearchToolbar
                value={query}
                onChange={(value) => {
                  setQuery(value)
                  setMode("details")
                }}
                label="Search agent definitions"
                placeholder="Search agents…"
              >
                <FilterEntityCombobox
                  icon={null}
                  ariaLabel="Filter definition provider"
                  allLabel="All providers"
                  value={provider}
                  onChange={(value) => {
                    setProvider(value)
                    setMode("details")
                  }}
                  items={providers.map((p) => ({ id: p, name: p }))}
                />
              </DashboardSearchToolbar>
            }
            records={
              rows.length ? (
                <ul aria-label="Agent definitions">
                  {rows.map((a) => (
                    <li key={a.id}>
                      <AdminRecordButton
                        title={a.name}
                        selected={a.id === agent?.id}
                        onSelect={() => select(a.id)}
                        avatar={<IdentityAvatar identity={a.id} />}
                        description={
                          <>
                            {data.launches.items.filter((l) => l.agent === a.id).length} launch
                            profiles{privileged(a) && " · privileged"}
                            {!a.enabled && " · disabled"}
                          </>
                        }
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  title="No matching definitions"
                  description="Clear the search or provider filter."
                  variant="empty"
                />
              )
            }
            detail={
              agent ? (
                <article aria-label={`${agent.name} definition`}>
                  <TabStrip
                    value={mode}
                    onChange={(next) => (next === "edit" ? edit(agent) : setMode(next))}
                    tabs={[
                      { key: "details", label: "Details" },
                      { key: "edit", label: "Edit preview" },
                      { key: "lifecycle", label: "Lifecycle" },
                      { key: "audit", label: "Audit" },
                    ]}
                  />
                  {mode === "details" ? (
                    <div className="dash-form-stack">
                      <DashboardToolbar>
                        <IdentityAvatar identity={agent.id} size="large" />
                        <div className="min-w-0 flex-1">
                          <h2 className="dash-record-title break-words">{agent.name}</h2>
                          <CopyableId id={agent.id} label={agent.id} />
                        </div>
                        <StatusBadge
                          status={agent.enabled ? "Enabled" : "Disabled"}
                          tone={agent.enabled ? "done" : "paused"}
                        />
                      </DashboardToolbar>
                      {agent.summary && <p className="dash-support">{agent.summary}</p>}
                      <DetailSection title="Identity">
                        <AdminFacts
                          items={[
                            { label: "Address", value: agent.urn },
                            { label: "Roles", value: <CapturedChips values={agent.roles} /> },
                          ]}
                        />
                      </DetailSection>
                      <DetailSection title="Launch profiles">
                        <p className="dash-support text-fg-faint pb-2">
                          Runtime belongs to launch profiles. These definitions do not imply a
                          running agent.
                        </p>
                        <DataTable
                          items={launches}
                          columns={[
                            {
                              key: "id",
                              header: "Launch",
                              width: "fill",
                              className: "min-w-48",
                              cell: (l) => (
                                <RecordSummary
                                  title={l.id}
                                  metadata={l.project ?? "Project not reported"}
                                />
                              ),
                            },
                            {
                              key: "provider",
                              header: "Provider",
                              cell: (l) => l.provider ?? "Not reported",
                            },
                            {
                              key: "state",
                              header: "State",
                              cell: (l) =>
                                l.enabled === undefined ? (
                                  "Not reported"
                                ) : (
                                  <StatusBadge
                                    status={l.enabled ? "Enabled" : "Disabled"}
                                    tone={l.enabled ? "done" : "paused"}
                                  />
                                ),
                            },
                          ]}
                          getRowId={(l) => l.id}
                          pageSize={200}
                          emptyState={
                            <EmptyState
                              title="No captured launch profiles"
                              description="No profile in this slice references this definition."
                              variant="empty"
                            />
                          }
                        />
                      </DetailSection>
                      <DetailSection title="Tools and skills">
                        <AdminFacts
                          items={[
                            { label: "MCP servers", value: <CapturedChips values={agent.tools} /> },
                            { label: "Skills", value: <CapturedChips values={agent.skills} /> },
                          ]}
                        />
                      </DetailSection>
                      <DetailSection title="Permissions and policy">
                        <AdminFacts
                          items={[
                            { label: "Permission mode", value: agent.permissionMode },
                            { label: "Sandbox", value: agent.sandbox },
                            {
                              label: "Network",
                              value:
                                agent.network === undefined
                                  ? undefined
                                  : agent.network
                                    ? "Online"
                                    : "Offline",
                            },
                            { label: "Scopes", value: <CapturedChips values={agent.scopes} /> },
                          ]}
                        />
                      </DetailSection>
                      <DetailSection title="Capture coverage">
                        <p className="dash-support text-fg-muted">
                          Prompts, environment, full source files and audit history were excluded.
                          Team configuration is a separate snapshot; running membership is not
                          inferred.
                        </p>
                      </DetailSection>
                    </div>
                  ) : mode === "edit" ? (
                    editor
                  ) : mode === "lifecycle" ? (
                    <div className="dash-form-stack">
                      <DetailSection title="Lifecycle">
                        <StatusBadge
                          status={agent.enabled ? "Enabled at capture" : "Disabled at capture"}
                          tone={agent.enabled ? "done" : "paused"}
                        />
                        <p className="dash-support py-3">
                          Retire, restore and launch controls are not connected in this captured
                          review. Clone opens a local definition preview.
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => {
                            edit()
                            setDraft({ ...newDraft(agent), name: `${agent.name} copy` })
                          }}
                        >
                          Clone preview
                        </Button>
                      </DetailSection>
                    </div>
                  ) : (
                    <div className="dash-form-stack">
                      <EmptyState
                        title="Audit history not captured"
                        description="This view makes no claim about whether the source has audit events."
                        variant="empty"
                      />
                    </div>
                  )}
                </article>
              ) : (
                <div className="dash-form-stack">
                  <p className="dash-support">Choose a definition.</p>
                </div>
              )
            }
          />
        )}
        {section === "teams" && (
          <>
            <DashboardToolbar className="px-4 py-3 border-b border-border">
              <p className="dash-support text-fg-muted">
                {new Set(teams.map((t) => t.id)).size} saved teams · {teams.length} captured
                versions · manually imported {data.teams.importedAt}. Definitions are separate from
                live membership.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setTeamDraft(true)
                  setTeamReview(false)
                }}
              >
                New team preview
              </Button>
            </DashboardToolbar>
            <AdminDirectory
              label="Team definitions"
              records={
                <ul aria-label="Saved teams">
                  {teams.map((t) => (
                    <li key={teamKey(t)}>
                      <AdminRecordButton
                        title={t.name}
                        description={`${t.id} · version ${t.version} · ${t.slots.length} seats`}
                        selected={teamKey(t) === teamKey(team) && !teamDraft}
                        onSelect={() => {
                          setTeamId(teamKey(t))
                          setTeamDraft(false)
                        }}
                      />
                    </li>
                  ))}
                </ul>
              }
              detail={
                teamDraft ? (
                  <div className="dash-form-stack">
                    <DetailSection title="Local team draft">
                      <div className="dash-form-stack">
                        <DashboardField label="Team name" orientation="stacked">
                          <Input
                            aria-label="Team preview name"
                            value={teamName}
                            onChange={(e) => {
                              setTeamName(e.target.value)
                              setTeamReview(false)
                            }}
                          />
                        </DashboardField>
                        <DashboardField label="Coordinator launch" orientation="stacked">
                          <select
                            aria-label="Team coordinator launch"
                            value={teamLaunch}
                            onChange={(e) => {
                              setTeamLaunch(e.target.value)
                              setTeamReview(false)
                            }}
                          >
                            <option value="">Choose a captured launch…</option>
                            {data.launches.items.map((l) => (
                              <option key={l.id} value={l.id}>
                                {l.id}
                              </option>
                            ))}
                          </select>
                        </DashboardField>
                        <p className="dash-support">
                          Draft composition only. Pinned activation policy is not captured, so this
                          preview cannot validate or create a runnable team.
                        </p>
                        <Button
                          variant="outline"
                          disabled={!teamName.trim() || !teamLaunch}
                          onClick={() => setTeamReview(true)}
                        >
                          Review team
                        </Button>
                        {teamReview && (
                          <p role="status" className="dash-support">
                            {teamName} · coordinator {teamLaunch}. Preview only; no saved team
                            changed.
                          </p>
                        )}
                      </div>
                    </DetailSection>
                  </div>
                ) : team ? (
                  <div className="dash-form-stack">
                    <DashboardToolbar>
                      <h2 className="dash-record-title">{team.name}</h2>
                      <Badge variant="secondary">Version {team.version} · imported</Badge>
                    </DashboardToolbar>
                    <CopyableId id={team.id} label={team.id} />
                    <DetailSection title="Seats">
                      <DataTable
                        items={team.slots}
                        getRowId={(s) => s.name}
                        pageSize={200}
                        columns={[
                          {
                            key: "name",
                            header: "Seat",
                            width: "fill",
                            className: "min-w-48",
                            cell: (s) => (
                              <RecordSummary
                                title={s.name}
                                metadata={`${s.role ?? "Role not reported"} · ${s.required ? "Required" : "Optional"}`}
                              />
                            ),
                          },
                          {
                            key: "definition",
                            header: "Definition pin",
                            cell: (s) => (
                              <span className="block max-w-64 break-words whitespace-normal">
                                {s.definition
                                  ? `${s.definition.id}@${s.definition.revision}`
                                  : "Not captured"}
                              </span>
                            ),
                          },
                          {
                            key: "members",
                            header: "Members",
                            cell: (s) => `${s.min ?? "—"}–${s.max ?? "—"}`,
                          },
                        ]}
                      />
                    </DetailSection>
                    <DetailSection title="Shared policy">
                      <AdminFacts
                        items={[
                          { label: "Coordinator", value: team.coordinator },
                          { label: "Authority", value: team.authority },
                          { label: "History", value: team.history },
                        ]}
                      />
                    </DetailSection>
                    <p className="dash-support text-fg-faint">
                      This projection includes seat definitions and policy summaries. Full saved
                      configuration, activation bindings, phases and authority grants are not
                      captured; imported teams cannot be edited through this partial view.
                    </p>
                  </div>
                ) : (
                  <EmptyState
                    title="No team snapshots captured"
                    description="This is not a statement about live team membership."
                    variant="empty"
                  />
                )
              }
            />
          </>
        )}
        {section === "assignments" && (
          <div className="dash-form-stack">
            <DetailSection title="Assignment drafts">
              <p className="dash-support text-fg-muted pb-4">
                Live assignments are not connected in Tachyon’s Builder. These drafts stay local, do
                not dispatch work, and do not verify target IDs.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <DashboardField label="Agent" orientation="stacked">
                  <select
                    aria-label="Assignment agent"
                    value={assignment.agent}
                    onChange={(e) => setAssignment({ ...assignment, agent: e.target.value })}
                  >
                    <option value="">Choose…</option>
                    {data.agents.items.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </DashboardField>
                <DashboardField label="Target type" orientation="stacked">
                  <select
                    aria-label="Assignment type"
                    value={assignment.type}
                    onChange={(e) => setAssignment({ ...assignment, type: e.target.value })}
                  >
                    <option value="task">Task</option>
                    <option value="workstream">Workstream</option>
                  </select>
                </DashboardField>
                <DashboardField label="Target ID" orientation="stacked">
                  <Input
                    aria-label="Assignment target"
                    value={assignment.target}
                    onChange={(e) => setAssignment({ ...assignment, target: e.target.value })}
                  />
                </DashboardField>
                <DashboardField label="Role" orientation="stacked">
                  <Input
                    aria-label="Assignment role"
                    value={assignment.role}
                    onChange={(e) => setAssignment({ ...assignment, role: e.target.value })}
                  />
                </DashboardField>
              </div>
              <Button
                className="mt-4"
                variant="outline"
                disabled={!assignment.agent || !assignment.target.trim()}
                onClick={() => {
                  setStaged([...staged, { ...assignment, id: crypto.randomUUID() }])
                  setAssignment({ ...assignment, target: "" })
                  setAssignmentReview(false)
                }}
              >
                Stage assignment
              </Button>
            </DetailSection>
            {staged.length ? (
              <DetailSection title="Staged assignments">
                <ul>
                  {staged.map((a) => (
                    <li
                      key={a.id}
                      className="flex flex-wrap items-center gap-3 py-2 border-b border-border"
                    >
                      <span className="dash-support min-w-0 flex-1 break-words">
                        {a.agent} → {a.type} {a.target}
                        {a.role && ` · ${a.role}`}
                      </span>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setStaged(staged.filter((s) => s.id !== a.id))
                          setAssignmentReview(false)
                        }}
                      >
                        Unstage
                      </Button>
                    </li>
                  ))}
                </ul>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setAssignmentReview(true)}
                >
                  Review assignments
                </Button>
                {assignmentReview && (
                  <p role="status" className="dash-support py-3">
                    {staged.length} local assignments reviewed. Nothing was saved or dispatched.
                  </p>
                )}
              </DetailSection>
            ) : (
              <EmptyState
                title="No local assignment drafts"
                description="Existing live assignments are not represented here."
                variant="empty"
              />
            )}
          </div>
        )}
      </ListPageLayout>
      <DetailDialog
        open={creating}
        onClose={() => setCreating(false)}
        title="New agent · local preview"
        showFullscreenToggle
        footer={
          <Button variant="outline" onClick={() => setCreating(false)}>
            Close preview
          </Button>
        }
      >
        {editor}
      </DetailDialog>
    </>
  )
}
