import type { CodeBlockProps, FileTreeProps } from "@hollis-labs/kit-code"
import type { CanvasProps } from "@hollis-labs/kit-workflow/canvas"

function contracts(code: CodeBlockProps, tree: FileTreeProps, canvas: CanvasProps) {
  // @ts-expect-error source requires string
  code.code = 42
  // @ts-expect-error immutable expansion uses a Set
  tree.expanded = ["src"]
  // @ts-expect-error graph nodes are structured records
  canvas.nodes = ["node"]
  return [code, tree, canvas]
}
void contracts
