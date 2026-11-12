import type { Locator, Page } from "@playwright/test"

/** The app-shell's narrow navigation applies at this width and below (its README: max-width 1023px). */
export const narrowNavMaxWidth = 1023

/**
 * A link of the app-shell navigation, reachable the way a person reaches it. Navigating is a step of these tests, not
 * the thing under test, and at narrow widths the shell shows only three tabs and puts the other groups in its More
 * sheet (the kit's designed behaviour), so the helper opens More first when the viewport is at or under the narrow
 * breakpoint and the link is not on screen. At wider widths nothing is opened: the link must be visible directly, so
 * the click fails if the rail regresses.
 */
export async function shellLink(page: Page, name: string): Promise<Locator> {
  const link = page.getByRole("link", { name, exact: true })
  const width = page.viewportSize()?.width ?? Number.POSITIVE_INFINITY
  if (width <= narrowNavMaxWidth && !(await link.isVisible())) {
    await page.getByRole("button", { name: "More", exact: true }).click()
  }
  return link
}
