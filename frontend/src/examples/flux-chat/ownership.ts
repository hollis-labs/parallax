/** Visible native ownership does not depend on one component library's open marker. */
export function visible(target: HTMLElement) {
  return (
    target.isConnected &&
    !!target.getClientRects().length &&
    getComputedStyle(target).visibility !== "hidden" &&
    !target.closest('[inert],[aria-hidden="true"]')
  )
}
export function composerListbox(owner: HTMLElement, editor: HTMLTextAreaElement | null) {
  const input = editor?.closest('[data-slot="chat-input"]')
  return (
    owner.getAttribute("role") === "listbox" &&
    !!editor &&
    visible(editor) &&
    editor.getAttribute("aria-expanded") === "true" &&
    !!owner.id &&
    editor.getAttribute("aria-controls") === owner.id &&
    editor.ownerDocument.getElementById(owner.id) === owner &&
    !!input?.contains(owner)
  )
}
export function competingLayer(
  owned: Array<HTMLElement | null> = [],
  editor: HTMLTextAreaElement | null = null,
) {
  return Array.from(
    document.querySelectorAll<HTMLElement>(
      '[role="dialog"],[role="alertdialog"],[role="menu"],[role="listbox"]',
    ),
  ).some(
    (owner) =>
      visible(owner) &&
      !owned.some((root) => root === owner && visible(root)) &&
      !composerListbox(owner, editor),
  )
}
export function currentLayer(owner: HTMLElement | null) {
  if (!owner || !visible(owner) || competingLayer([owner])) return false
  const foreground = document.activeElement
  return (
    !(foreground instanceof HTMLElement) ||
    foreground === document.body ||
    !visible(foreground) ||
    owner.contains(foreground)
  )
}
