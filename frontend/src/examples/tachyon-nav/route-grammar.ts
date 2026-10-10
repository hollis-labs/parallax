// Fixture-only excerpt of pinned Tachyon routing helpers; no live router adoption.
export interface RouteLocation {
  path: string
  query: URLSearchParams
  valid: boolean
}
function hasControl(value: string) {
  return Array.from(value).some((character) => {
    const code = character.charCodeAt(0)
    return code < 32 || code === 127
  })
}

export function parseLocation(hash: string): RouteLocation {
  const value = hash.replace(/^#/, "") || "/agents"
  const split = value.indexOf("?")
  const path = split < 0 ? value : value.slice(0, split)
  const query = new URLSearchParams(split < 0 ? "" : value.slice(split + 1))
  let valid = path.startsWith("/") && path.length <= 2048 && !/[#\\\s]/.test(path)
  const segments = path.slice(1).split("/")
  try {
    valid &&= segments.every((segment) => {
      const decoded = decodeURIComponent(segment)
      return !!decoded && decoded !== "." && decoded !== ".." && !hasControl(decoded)
    })
  } catch {
    valid = false
  }
  return { path, query, valid }
}

// Bounded whole-segment names; page queries never participate in identity.
// Static path syntax is preserved, with internal empty segments refused.
export function validPattern(pattern: string): boolean {
  if (!pattern.startsWith("/") || pattern.length > 128) return false
  const names = new Set<string>()
  return pattern
    .slice(1)
    .split("/")
    .every((segment, index) => {
      if (segment.startsWith(":")) {
        if (!/^:[a-z][a-z0-9_]*$/.test(segment) || names.has(segment)) return false
        names.add(segment)
        return true
      }
      return (index === 0 ? /^[a-z0-9][a-z0-9_-]*$/ : /^[a-z0-9_-]+$/).test(segment)
    })
}

export function matchRoute(pattern: string, path: string): Record<string, string> | null {
  if (!validPattern(pattern) || !parseLocation(path).valid || path.includes("?")) return null
  const expected = pattern.slice(1).split("/")
  const actual = path.slice(1).split("/")
  if (expected.length !== actual.length) return null
  const params: Record<string, string> = Object.create(null)
  for (let index = 0; index < expected.length; index++) {
    const segment = expected[index]
    if (segment.startsWith(":")) params[segment.slice(1)] = decodeURIComponent(actual[index])
    else if (segment !== actual[index]) return null
  }
  return params
}

export function routePath(pattern: string, params: Record<string, string> = {}): string {
  if (!validPattern(pattern)) throw new Error("Invalid route pattern")
  return pattern
    .split("/")
    .map((segment) => {
      if (!segment.startsWith(":")) return segment
      const name = segment.slice(1)
      const value = Object.hasOwn(params, name) ? params[name] : undefined
      if (!value || value === "." || value === ".." || hasControl(value))
        throw new Error(`Missing or invalid route parameter: ${name}`)
      // Preserve IDs that coincide with static siblings, including "board".
      return encodeURIComponent(value).replace(
        /^[A-Za-z0-9_.!~*'()-]/,
        (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
      )
    })
    .join("/")
}
