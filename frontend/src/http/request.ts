/** A 401 from `/api` or `/plugins` that is not a credential failure: the session ended (see shell/Signed.tsx). */
export const UNAUTHORIZED_EVENT = "parallax:unauthorized"

/** Codes where a 401 means "wrong credentials", not "the session ended". */
const CREDENTIAL_CODES = new Set(["invalid_login"])

/**
 * `fetch` for the same-origin cookie session, for the app's own `/api` and `/plugins` calls (sign-in, setup and
 * the identity screens are kit-identity's). Writes carry `X-Requested-With`, which the backend requires on every
 * non-GET call. A 401 that is not a credential failure raises UNAUTHORIZED_EVENT.
 */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const method = (init.method ?? "GET").toUpperCase()
  const headers = new Headers(init.headers)
  if (method !== "GET" && method !== "HEAD") headers.set("X-Requested-With", "XMLHttpRequest")
  const response = await fetch(path, { ...init, headers, credentials: "same-origin" })
  if (response.status === 401) {
    const code = await response
      .clone()
      .json()
      .then((b: { code?: string }) => b.code ?? "")
      .catch(() => "")
    if (!CREDENTIAL_CODES.has(code)) window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
  }
  return response
}
