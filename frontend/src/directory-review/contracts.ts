import type { Badge, Card, Popover, Tabs } from "@hollis-labs/design-components"
import type { ComponentProps } from "react"

const card: ComponentProps<typeof Card> = { size: "sm" }
const badge: ComponentProps<typeof Badge> = { variant: "outline" }
const tabs: ComponentProps<typeof Tabs> = { value: "profile", orientation: "horizontal" }
const popup: ComponentProps<typeof Popover> = { open: false }
// @ts-expect-error Published card sizes are finite.
const invalidCard: ComponentProps<typeof Card> = { size: "huge" }
// @ts-expect-error Unknown states use neutral host labels, never unsupported badge variants.
const invalidBadge: ComponentProps<typeof Badge> = { variant: "authorized" }
void [card, badge, tabs, popup, invalidCard, invalidBadge]
