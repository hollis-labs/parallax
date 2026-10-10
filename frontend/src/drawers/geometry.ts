// Load the existing app token stylesheet before resolving geometry in Vite/Storybook.
import "../index.css"

// Tailwind owns the spacing scale (design-tokens SPACING_IS_TAILWINDS).
// Resolve authored steps from its existing --spacing token; pointer deltas stay pixels.
function spacingStep(step: number): number {
  if (typeof document === "undefined") return 0
  const rootStyle = getComputedStyle(document.documentElement)
  const token = rootStyle.getPropertyValue("--spacing").trim()
  const unit = Number.parseFloat(token)
  const base = token.endsWith("rem") ? unit * Number.parseFloat(rootStyle.fontSize) : unit
  if (!Number.isFinite(base) || base <= 0) throw new Error("Drawer spacing token unavailable")
  return step * base
}

export const DRAWER_GEOMETRY = {
  primaryDefault: spacingStep(60),
  workingDefault: spacingStep(50),
  minimum: spacingStep(12),
  maximum: spacingStep(150),
  collapseThreshold: spacingStep(6),
  keyboardStep: spacingStep(4),
  keyboardPageStep: spacingStep(12),
}
