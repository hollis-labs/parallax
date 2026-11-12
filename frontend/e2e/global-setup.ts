import { randomBytes } from "node:crypto"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname } from "node:path"
import { request } from "@playwright/test"
import { ports } from "../tests/ports"

export const backend = `http://127.0.0.1:${ports.backend}`
export const authState = new URL("../../.scratch/e2e-auth.json", import.meta.url).pathname
const passwordFile = new URL("../../.scratch/e2e-password", import.meta.url).pathname
const username = "e2e"

// Signs in to the real backend once for the whole run and keeps the session cookie in
// storageState. A fresh data directory runs first-run setup; a reused one signs in with the
// password written next to it. Writes carry X-Requested-With and a same-origin Origin.
export default async function globalSetup() {
  mkdirSync(dirname(authState), { recursive: true })
  const api = await request.newContext({
    baseURL: backend,
    extraHTTPHeaders: { "X-Requested-With": "parallax-e2e", Origin: backend },
  })
  const setup = await (await api.get("/api/setup")).json()
  let response: Awaited<ReturnType<typeof api.post>>
  if (setup.setup_required) {
    const password = randomBytes(18).toString("base64url")
    writeFileSync(passwordFile, password, { mode: 0o600 })
    response = await api.post("/api/setup", {
      data: { username, display_name: "E2E Owner", password },
    })
  } else {
    if (!existsSync(passwordFile))
      throw new Error("backend already set up and no e2e password file")
    response = await api.post("/api/login", {
      data: { username, password: readFileSync(passwordFile, "utf8") },
    })
  }
  if (!response.ok())
    throw new Error(`e2e sign-in failed: ${response.status()} ${await response.text()}`)
  await api.storageState({ path: authState })
  await api.dispose()
}
