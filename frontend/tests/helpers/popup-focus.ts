import { expect, type Locator } from "@playwright/test"

// Visibility precedes Base UI's queued initial focus. Observe the native handoff
// before changing focus or measuring another keyboard owner's behavior.
export async function expectPopupFocus(popup: Locator) {
  await expect(popup).toBeVisible()
  await expect
    .poll(() => popup.evaluate((node) => node.contains(document.activeElement)))
    .toBe(true)
}

// Removal and focus restoration can finish in different microtasks/frames.
// Wait for both before typing into or opening another background control.
export async function expectPopupClosed(popup: Locator, returnTarget: Locator) {
  await expect(popup).toHaveCount(0)
  await expect(returnTarget).toBeFocused()
  // Native cleanup may restore the same target before the app's queued return
  // frame. Drain that frame before a new control claims focus.
  await returnTarget.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => queueMicrotask(resolve))
      }),
  )
  await expect(returnTarget).toBeFocused()
}
