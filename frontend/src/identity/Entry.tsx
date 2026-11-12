import { Button, Input } from "@hollis-labs/design-components"
import { type FormEvent, useId, useState } from "react"
import { ApiError, type Me, request, waitPhrase } from "./api"

function passwordHint(creating: boolean) {
  if (creating) return "new-password"
  return "current-password"
}

function Field({ label, children }: { label: string; children: (id: string) => React.ReactNode }) {
  const id = useId()
  return (
    <div className="identity-field">
      <label htmlFor={id}>{label}</label>
      {children(id)}
    </div>
  )
}

/**
 * Sign-in, or, when the operator opened first-run setup over HTTP, the owner form. By default the owner is
 * created on the host (`parallax identity setup`), so a missing owner gets a plain screen that says so.
 */
export function Entry({
  setup,
  setupOverHttp,
  onReady,
}: {
  setup: boolean
  setupOverHttp: boolean
  onReady: (me: Me) => void
}) {
  const [mode, setMode] = useState(setup)
  const [offline, setOffline] = useState(setup && !setupOverHttp)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    if (mode && data.get("password") !== data.get("confirmation")) {
      setError("Passwords do not match.")
      return
    }
    setBusy(true)
    setError("")
    try {
      const me = await request<Me>(mode ? "setup" : "login", "POST", {
        username: data.get("username"),
        password: data.get("password"),
        ...(mode ? { display_name: data.get("displayName") } : {}),
      })
      form.reset()
      onReady(me)
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) setMode(false)
      if (e instanceof ApiError && e.code === "setup_offline") setOffline(true)
      setError(
        e instanceof ApiError && e.status === 429
          ? `Too many attempts. Try again ${e.retryAfter === undefined ? "in a few minutes" : waitPhrase(e.retryAfter)}.`
          : e instanceof Error
            ? e.message
            : "Could not sign in.",
      )
    } finally {
      setBusy(false)
    }
  }
  if (offline)
    return (
      <main className="identity-entry">
        <section className="identity-panel">
          <p className="identity-eyebrow">PARALLAX</p>
          <h1>No owner account yet</h1>
          <p>
            Parallax has no owner yet, and the owner is not created from this page. On the host that
            runs Parallax, run <code>parallax identity setup --username NAME</code>, then reload
            this page and sign in.
          </p>
        </section>
      </main>
    )
  return (
    <main className="identity-entry">
      <section className="identity-panel">
        <p className="identity-eyebrow">PARALLAX</p>
        <h1>{mode ? "Create the owner account" : "Sign in to Parallax"}</h1>
        <form onSubmit={submit} aria-busy={busy}>
          <fieldset disabled={busy}>
            {mode && (
              <Field label="Display name">
                {(id) => (
                  <Input id={id} name="displayName" autoComplete="name" required maxLength={100} />
                )}
              </Field>
            )}
            <Field label="Username">
              {(id) => (
                <Input id={id} name="username" autoComplete="username" required maxLength={64} />
              )}
            </Field>
            <Field label="Password">
              {(id) => (
                <Input
                  id={id}
                  name="password"
                  type="password"
                  autoComplete={passwordHint(mode)}
                  required
                  minLength={mode ? 12 : undefined}
                  maxLength={72}
                />
              )}
            </Field>
            {mode && (
              <Field label="Confirm password">
                {(id) => (
                  <Input
                    id={id}
                    name="confirmation"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={12}
                    maxLength={72}
                  />
                )}
              </Field>
            )}
            {error && (
              <p className="identity-error" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" disabled={busy}>
              {busy ? "Please wait…" : mode ? "Create account" : "Sign in"}
            </Button>
          </fieldset>
        </form>
      </section>
    </main>
  )
}
