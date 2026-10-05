import { AppShell, Button } from "@hollis-labs/design-components"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { Layers } from "lucide-react"
import { useRef, useState } from "react"
import { operationsModel } from "../operations/model"
import { Comparison, type Layout } from "./Comparison"
import { Navigation, type NavigationMode } from "./Navigation"

function Frame({
  layout = "list",
  navigation = "rail",
  scenario = "populated",
}: {
  layout?: Layout
  navigation?: NavigationMode
  scenario?: string
}) {
  const [current, setCurrent] = useState(layout),
    [selection, setSelection] = useState<string | null>(null),
    [query, setQuery] = useState(""),
    [view, setView] = useState("Review")
  const scroll = useRef<HTMLDivElement>(null)
  const items = ["Review", "Context"].map((label) => ({
    key: label,
    label,
    active: view === label,
    icon: <Layers className="size-4" />,
    onSelect: () => setView(label),
  }))
  return (
    <AppShell
      nav={navigation === "rail" ? <Navigation mode={navigation} items={items} /> : undefined}
      header={
        <div className="comparison-heading">
          <strong>Portable shell comparison</strong>
          {navigation !== "rail" && <Navigation mode={navigation} items={items} />}
        </div>
      }
    >
      {view === "Review" ? (
        <Comparison
          model={operationsModel(scenario, query)}
          selection={selection}
          onSelect={setSelection}
          query={query}
          onQuery={setQuery}
          layout={current}
          onLayout={setCurrent}
          scrollRef={scroll}
        />
      ) : (
        <section className="page-scroll">
          <h1>Preserved context</h1>
          <p>{selection ?? "No selected run"}</p>
          <Button onClick={() => setView("Review")}>Return to review</Button>
        </section>
      )}
    </AppShell>
  )
}
function Portable(args: Parameters<typeof Frame>[0]) {
  return <Frame key={`${args.scenario}/${args.layout}/${args.navigation}`} {...args} />
}
const meta = {
  title: "Layouts/Controlled comparison",
  component: Portable,
  parameters: { layout: "fullscreen" },
  args: { scenario: "populated", layout: "list", navigation: "rail" },
} satisfies Meta<typeof Portable>
export default meta
type Story = StoryObj<typeof meta>
export const List: Story = {}
export const Table: Story = { args: { layout: "table" } }
export const Split: Story = { args: { layout: "split" } }
export const Drawer: Story = { args: { layout: "drawer" } }
export const HeaderNavigation: Story = { args: { navigation: "header" } }
export const DrawerNavigation: Story = { args: { navigation: "drawer" } }
export const Large: Story = { args: { scenario: "large", layout: "table" } }
export const Denied: Story = { args: { scenario: "permission-denied" } }
export const Empty: Story = { args: { scenario: "empty" } }
export const Long: Story = { args: { scenario: "long-labels", layout: "split" } }
