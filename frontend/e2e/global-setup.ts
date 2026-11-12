import { existsSync, mkdirSync, readFileSync } from "node:fs"
import { dirname } from "node:path"
import { request } from "@playwright/test"
import { ports } from "../tests/ports"

export const backend = `http://127.0.0.1:${ports.backend}`
export const authState = new URL("../../.scratch/e2e-auth.json", import.meta.url).pathname
const passwordFile = new URL("../../.scratch/e2e-password", import.meta.url).pathname

// Signs in to the real backend once for the whole run and keeps the session cookie in storageState.
// The owner `e2e` is created before the server starts (`parallax identity setup`, in the backend
// webServer command of playwright.config.ts), which also writes the password file read here.
// Writes carry X-Requested-With and a same-origin Origin.
export default async function globalSetup() {
  mkdirSync(dirname(authState), { recursive: true })
  if (!existsSync(passwordFile))
    throw new Error("no e2e password file: the e2e owner was not created")
  const api = await request.newContext({
    baseURL: backend,
    extraHTTPHeaders: { "X-Requested-With": "parallax-e2e", Origin: backend },
  })
  const response = await api.post("/api/login", {
    data: { username: "e2e", password: readFileSync(passwordFile, "utf8") },
  })
  if (!response.ok())
    throw new Error(`e2e sign-in failed: ${response.status()} ${await response.text()}`)
  await api.storageState({ path: authState })
  await api.dispose()
}
