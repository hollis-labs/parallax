import { expect, test } from "@playwright/test"

const entry = "/?example=flux-chat"
for (const role of ["dialog", "menu", "listbox"]) {
  test(`retained conversation action yields to visible unregistered ${role} and fresh action works after close`, async ({
    page,
  }) => {
    await page.goto(entry)
    const resume = page.getByRole("button", { name: "Resume local preview", exact: true })
    await resume.click()
    await expect(
      page.getByRole("button", { name: "Stop local preview", exact: true }),
    ).toBeVisible()
    await page.getByRole("button", { name: "Stop local preview", exact: true }).click()
    await expect(resume).toBeVisible()
    const ready = await page.evaluate((role) => {
      const w = window as unknown as Window & { heldAction: HTMLButtonElement }
      w.heldAction = Array.from(document.querySelectorAll("button")).find(
        (b) => b.textContent?.trim() === "Resume local preview",
      )!
      const owner = document.createElement("div")
      owner.id = "unregistered-owner"
      owner.setAttribute("role", role)
      owner.setAttribute("aria-label", `Unregistered ${role}`)
      const input = document.createElement("input")
      input.setAttribute("aria-label", "Unregistered owner input")
      owner.append(input)
      document.body.prepend(owner)
      input.focus()
      return {
        connected: w.heldAction.isConnected,
        ownerVisible: !!owner.getClientRects().length,
        marked: owner.hasAttribute("data-open"),
        focused: document.activeElement === input,
      }
    }, role)
    expect(ready).toEqual({ connected: true, ownerVisible: true, marked: false, focused: true })
    await page.evaluate(() =>
      (window as unknown as Window & { heldAction: HTMLButtonElement }).heldAction.click(),
    )
    await expect(resume).toBeVisible()
    await expect(page.getByLabel("Unregistered owner input")).toBeFocused()
    await page.locator("#unregistered-owner").evaluate((node) => node.remove())
    await resume.click()
    await expect(
      page.getByRole("button", { name: "Stop local preview", exact: true }),
    ).toBeVisible()
  })
}
test("owned composer listbox preserves real typing and reference selection", async ({ page }) => {
  await page.goto(entry)
  const draft = page.getByLabel("Flux local draft")
  await draft.fill("@")
  await expect(page.getByRole("listbox")).toBeVisible()
  await draft.pressSequentially("n")
  await expect(draft).toHaveValue("@n")
  await expect(
    page.getByRole("option", { name: "notes/ Fictional directory", exact: true }),
  ).toBeVisible()
  await draft.press("ArrowDown")
  await draft.press("Enter")
  await expect(page.getByRole("listbox")).toBeHidden()
  await expect(draft).not.toHaveValue("@n")
  await expect(draft).toBeFocused()
})
test("deferred palette composer command yields to newer connected plain owner while ordinary command works", async ({
  page,
}) => {
  await page.goto(entry)
  const draft = page.getByLabel("Flux local draft")
  await page.getByRole("button", { name: "Command palette", exact: true }).click()
  await expect(page.getByLabel("Filter commands")).toBeFocused()
  await page.getByRole("button", { name: "Focus composer", exact: true }).click()
  await expect(draft).toBeFocused()
  await page.getByRole("button", { name: "Command palette", exact: true }).click()
  await expect(page.getByLabel("Filter commands")).toBeFocused()
  const ready = await page.evaluate(async () => {
    const command = Array.from(document.querySelectorAll<HTMLButtonElement>("button")).find(
      (b) => b.textContent?.trim() === "Focus composer",
    )!
    command.closest("[role=dialog]")!.setAttribute("data-probe-palette", "")
    const owner = document.createElement("input")
    owner.id = "new-plain-owner"
    owner.setAttribute("aria-label", "New plain command owner")
    document.body.prepend(owner)
    command.click()
    return await new Promise((resolve) => {
      const focus = () => {
        owner.focus()
        if (document.activeElement === owner)
          resolve({
            ownerConnected: owner.isConnected,
            commandConnected: command.isConnected,
            focused: true,
          })
        else requestAnimationFrame(focus)
      }
      focus()
    })
  })
  expect(ready).toEqual({ ownerConnected: true, commandConnected: true, focused: true })
  await expect(page.locator("[data-probe-palette]")).toHaveCount(0)
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
      ),
  )
  await expect(page.getByLabel("New plain command owner")).toBeFocused()
  await page.locator("#new-plain-owner").evaluate((node) => node.remove())
  await page.getByRole("button", { name: "Command palette", exact: true }).click()
  await page.getByRole("button", { name: "Focus composer", exact: true }).click()
  await expect(draft).toBeFocused()
})
for (const action of ["close", "select", "command", "configure"]) {
  test(`current popup ${action} refuses behind newer unregistered portal then fresh control works`, async ({
    page,
  }) => {
    await page.goto(entry)
    const open =
      action === "select"
        ? "Search chats"
        : action === "configure"
          ? "Review fixture"
          : "Command palette"
    await page.getByRole("button", { name: open, exact: true }).last().click()
    const popup = page.getByRole("dialog", {
      name: action === "configure" ? "Flux fixture review" : open,
      exact: true,
    })
    await expect(popup).toBeVisible()
    const control =
      action === "configure"
        ? page.getByLabel("Flux appearance")
        : action === "close"
          ? page.getByRole("button", { name: "Close panel", exact: true })
          : action === "command"
            ? page.getByRole("button", { name: "Toggle sidebar", exact: true })
            : page
                .getByRole("toolbar", { name: "Filtered local results" })
                .getByRole("button")
                .first()
    await control.focus()
    const ready = await page.evaluate(() => {
      const owner = document.createElement("div")
      owner.id = "new-unregistered-portal"
      owner.setAttribute("role", "menu")
      owner.setAttribute("aria-label", "New unregistered portal")
      const button = document.createElement("button")
      button.textContent = "New portal control"
      owner.append(button)
      document.body.prepend(owner)
      return { visible: !!owner.getClientRects().length, marked: owner.hasAttribute("data-open") }
    })
    expect(ready).toEqual({ visible: true, marked: false })
    await control.evaluate((node, action) => {
      if (action === "configure") {
        ;(node as HTMLSelectElement).value = "empty"
        node.dispatchEvent(new Event("change", { bubbles: true }))
      } else (node as HTMLButtonElement).click()
    }, action)
    await expect(popup).toBeVisible()
    if (action === "configure") await expect(control).toHaveValue("recorded")
    await page.locator("#new-unregistered-portal").evaluate((node) => node.remove())
    if (action === "configure") {
      await control.selectOption("empty")
      await expect(page.getByLabel("Flux local draft")).toBeDisabled()
    } else {
      await control.click()
      await expect(popup).toBeHidden()
    }
  })
}
test("exact popup owner yields to a nested competing role and fresh close works after its removal", async ({
  page,
}) => {
  await page.goto(entry)
  const open = page.getByRole("button", { name: "Command palette", exact: true })
  const popup = page.getByRole("dialog", { name: "Command palette", exact: true })
  const close = page.getByRole("button", { name: "Close panel", exact: true })
  await open.click()
  await expect(page.getByLabel("Filter commands")).toBeFocused()
  await close.click()
  await expect(popup).toBeHidden()
  await open.click()
  await expect(page.getByLabel("Filter commands")).toBeFocused()
  await close.focus()
  const ready = await popup.evaluate((node) => {
    const owner = document.createElement("div")
    owner.id = "nested-unregistered-owner"
    owner.setAttribute("role", "menu")
    const button = document.createElement("button")
    button.textContent = "Nested competing control"
    owner.append(button)
    node.append(owner)
    return {
      nested: node.contains(owner),
      visible: !!owner.getClientRects().length,
      marked: owner.hasAttribute("data-open"),
    }
  })
  expect(ready).toEqual({ nested: true, visible: true, marked: false })
  await close.evaluate((node) => (node as HTMLButtonElement).click())
  await expect(popup).toBeVisible()
  await page.locator("#nested-unregistered-owner").evaluate((node) => node.remove())
  await close.click()
  await expect(popup).toBeHidden()
})
for (const path of ["filter", "toolbar"]) {
  test(`native popup ${path} keys admit current owner, yield competing owner and work fresh`, async ({
    page,
  }) => {
    await page.goto(entry)
    await page.getByRole("button", { name: "Command palette", exact: true }).click()
    const input = page.getByLabel("Filter commands")
    const controls = page
      .getByRole("toolbar", { name: "Filtered local results" })
      .getByRole("button")
    await expect(input).toBeFocused()
    await input.press("ArrowDown")
    await expect(controls.first()).toBeFocused()
    if (path === "toolbar") {
      await controls.first().press("End")
      await expect(controls.last()).toBeFocused()
    } else await input.focus()
    const target = path === "filter" ? input : controls.last()
    await page.evaluate(() => {
      const owner = document.createElement("div")
      owner.id = "keyboard-competitor"
      owner.setAttribute("role", "menu")
      owner.textContent = "New visible unregistered keyboard owner"
      document.body.prepend(owner)
    })
    for (const key of path === "filter"
      ? ["ArrowDown", "Enter"]
      : ["Home", "End", "ArrowUp", "ArrowDown"]) {
      const result = await target.evaluate((node, key) => {
        const before = document.activeElement
        const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true })
        node.dispatchEvent(event)
        return {
          consumed: event.defaultPrevented,
          focusChanged: document.activeElement !== before,
          targetConnected: node.isConnected,
        }
      }, key)
      expect(result).toEqual({ consumed: false, focusChanged: false, targetConnected: true })
    }
    await page.locator("#keyboard-competitor").evaluate((node) => node.remove())
    if (path === "filter") {
      await input.focus()
      await input.press("ArrowDown")
      await expect(controls.first()).toBeFocused()
      await controls.first().press("Enter")
      await expect(page.getByLabel("Flux local draft")).toBeFocused()
    } else {
      await controls.last().focus()
      await controls.last().press("Home")
      await expect(controls.first()).toBeFocused()
    }
  })
}
test("filter keys preserve exact modifiers, IME and previously prevented event custody", async ({
  page,
}) => {
  for (const kind of [
    "ctrlKey",
    "metaKey",
    "altKey",
    "shiftKey",
    "isComposing",
    "keyCode",
    "prevented",
  ]) {
    for (const key of ["ArrowDown", "Enter"]) {
      await page.goto(entry)
      await page.getByRole("button", { name: "Command palette", exact: true }).click()
      const input = page.getByLabel("Filter commands")
      await expect(input).toBeFocused()
      const result = await input.evaluate(
        (node, { kind, key }) => {
          const before = document.activeElement
          const event = new KeyboardEvent("keydown", {
            key,
            bubbles: true,
            cancelable: true,
            ...(kind === "prevented" ? {} : { [kind]: kind === "keyCode" ? 229 : true }),
          })
          if (kind === "prevented") event.preventDefault()
          node.dispatchEvent(event)
          return {
            consumed: event.defaultPrevented,
            focusChanged: document.activeElement !== before,
          }
        },
        { kind, key },
      )
      expect(result).toEqual({ consumed: kind === "prevented", focusChanged: false })
      await expect(input).toBeFocused()
      await expect(page.getByRole("dialog", { name: "Command palette", exact: true })).toBeVisible()
    }
  }
})
test("normal search close ignores retired native dialog markup before the next layout shortcut", async ({
  page,
}) => {
  await page.goto(entry)
  await page.getByRole("button", { name: "Search chats", exact: true }).last().click()
  await expect(page.getByLabel("Search chat fixtures")).toBeFocused()
  const closing = await page.evaluate(() => {
    const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!
    const close = Array.from(dialog.querySelectorAll<HTMLButtonElement>("button")).find(
      (node) => node.textContent?.trim() === "Close panel",
    )!
    close.click()
    return {
      connected: dialog.isConnected,
      closed: dialog.hasAttribute("data-closed"),
      ariaHidden: dialog.getAttribute("aria-hidden"),
      visibility: getComputedStyle(dialog).visibility,
      rects: dialog.getClientRects().length,
    }
  })
  console.log("Native search close primary DOM:", JSON.stringify(closing))
  expect(closing.connected).toBe(true)
  await expect
    .poll(() =>
      page.evaluate(() =>
        Array.from(document.querySelectorAll<HTMLElement>('[role="dialog"]')).map((node) => ({
          closed: node.hasAttribute("data-closed"),
          ancestorClosed: !!node.closest("[data-closed]"),
          html: node.outerHTML.slice(0, 700),
        })),
      ),
    )
    .toEqual(expect.arrayContaining([expect.objectContaining({ ancestorClosed: true })]))
  console.log(
    "Committed native closing DOM:",
    JSON.stringify(
      await page.evaluate(() =>
        Array.from(document.querySelectorAll<HTMLElement>('[role="dialog"]')).map((node) => ({
          closed: node.hasAttribute("data-closed"),
          ancestorClosed: !!node.closest("[data-closed]"),
          html: node.outerHTML.slice(0, 700),
        })),
      ),
    ),
  )
  await page.getByRole("button", { name: "Layout presets", exact: true }).focus()
  await page.keyboard.press("Control+\\")
  await expect(page.getByRole("dialog", { name: "Layout presets", exact: true })).toBeVisible()
})
