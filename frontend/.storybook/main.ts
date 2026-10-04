import type { StorybookConfig } from "@storybook/react-vite"

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.tsx"],
  framework: "@storybook/react-vite",
  async viteFinal(config) {
    config.plugins = config.plugins?.filter(
      (p) =>
        !(p && typeof p === "object" && "name" in p && String(p.name).includes("plugin-host-ui")),
    )
    return config
  },
}
export default config
