// Interim identity client. Replaced as a whole by @hollis-labs/kit-identity when it ships
// (CW-20261112-0080); keep every identity call in this directory.

/** Raised for any non-2xx answer; `code` is the flat `{code, message, details?}` body's code. */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code = "",
    public details?: unknown,
    /** Seconds from the Retry-After header of a 429, when the answer carried one. */
    public retryAfter?: number,
  ) {
    super(message)
  }
}

/** A 401 from `/api` or `/plugins` means the session ended; the gate listens for this. */
export const UNAUTHORIZED_EVENT = "parallax:unauthorized"

/** Codes where a 401 means "wrong credentials", not "the session ended". */
const CREDENTIAL_CODES = new Set(["invalid_login"])

/**
 * `fetch` for the same-origin cookie session. Writes carry `X-Requested-With`, which the backend
 * requires on every non-GET call. A 401 that is not a credential failure signals sign-out.
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

/** Retry-After is delta-seconds or an HTTP date; anything else (or a past date) is absent. */
export function retryAfterSeconds(value: string | null, now = Date.now()): number | undefined {
  if (!value) return undefined
  if (/^\d+$/.test(value)) return Number(value)
  const at = Date.parse(value)
  return Number.isFinite(at) && at > now ? Math.ceil((at - now) / 1000) : undefined
}

/** "in 5 minutes" for a Retry-After wait, rounded up to whole minutes above a minute. */
export function waitPhrase(seconds: number): string {
  if (seconds < 60) return `in ${seconds} second${seconds === 1 ? "" : "s"}`
  const minutes = Math.ceil(seconds / 60)
  return `in ${minutes} minute${minutes === 1 ? "" : "s"}`
}

/** JSON request against `/api/<path>`; an empty body (204) resolves to undefined. */
export async function request<T>(path: string, method = "GET", body?: unknown): Promise<T> {
  const response = await apiFetch(`/api/${path}`, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const text = await response.text()
  let data: { code?: string; message?: string; details?: unknown } | null = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = null
    }
  }
  if (!response.ok) {
    throw new ApiError(
      data?.message ?? `Request failed (${response.status})`,
      response.status,
      data?.code,
      data?.details,
      retryAfterSeconds(response.headers.get("Retry-After")),
    )
  }
  return data as T
}

/** The signed-in person: GET /api/identity/profile (and the answer of setup and login, without assurance). */
export interface Me {
  id: string
  username: string
  display_name: string
  email: string
  scopes: string[]
  assurance?: string
}
