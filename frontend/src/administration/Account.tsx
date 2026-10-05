import { Button, EmptyState } from "@hollis-labs/design-components"
import {
  AccountPreferences,
  AccountProfile,
  ApiTokenManager,
  ConnectedAccounts,
  WhoamiBadge,
} from "@hollis-labs/kit-account"
import { Panel } from "@hollis-labs/kit-dashboard/widgets"
import { useState } from "react"
import {
  type AccountState,
  accountModel,
  accountStates,
  linkedPermissions,
  linkedRoles,
} from "./model"

type Intent = (action: string, id: string) => void
export function AccountLab({
  onIntent,
  onReset,
  initialState = "identified",
}: {
  onIntent: Intent
  onReset: () => void
  initialState?: AccountState
}) {
  const [state, setState] = useState<AccountState>(initialState)
  return (
    <section className="administration-lab" aria-label="Account fixture lab">
      <div className="communication-controls">
        <label>
          Account state
          <select
            aria-label="Account state"
            value={state}
            onChange={(e) => {
              setState(e.target.value as AccountState)
              onReset()
            }}
          >
            {accountStates.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <span className="muted">Private kit-account 0.0.0 candidate · local presentation only</span>
      </div>
      <AccountPresentation key={state} state={state} onIntent={onIntent} onReset={onReset} />
    </section>
  )
}
function AccountPresentation({
  state,
  onIntent,
  onReset,
}: {
  state: AccountState
  onIntent: Intent
  onReset: () => void
}) {
  const model = accountModel(state),
    { artifact, user } = model
  const [view, setView] = useState("Profile"),
    [selectedUser, setUser] = useState(user.id),
    [selectedRole, setRole] = useState(artifact.roles[0].id)
  const [draft, setDraft] = useState({
    displayName:
      state === "unknown" || state === "error"
        ? ""
        : state === "profile-draft"
          ? "Unsaved fixture alias"
          : user.name,
    email: state === "unknown" || state === "error" ? "" : user.email,
  })
  const [density, setDensity] = useState("comfortable"),
    [tokenDraft, setTokenDraft] = useState({ name: "", scopes: [] as string[] }),
    [revoke, setRevoke] = useState<string | null>(null)
  if (!model.accessible)
    return (
      <EmptyState
        variant="error"
        title="Account access denied"
        description="The fixture host withholds profile, preferences and directory content. No authorization request is made."
      />
    )
  const selected = artifact.users.find((u) => u.id === selectedUser)!
  const identity =
    state === "error"
      ? { state: "error" as const, message: "Fixture identity read failed" }
      : model.identity
        ? {
            state: "identified" as const,
            displayName: user.name,
            assurance: "local" as const,
            source: "Bundled fictional identity; no login",
          }
        : { state: "unknown" as const }
  return (
    <>
      <div className="selection-band">
        <WhoamiBadge identity={identity} />
        <span className="muted">
          {artifact.version} · {artifact.clock} · seed {artifact.seed}
        </span>
      </div>
      <fieldset className="communication-controls" aria-label="Account pages">
        {["Profile", "Users", "Roles", "Permissions", "Access metadata"].map((v) => (
          <Button
            key={v}
            variant={view === v ? "default" : "outline"}
            onClick={() => {
              setView(v)
              onReset()
            }}
          >
            {v}
          </Button>
        ))}
      </fieldset>
      {model.readOnly && (
        <div className="notice">
          Profile/preferences and access actions are read-only in this identity/policy state.
        </div>
      )}
      {view === "Profile" ? (
        <div className="admin-columns">
          <AccountProfile
            value={draft}
            onValueChange={setDraft}
            readOnly={model.readOnly}
            onSave={(value) => onIntent("Profile intent inspected", JSON.stringify(value))}
            error={state === "error" ? "Fixture read error; local draft is unverified" : undefined}
            notice={
              state === "profile-draft"
                ? "Unsaved draft; identity above remains unchanged"
                : undefined
            }
          />
          <AccountPreferences
            description="Local review preferences; submission only opens intent inspection."
            readOnly={model.readOnly}
            onSave={() => onIntent("Preference intent inspected", density)}
          >
            <label>
              Directory density
              <select
                aria-label="Directory density"
                value={density}
                onChange={(e) => setDensity(e.target.value)}
              >
                <option>comfortable</option>
                <option>compact</option>
              </select>
            </label>
          </AccountPreferences>
        </div>
      ) : view === "Users" ? (
        <div className="admin-columns">
          <Panel icon={null} title="Fixture users">
            <div className="example-body">
              {artifact.users.map((u) => (
                <Button
                  key={u.id}
                  variant="outline"
                  onClick={() => {
                    setUser(u.id)
                    onReset()
                  }}
                >
                  {u.id} · {u.name}
                </Button>
              ))}
            </div>
          </Panel>
          <Panel icon={null} title="User detail">
            <div className="example-body">
              <h3>{selected.name}</h3>
              <p>
                {selected.id} · {selected.contactId} · {selected.state}
              </p>
              <p>{selected.email}</p>
              <h4>Related roles</h4>
              {linkedRoles(selected.id).map((r) => (
                <Button
                  key={r.id}
                  onClick={() => {
                    setRole(r.id)
                    setView("Roles")
                    onReset()
                  }}
                >
                  {r.id} · {r.label}
                </Button>
              ))}
            </div>
          </Panel>
        </div>
      ) : view === "Roles" ? (
        <div className="admin-columns">
          <Panel icon={null} title="Fixture roles">
            <div className="example-body">
              {artifact.roles.map((r) => (
                <Button
                  key={r.id}
                  variant="outline"
                  onClick={() => {
                    setRole(r.id)
                    onReset()
                  }}
                >
                  {r.id} · {r.label}
                </Button>
              ))}
            </div>
          </Panel>
          <Panel icon={null} title="Role detail">
            <div className="example-body">
              <h3>{artifact.roles.find((r) => r.id === selectedRole)?.label}</h3>
              <p>{selectedRole}</p>
              <h4>Related permissions</h4>
              {linkedPermissions(selectedRole).map((p) => (
                <p key={p.id}>
                  {p.id} · {p.label}
                </p>
              ))}
              <h4>Related users</h4>
              {artifact.users
                .filter((u) => u.roleIds.includes(selectedRole))
                .map((u) => (
                  <Button
                    key={u.id}
                    variant="outline"
                    onClick={() => {
                      setUser(u.id)
                      setView("Users")
                      onReset()
                    }}
                  >
                    {u.id} · {u.name}
                  </Button>
                ))}
            </div>
          </Panel>
        </div>
      ) : view === "Permissions" ? (
        <Panel icon={null} title="Permission presentation labels">
          <div className="example-body">
            <p className="muted">
              These relationships describe fixtures; they do not evaluate or grant access.
            </p>
            {artifact.permissions.map((p) => (
              <article key={p.id}>
                <h3>
                  {p.id} · {p.label}
                </h3>
                <p>{p.description}</p>
                {artifact.roles
                  .filter((r) => r.permissionIds.includes(p.id))
                  .map((r) => (
                    <Button
                      key={r.id}
                      variant="outline"
                      onClick={() => {
                        setRole(r.id)
                        setView("Roles")
                        onReset()
                      }}
                    >
                      {r.label}
                    </Button>
                  ))}
              </article>
            ))}
          </div>
        </Panel>
      ) : state === "unknown" || state === "error" ? (
        <EmptyState
          variant="error"
          title="Access metadata unavailable"
          description="No identified fixture principal; access actions are withheld."
        />
      ) : (
        <>
          <p className="notice">
            Metadata only. No credentials are created, disclosed, copied, revoked or connected.
          </p>
          <div className="admin-columns">
            <ApiTokenManager
              tokens={[
                {
                  id: "TOKEN-001",
                  name: "Fixture review token",
                  scopes: ["records.read"],
                  status: "active",
                  canRevoke: !model.readOnly,
                  detail: "Authored metadata only; no token value exists",
                },
                {
                  id: "TOKEN-UNKNOWN",
                  name: "Unknown fixture token",
                  scopes: [],
                  status: "future-state",
                  canRevoke: false,
                },
              ]}
              scopeOptions={[{ id: "records.read", label: "Inspect records" }]}
              draft={tokenDraft}
              onDraftChange={(d) => setTokenDraft({ name: d.name, scopes: [...d.scopes] })}
              onCreate={(d) => onIntent("Token creation intent inspected", JSON.stringify(d))}
              canCreate={!model.readOnly}
              revokeTargetId={revoke}
              onRevokeTargetChange={setRevoke}
              onRevoke={(id) => {
                onIntent("Token revocation intent inspected", id)
                setRevoke(null)
              }}
            />
            <ConnectedAccounts
              accounts={[
                {
                  id: "PROVIDER-DEMO",
                  provider: "Fixture messaging account",
                  status: "disconnected",
                  canConnect: !model.readOnly,
                  canDisconnect: false,
                  detail: "No OAuth or transport configured",
                },
                {
                  id: "PROVIDER-UNKNOWN",
                  provider: "Unknown fixture provider",
                  status: "future-state",
                  canConnect: false,
                  canDisconnect: false,
                },
              ]}
              disabled={model.readOnly}
              onConnect={(id) => onIntent("Connection intent inspected", id)}
              onDisconnect={(id) => onIntent("Disconnect intent inspected", id)}
            />
          </div>
        </>
      )}
      <p className="muted">
        Candidate supplies profile/preferences/identity and access metadata surfaces. Directories
        and fixture relationship projections are app-owned; no auth evaluator or grant persistence.
      </p>
    </>
  )
}
