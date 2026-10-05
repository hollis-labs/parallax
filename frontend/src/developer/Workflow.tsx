import {
  Canvas,
  Panel as CanvasPanel,
  Controls,
  Node,
  NodeContent,
  NodeDescription,
  NodeHeader,
  NodeTitle,
} from "@hollis-labs/kit-workflow/canvas"
import type { Node as FlowNode, NodeProps as FlowNodeProps, Viewport } from "@xyflow/react"
import { useState } from "react"
import type { DeveloperModel } from "./model"
import "@hollis-labs/kit-workflow/canvas.css"

type Step = FlowNode<
  { label: string; kind: string; runId: string; spanId: string; toolId: string },
  "review"
>
function ReviewNode({ data }: FlowNodeProps<Step>) {
  return (
    <Node handles={{ source: true, target: true }}>
      <NodeHeader>
        <NodeTitle>{data.label}</NodeTitle>
        <NodeDescription>
          {["run", "tool", "result"].includes(data.kind) ? data.kind : `Unknown kind: ${data.kind}`}
        </NodeDescription>
      </NodeHeader>
      <NodeContent>
        <p>{data.runId}</p>
        <p>{data.toolId || data.spanId || "Recorded result summary"}</p>
      </NodeContent>
    </Node>
  )
}
const nodeTypes = { review: ReviewNode }
export default function Workflow({
  model,
  selection,
  onSelect,
}: {
  model: DeveloperModel
  selection: string
  onSelect: (id: string) => void
}) {
  const [viewport, setViewport] = useState<Viewport>({ x: 20, y: 10, zoom: 0.85 })
  const nodes: Step[] = model.nodes.map((n) => ({
    id: n.id,
    type: "review",
    position: { x: n.x, y: n.y },
    data: { label: n.label, kind: n.kind, runId: n.runId, spanId: n.spanId, toolId: n.toolId },
    selected: selection === n.id,
    draggable: false,
    connectable: false,
  }))
  const edges = model.edges.map((e) => ({ ...e, label: e.id, selected: selection === e.id }))
  return (
    <section aria-label="Workflow graph">
      <p className="muted">
        Authored review order; node and edge selection plus pan/zoom only. Structure cannot change.
        Wheel scrolling stays with the page; drag the canvas background to pan.
      </p>
      <div className="workflow-viewport">
        <Canvas
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          viewport={viewport}
          onViewportChange={setViewport}
          onNodeClick={(_, n) => onSelect(n.id)}
          onEdgeClick={(_, e) => onSelect(e.id)}
          nodesDraggable={false}
          nodesConnectable={false}
          edgesReconnectable={false}
          deleteKeyCode={null}
          panOnDrag
          panOnScroll={false}
          zoomOnScroll={false}
          zoomOnPinch
          fitView={false}
        >
          <Controls showInteractive={false} />
          <CanvasPanel position="top-right">
            Read-only · {Math.round(viewport.zoom * 100)}%
          </CanvasPanel>
        </Canvas>
      </div>
      <p className="muted">Keyboard alternative: use the node and relationship buttons below.</p>
    </section>
  )
}
