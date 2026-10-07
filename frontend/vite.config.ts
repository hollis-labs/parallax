import { pluginHostImportmap } from "@hollis-labs/plugin-host-ui/vite"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// The Go binary serves this SPA under base_path (see internal/webui).
// `build.outDir` points at the Go embed directory so `npm run build`
// drops the bundle exactly where `//go:embed all:dist` expects it.
const reviewProxy = process.env.PARALLAX_PROXY_URL ?? "http://127.0.0.1:18441"
export default defineConfig({
  base: "/",
  plugins: [
    react(),
    tailwindcss(),
    pluginHostImportmap({
      entries: [
        {
          specifier: "react",
          source: "react",
          exports: [
            "createElement",
            "useState",
            "useEffect",
            "useMemo",
            "useRef",
            "useCallback",
            "useContext",
            "createContext",
            "useSyncExternalStore",
            "Component",
            "Suspense",
            "version",
          ],
          defaultExport: true,
        },
      ],
    }),
  ],
  build: {
    manifest: true,
    outDir: "../internal/webui/dist",
    emptyOutDir: true,
  },
  server: {
    // `make ui-dev` proxies same-origin /api calls to `make run` on 127.0.0.1:18441.
    proxy: {
      "/api": reviewProxy,
      "/plugins": reviewProxy,
    },
  },
})
