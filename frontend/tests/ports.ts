// Ports the browser suites use. The defaults are the repository's own; an agent or a CI job
// that must stay inside a port block sets the environment variables instead.
const port = (name: string, fallback: number) => Number(process.env[name] ?? fallback)

export const ports = {
  /** The real binary the suites start on a throwaway data directory. */
  backend: port("PARALLAX_E2E_BACKEND_PORT", 18541),
  /** The Vite dev server proxying /api and /plugins to the backend. */
  dev: port("PARALLAX_E2E_DEV_PORT", 18545),
  /** The static Storybook build. */
  storybook: port("PARALLAX_E2E_STORYBOOK_PORT", 18542),
}
