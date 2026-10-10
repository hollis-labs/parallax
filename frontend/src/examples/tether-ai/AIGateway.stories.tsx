import { applyTheme } from "@hollis-labs/kit-dashboard"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { useEffect, useState } from "react"
import { AIGatewayPage, type AITabKey } from "../../tether-sysop/AIGatewayPage"
import type { OverviewVariantKey } from "../../tether-sysop/model"

function PortableAIGateway({
  tab = "config",
  variant = "standard",
  theme = "p4-white",
  mode = "dark",
  appearance = "ready",
}: {
  tab?: AITabKey
  variant?: OverviewVariantKey
  theme?: string
  mode?: "dark" | "light"
  appearance?: "ready" | "loading" | "error" | "empty"
}) {
  const [activeTab, setActiveTab] = useState<AITabKey>(tab)
  const [activeVariant, setActiveVariant] = useState<OverviewVariantKey>(variant)

  useEffect(() => {
    setActiveTab(tab)
  }, [tab])

  useEffect(() => {
    setActiveVariant(variant)
  }, [variant])

  useEffect(() => {
    const root = document.documentElement
    const oldTheme = root.dataset.theme
    const oldMode = root.dataset.mode
    applyTheme(theme as Parameters<typeof applyTheme>[0])
    root.dataset.mode = mode
    root.classList.toggle("light", mode === "light")
    root.classList.toggle("dark", mode === "dark")
    root.style.colorScheme = mode
    return () => {
      if (oldTheme) root.dataset.theme = oldTheme
      else delete root.dataset.theme
      if (oldMode) root.dataset.mode = oldMode
      else delete root.dataset.mode
    }
  }, [theme, mode])

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <AIGatewayPage
        initialTab={activeTab}
        onTabChange={setActiveTab}
        variant={activeVariant}
        onVariantChange={setActiveVariant}
        forcedAppearance={appearance}
        showIdentityLinks={true}
        showVariantSelector={true}
      />
    </div>
  )
}

const meta = {
  title: "App Examples/Tether AI Gateway",
  component: PortableAIGateway,
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <Story />],
} satisfies Meta<typeof PortableAIGateway>

export default meta
type Story = StoryObj<typeof meta>

export const Standard: Story = {
  args: {
    tab: "config",
    variant: "standard",
  },
}

export const Narrow: Story = {
  args: {
    tab: "config",
    variant: "standard",
  },
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
}

export const Short: Story = {
  args: {
    tab: "config",
    variant: "standard",
  },
}

export const ProvidersTab: Story = {
  args: {
    tab: "providers",
    variant: "standard",
  },
}

export const RoutesTab: Story = {
  args: {
    tab: "routes",
    variant: "standard",
  },
}

export const RuntimeTab: Story = {
  args: {
    tab: "runtime",
    variant: "standard",
  },
}

export const UsageTab: Story = {
  args: {
    tab: "usage",
    variant: "standard",
  },
}

export const AuditTab: Story = {
  args: {
    tab: "audit",
    variant: "standard",
  },
}

export const BudgetsTab: Story = {
  args: {
    tab: "budgets",
    variant: "standard",
  },
}

export const BlockedHealth: Story = {
  args: {
    tab: "config",
    variant: "blocked-health",
  },
}

export const DegradedReliability: Story = {
  args: {
    tab: "config",
    variant: "degraded-reliability",
  },
}

export const CombinedAdverse: Story = {
  args: {
    tab: "config",
    variant: "combined-adverse",
  },
}

export const LoadingAppearance: Story = {
  args: {
    tab: "config",
    appearance: "loading",
  },
}

export const ErrorAppearance: Story = {
  args: {
    tab: "config",
    appearance: "error",
  },
}

export const EmptyAppearance: Story = {
  args: {
    tab: "config",
    appearance: "empty",
  },
}

export const GreenPhosphorTheme: Story = {
  args: {
    tab: "config",
    theme: "p1-green-phosphor",
  },
}

export const AmberPhosphorTheme: Story = {
  args: {
    tab: "config",
    theme: "p3-amber-phosphor",
  },
}

export const LightMode: Story = {
  args: {
    tab: "config",
    mode: "light",
  },
}
