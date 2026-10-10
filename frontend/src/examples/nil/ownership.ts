const overlays = '[role="dialog"], [role="alertdialog"], [role="menu"], [role="listbox"]'
function visible(node: HTMLElement): boolean {
  if (
    !node.isConnected ||
    !node.getClientRects().length ||
    node.closest('[inert], [hidden], [aria-hidden="true"], [data-closed]')
  )
    return false
  for (let current: HTMLElement | null = node; current; current = current.parentElement) {
    const style = getComputedStyle(current)
    if (style.display === "none" || style.visibility === "hidden") return false
  }
  return true
}
export function ownsPopup(
  owner: HTMLElement | null,
  ancestors: readonly HTMLElement[] = [],
): boolean {
  if (!owner || !visible(owner)) return false
  for (const popup of owner.ownerDocument.querySelectorAll<HTMLElement>(overlays)) {
    if (!visible(popup)) continue
    // Only the explicitly supplied editor ancestor may coexist with its dirty prompt.
    if (popup === owner || ancestors.includes(popup)) continue
    return false
  }
  return true
}
export function popupOwner(name: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-nil-owner="${name}"]`)
}
