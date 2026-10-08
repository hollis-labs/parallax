import { Checkbox, ModeToggle, Switch, ThemePicker } from "@hollis-labs/design-components"
import { useId, useLayoutEffect, useRef, useState } from "react"
import type { OperationsModel } from "../operations/model"
import "./review.css"

export const palettes = [
  { id: "p4-white", name: "P4 white" },
  { id: "p1-green-phosphor", name: "Green phosphor" },
  { id: "p3-amber-phosphor", name: "Amber phosphor" },
  { id: "hi-contrast", name: "High contrast" },
] as const
export type Mode = "light" | "dark" | "system"
export type Appearance = "recorded" | "unknown-palette" | "long-label"
export function AppearanceReview({
  operations,
  operationsQuery = "",
  initialTheme = "p4-white",
  initialMode = "system",
  appearance = "recorded",
}: {
  operations: OperationsModel
  operationsQuery?: string
  initialTheme?: string
  initialMode?: Mode
  appearance?: Appearance
}) {
  const source = JSON.stringify([
    operations.dataset.version,
    operations.dataset.profile,
    operations.dataset.clock,
    operations.scenario,
    operations.resource,
    operations.cutoff,
    operationsQuery,
    appearance,
    initialTheme,
    initialMode,
  ])
  return (
    <Instance
      key={source}
      source={source}
      operations={operations}
      initialTheme={appearance === "unknown-palette" ? "unrecognized-palette" : initialTheme}
      initialMode={initialMode}
      appearance={appearance}
    />
  )
}
function Instance({
  source,
  operations,
  initialTheme,
  initialMode,
  appearance,
}: {
  source: string
  operations: OperationsModel
  initialTheme: string
  initialMode: Mode
  appearance: Appearance
}) {
  const [theme, setTheme] = useState(initialTheme),
    [mode, setMode] = useState<Mode>(initialMode),
    [systemDark, setSystemDark] = useState(false)
  const [annotations, setAnnotations] = useState(true),
    [dense, setDense] = useState(false),
    [, refresh] = useState(0)
  const [tokens, setTokens] = useState<Record<string, string>>({})
  const id = useId()
  const specimen = useRef<HTMLElement>(null)
  const life = useRef({ alive: false, lease: 0 }),
    sourceRef = useRef(source)
  sourceRef.current = source
  const available = operations.accessible && palettes.some((p) => p.id === theme)
  useLayoutEffect(() => {
    const lifetime = { alive: true, lease: 0 }
    life.current = lifetime
    const media = matchMedia("(prefers-color-scheme: dark)")
    let previous = media.matches
    setSystemDark(previous)
    const observe = () => {
      if (!lifetime.alive || life.current !== lifetime || sourceRef.current !== source) return
      if (media.matches !== previous) {
        previous = media.matches
        lifetime.lease++
        setSystemDark(previous)
      }
    }
    media.addEventListener("change", observe)
    refresh((n) => n + 1)
    return () => {
      lifetime.alive = false
      lifetime.lease++
      media.removeEventListener("change", observe)
    }
  }, [source])
  const lifetime = life.current,
    lease = lifetime.lease
  const current = () =>
    lifetime.alive &&
    life.current === lifetime &&
    lifetime.lease === lease &&
    sourceRef.current === source &&
    available
  const resolved = mode === "system" ? (systemDark ? "dark" : "light") : mode
  function change<T>(before: T, next: T, setter: (value: T) => void) {
    if (!current() || before === next) return
    lifetime.lease++
    setter(next)
  }
  useLayoutEffect(() => {
    if (!available || !life.current.alive || !specimen.current) return
    if (
      specimen.current.dataset.theme !== theme ||
      specimen.current.dataset.mode !== resolved ||
      specimen.current.dataset.dense !== String(dense)
    )
      return
    const css = getComputedStyle(specimen.current)
    setTokens({
      foreground: css.color,
      background: css.backgroundColor,
      border: css.borderColor,
      ring: css.getPropertyValue("--hl-ring").trim(),
      "--hl-bg": css.getPropertyValue("--hl-bg").trim(),
      "--hl-fg": css.getPropertyValue("--hl-fg").trim(),
      padding: css.paddingTop,
    })
  }, [theme, resolved, dense, available])
  const themes =
    appearance === "long-label"
      ? palettes.map((p) => ({
          ...p,
          name: `${p.name} · authored literal <script>inert</script> https://example.invalid/metadata`,
        }))
      : palettes
  return (
    <section className="appearance-review" aria-label="Appearance Review">
      <h2>Isolated appearance preview</h2>
      <p>
        Ephemeral view controls style only the readonly specimen. Current operations context:{" "}
        {operations.resource} · cutoff {operations.cutoff}. No preference is stored or source record
        changed.
      </p>
      <p role="status">
        {available
          ? `Current preview: ${theme} · selected ${mode} · resolved ${resolved}.`
          : !operations.accessible
            ? `Controls withheld: ${operations.resource}.`
            : `Controls withheld: unknown supplied palette ${theme}.`}
      </p>
      {available ? (
        <>
          <section className="appearance-controls" aria-label="Local appearance controls">
            <ThemePicker
              className="appearance-picker"
              theme={theme}
              themes={themes}
              onThemeChange={(next) => {
                if (palettes.some((p) => p.id === next)) change(theme, next, setTheme)
              }}
            />
            <ModeToggle
              mode={mode}
              resolvedMode={resolved}
              onModeChange={(next) => {
                if (["light", "dark", "system"].includes(next)) change(mode, next, setMode)
              }}
            />
            <label htmlFor={`${id}-annotations`}>
              <Checkbox
                id={`${id}-annotations`}
                checked={annotations}
                onCheckedChange={(next) => change(annotations, next, setAnnotations)}
              />
              Show annotations
            </label>
            <label htmlFor={`${id}-dense`}>
              <Switch
                id={`${id}-dense`}
                checked={dense}
                onCheckedChange={(next) => change(dense, next, setDense)}
              />
              Dense preview
            </label>
          </section>
          <section
            ref={specimen}
            aria-label="Readonly semantic specimen"
            data-theme={theme}
            data-mode={resolved}
            data-dense={dense}
            className="appearance-specimen bg-bg text-fg border-border"
          >
            <p className="appearance-eyebrow">Owned token specimen · {resolved}</p>
            <h3>Recorded review context</h3>
            <p>
              Current admitted runs: {operations.runs.length}. This palette sample is authored
              presentation, not a saved operational setting.
            </p>
            <div className="appearance-secondary bg-bg-elevated text-fg-secondary border-border">
              Supplied cutoff {operations.cutoff}
            </div>
            <button
              type="button"
              className="appearance-focus"
              onClick={() => {
                if (current()) refresh((n) => n + 1)
              }}
            >
              Inspect specimen focus
            </button>
            {annotations && (
              <p className="appearance-annotations">
                Annotations: semantic foreground/background/border come from this specimen’s
                installed theme scope. Controls and unrelated host remain in their original scope.
              </p>
            )}
          </section>
          <section aria-label="Exact appearance companion" className="appearance-companion">
            <h3>Exact current appearance</h3>
            <dl>
              <dt>Palette</dt>
              <dd>{theme}</dd>
              <dt>Selected mode</dt>
              <dd>{mode}</dd>
              <dt>Resolved mode</dt>
              <dd>{resolved}</dd>
              <dt>Annotations</dt>
              <dd>{String(annotations)}</dd>
              <dt>Dense preview</dt>
              <dd>{String(dense)}</dd>
              <dt>Fixed UTC</dt>
              <dd>{operations.cutoff}</dd>
              {Object.entries(tokens).map(([key, value]) => (
                <div className="appearance-token" key={key}>
                  <dt>{key}</dt>
                  <dd>{value || "Not supplied"}</dd>
                </div>
              ))}
            </dl>
          </section>
        </>
      ) : (
        <p>Readonly token specimen unavailable; no prior specimen or controls are retained.</p>
      )}
    </section>
  )
}
