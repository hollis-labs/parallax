import type { ScrollArea, TableCell, TableHead } from "@hollis-labs/design-components"
import type { ComponentProps } from "react"

const head: ComponentProps<typeof TableHead> = { scope: "col" }
const cell: ComponentProps<typeof TableCell> = { colSpan: 5 }
const root: ComponentProps<typeof ScrollArea> = { role: "region", "aria-label": "Recorded ledger" }
// @ts-expect-error Root does not expose a private viewport-props patch.
const invalid: ComponentProps<typeof ScrollArea> = { viewportProps: { tabIndex: 0 } }
void [head, cell, root, invalid]
