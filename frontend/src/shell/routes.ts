import { destinations, workbenchEntry } from "../workbench/catalog"

/** The surface key and route slug of a lab view, as app.ui.json spells them. */
export const slug = (view: string) =>
  view
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

/** The view the lab opens on, and the shell route "/" shows (the old lab opened on Activity). */
export const landingView = "Activity"

/** The shell route of a lab view. */
export const routeFor = (view: string) => (view === landingView ? "/" : `/${slug(view)}`)

const views = [workbenchEntry.id, ...destinations.map((d) => d.id)]
const bySlug = new Map(views.map((v) => [slug(v), v]))

/** The lab view a surface key names, or undefined. */
export const viewForKey = (key: string) => bySlug.get(key)

/** The lab view a path shows, or undefined. */
export const viewForPath = (path: string) =>
  path === "/" ? landingView : bySlug.get(path.replace(/^\/|\/$/g, ""))

/**
 * The old lab addressed a view as `/?view=Name&...`. The shell addresses it as a route, so that URL is
 * rewritten to `/slug?...`, keeping every other query parameter in order. A name the lab does not know
 * lands on `/` (Activity) and keeps `view` so the page can say what was requested. Returns null for any
 * other URL.
 */
export function legacyViewRedirect(pathname: string, search: string): string | null {
  if (pathname !== "/") return null
  const params = new URLSearchParams(search)
  const requested = params.get("view")
  if (requested === null) return null
  const known = views.includes(requested)
  if (known) params.delete("view")
  const rest = params.toString()
  const path = known ? routeFor(requested) : "/"
  return rest ? `${path}?${rest}` : path
}
