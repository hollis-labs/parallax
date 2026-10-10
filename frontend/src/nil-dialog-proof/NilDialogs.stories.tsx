import type { Meta, StoryObj } from "@storybook/react-vite"
import { Appearance } from "./Appearance"
import { ForegroundProof } from "./ForegroundProof"
import { LayerProof } from "./LayerProof"
import { NilDialogProof } from "./Proof"
import { TorqueSearchProof } from "./TorqueProof"

const meta = {
  title: "Primitives/Nil dialog behavior",
  component: NilDialogProof,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <Appearance>
        <Story />
      </Appearance>
    ),
  ],
} satisfies Meta<typeof NilDialogProof>
export default meta
type Story = StoryObj<typeof meta>
export const NilKeyboard: Story = {}
export const TorqueInspection: Story = { render: () => <TorqueSearchProof /> }
export const RegisteredLayers: Story = { render: () => <LayerProof /> }

export const ForegroundAdmission: Story = { render: () => <ForegroundProof /> }
