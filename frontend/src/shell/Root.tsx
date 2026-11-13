import { ManifestShell, type PageComponent } from "@hollis-labs/app-shell"
import { SignOutPage } from "@hollis-labs/kit-identity"
import { Activity, Compass, Gauge, Layers, LogOut, Mail, MessageSquare, Users } from "lucide-react"
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { App } from "../App"
import manifest from "../generated/frontend.manifest.json"
import { legacyViewRedirect, routeFor, viewForKey, viewForPath } from "./routes"

// Kit icon names app.ui.json uses, resolved by the shell.
const icons = {
  gauge: Gauge,
  activity: Activity,
  compass: Compass,
  layers: Layers,
  mail: Mail,
  "message-square": MessageSquare,
  users: Users,
  "log-out": LogOut,
}

const NavigateContext = createContext<(path: string) => void>(() => {})

/** Every lab view is one page component, so its state (theme, scenario, plugin host) survives a route change. */
const LabPage: PageComponent = ({ surface }) => {
  const navigate = useContext(NavigateContext)
  const view = viewForKey(surface.item.key)
  const open = useCallback((name: string) => navigate(routeFor(name)), [navigate])
  return view ? (
    <div className="lab-host">
      <App view={view} onNavigate={open} />
    </div>
  ) : null
}

const surfaceKeys = (manifest.items as { kind: string; key: string }[])
  .filter((i) => i.kind === "surface")
  .map((i) => i.key)
const pages: Record<string, PageComponent> = {
  ...Object.fromEntries(surfaceKeys.map((key) => [key, LabPage])),
  "sign-out": SignOutPage,
}

function usePath() {
  const [path, setPath] = useState(() => {
    const target = legacyViewRedirect(location.pathname, location.search)
    if (target) history.replaceState(null, "", target)
    return location.pathname
  })
  useEffect(() => {
    const onPop = () => setPath(location.pathname)
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [])
  const navigate = useCallback((to: string) => {
    if (to !== location.pathname) history.pushState(null, "", to)
    setPath(location.pathname)
  }, [])
  return [path, navigate] as const
}

/** The app: Substrate's manifest-driven shell around the review lab. */
export function Root() {
  const [path, navigate] = usePath()
  useEffect(() => {
    const view = viewForPath(path)
    if (view) document.title = `${view} · Parallax`
  }, [path])
  const shell = useMemo(
    () => (
      <ManifestShell
        manifest={manifest}
        apiBase="/api"
        path={path}
        onNavigate={navigate}
        pages={pages}
        icons={icons}
      />
    ),
    [path, navigate],
  )
  return <NavigateContext.Provider value={navigate}>{shell}</NavigateContext.Provider>
}
