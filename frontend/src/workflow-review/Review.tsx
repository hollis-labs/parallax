import { Button, EmptyState } from "@hollis-labs/design-components"
import {
  Canvas,
  Connection,
  Controls,
  Edge,
  Node,
  NodeAction,
  NodeContent,
  NodeDescription,
  NodeFooter,
  NodeHeader,
  NodeTitle,
  Panel,
  Toolbar,
} from "@hollis-labs/kit-workflow/canvas"
import { type Node as FlowNode, type NodeProps, Position, type Viewport } from "@xyflow/react"
import { useLayoutEffect, useRef, useState } from "react"
import type { OperationsModel } from "../operations/model"
import {
  type WorkflowModel,
  type WorkflowState,
  workflowModel,
  workflowStates,
  workflowTarget,
} from "./model"
import "./review.css"

type Step = FlowNode<
  { label: string; kind: string; reference: string; inspect: () => void },
  "review"
>
function ReviewNode({ data, selected }: NodeProps<Step>) {
  return (
    <>
      <Node handles={{ source: true, target: true }}>
        <NodeHeader>
          <NodeTitle>{data.label}</NodeTitle>
          <NodeDescription>
            {["run", "tool", "result"].includes(data.kind)
              ? `Recorded ${data.kind} reference`
              : `Unknown authored kind: ${data.kind}`}
          </NodeDescription>
          <NodeAction>
            <Button
              size="sm"
              className="nodrag"
              onClick={(e) => {
                e.stopPropagation()
                data.inspect()
              }}
            >
              Inspect node
            </Button>
          </NodeAction>
        </NodeHeader>
        <NodeContent>
          <p>{data.reference}</p>
          <p>Authored inspection order</p>
        </NodeContent>
        <NodeFooter>
          <Button
            size="sm"
            className="nodrag"
            onClick={(e) => {
              e.stopPropagation()
              data.inspect()
            }}
          >
            Review linked evidence
          </Button>
        </NodeFooter>
      </Node>
      <Toolbar isVisible={selected} aria-label="Selected node toolbar">
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            data.inspect()
          }}
        >
          Inspect selected node
        </Button>
      </Toolbar>
    </>
  )
}
const nodeTypes = { review: ReviewNode }
export function WorkflowReview({
  operations,
  initialState = "recorded",
  epoch = 0,
}: {
  operations: OperationsModel
  initialState?: WorkflowState
  epoch?: number
}) {
  return (
    <Frame
      key={`${workflowModel(operations, initialState).source}/${epoch}`}
      operations={operations}
      initialState={initialState}
    />
  )
}
function Frame({
  operations,
  initialState,
}: {
  operations: OperationsModel
  initialState: WorkflowState
}) {
  const [state, setState] = useState(initialState),
    [copy, setCopy] = useState(0)
  const data = workflowModel(operations, state)
  return (
    <section className="workflow-review">
      <div className="workflow-review-controls">
        <label>
          Workflow appearance{" "}
          <select
            aria-label="Workflow review appearance"
            value={state}
            onChange={(e) => {
              if (workflowStates.includes(e.target.value as WorkflowState))
                setState(e.target.value as WorkflowState)
            }}
          >
            {workflowStates.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <Button onClick={() => setCopy((n) => n + 1)}>Reset workflow review</Button>
        <Button onClick={() => setCopy((n) => n + 1)}>Replace workflow source copy</Button>
      </div>
      <p className="muted">
        {data.fixture.version} · recorded {data.fixture.recordedAt} · cutoff {data.cutoff}. Supplied
        graph is authored inspection order, not workflow execution. Equal-width review positions are
        separate from recorded coordinates; selection and pan/zoom are local only.
      </p>
      {state === "locked" && (
        <p role="status">
          Locked source: graph editing is unavailable. Read-only navigation, inspection and
          decorative specimen selection remain local presentation controls.
        </p>
      )}
      <Instance key={`${data.source}/${copy}`} data={data} />
    </section>
  )
}
function Instance({ data }: { data: WorkflowModel }) {
  const [selection, setSelection] = useState(""),
    [inspection, setInspection] = useState(""),
    [connection, setConnection] = useState<null | "valid" | "invalid">(null)
  const [viewport, setViewport] = useState<Viewport>({ x: 20, y: 50, zoom: 0.65 })
  const current = useRef({ alive: false, lease: 0 }),
    [, refresh] = useState(0)
  useLayoutEffect(() => {
    current.current.alive = true
    current.current.lease++
    refresh((n) => n + 1)
    return () => {
      current.current.alive = false
      current.current.lease++
    }
  }, [])
  const lease = current.current.lease,
    admitted = () => current.current.alive && current.current.lease === lease && data.available
  function choose(id: string, inspect = false) {
    if (!admitted() || !workflowTarget(data, id)) return
    if (selection === id && inspection === (inspect ? id : "")) return
    current.current.lease++
    setSelection(id)
    setInspection(inspect ? id : "")
  }
  function view(next: Viewport) {
    if (
      !admitted() ||
      ![next.x, next.y, next.zoom].every(Number.isFinite) ||
      next.zoom < 0.25 ||
      next.zoom > 1.5
    )
      return
    current.current.lease++
    setViewport(next)
    setInspection("")
  }
  if (!data.available)
    return (
      <EmptyState
        variant={data.state === "loading" ? "empty" : "error"}
        title={data.blockedReason}
        description="No graph, node evidence or specimen is admitted here; change the supplied frame/source/appearance."
      />
    )
  if (!data.nodes.length)
    return (
      <EmptyState
        variant="empty"
        title="Observed empty workflow"
        description="0 supplied nodes · 0 supplied relationships; no runtime activity implied."
      />
    )
  const nodes: Step[] = data.nodes.map((n, i) => ({
    id: n.id,
    type: "review",
    position: { x: i * 500, y: 120 },
    data: {
      label: n.label,
      kind: n.kind,
      reference: [n.runId, n.toolId || n.spanId].filter(Boolean).join(" · "),
      inspect: () => choose(n.id, true),
    },
    selected: selection === n.id,
    draggable: false,
    connectable: false,
  }))
  const edges = data.edges.map((e) => ({ ...e, label: e.id, selected: selection === e.id }))
  const selected = workflowTarget(data, inspection)
  const node = selected?.node,
    edge = selected?.edge,
    span = data.spans.find((s) => s.id === node?.spanId)
  return (
    <>
      <section aria-label="Recorded workflow canvas">
        <h2>Recorded inspection graph</h2>
        <p className="muted">
          {nodes.length} supplied nodes · {edges.length} supplied relationships. Drag background to
          pan; wheel stays with page. Graph structure is immutable.
        </p>
        <div className="workflow-review-canvas">
          <Canvas
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            viewport={viewport}
            onViewportChange={view}
            onNodeClick={(_, n) => choose(n.id)}
            onEdgeClick={(_, e) => choose(e.id, true)}
            nodesDraggable={false}
            nodesConnectable={false}
            edgesReconnectable={false}
            deleteKeyCode={null}
            panOnDrag
            panOnScroll={false}
            zoomOnScroll={false}
            zoomOnPinch
            minZoom={0.25}
            maxZoom={1.5}
            fitView={false}
          >
            <Controls showInteractive={false} />
            <Panel position="top-left" aria-label="Workflow canvas review panel">
              Read-only · {Math.round(viewport.zoom * 100)}% · {selection || "No selection"}
            </Panel>
          </Canvas>
        </div>
      </section>
      <section aria-label="Native workflow navigation">
        <h2>Keyboard node and relationship inspection</h2>
        <div className="workflow-review-controls">
          {data.nodes.map((n) => (
            <Button key={n.id} aria-pressed={selection === n.id} onClick={() => choose(n.id, true)}>
              Inspect {n.id}: {n.label}
            </Button>
          ))}
          {data.edges.map((e) => (
            <Button key={e.id} aria-pressed={selection === e.id} onClick={() => choose(e.id, true)}>
              Inspect {e.id}: {e.source} → {e.target}
            </Button>
          ))}
        </div>
        <div className="workflow-review-controls">
          <Button onClick={() => view({ ...viewport, zoom: Math.min(1.5, viewport.zoom + 0.1) })}>
            Zoom in review
          </Button>
          <Button onClick={() => view({ ...viewport, zoom: Math.max(0.25, viewport.zoom - 0.1) })}>
            Zoom out review
          </Button>
          <Button onClick={() => view({ x: 20, y: 50, zoom: 0.65 })}>Reset canvas viewport</Button>
          <Button onClick={() => view({ ...viewport, x: viewport.x - 200 })}>
            Pan to next node
          </Button>
        </div>
      </section>
      <section aria-label="Workflow evidence inspector" className="workflow-review-inspector">
        <h2>
          {node
            ? `${node.id}: ${node.label}`
            : edge
              ? `${edge.id}: supplied relationship`
              : "No evidence inspected"}
        </h2>
        {selected ? (
          <>
            <p>
              {node
                ? `${node.kind} · ${node.runId}`
                : `${edge?.source} → ${edge?.target} · ${edge?.label}`}
            </p>
            <dl>
              <dt>Current run</dt>
              <dd>{data.run ? `${data.run.id} · ${data.run.status}` : "Run unavailable"}</dd>
              <dt>Current linked tool</dt>
              <dd>{data.tool ? `${data.tool.id} · ${data.tool.status}` : "Tool unavailable"}</dd>
              <dt>Current linked span</dt>
              <dd>
                {span
                  ? `${span.id} · ${span.status}`
                  : "No linked span supplied for this selection"}
              </dd>
              <dt>Recorded receipt</dt>
              <dd>
                {data.usage
                  ? `${data.usage.id} · ${data.usage.tokens} tokens`
                  : "Receipt unavailable"}
              </dd>
              <dt>Evidence cutoff UTC</dt>
              <dd>{data.cutoff}</dd>
            </dl>
            <Button
              onClick={() => {
                if (!admitted()) return
                current.current.lease++
                setInspection("")
              }}
            >
              Clear inspected evidence
            </Button>
          </>
        ) : (
          <p>Select a supplied node or relationship. No results are produced by inspecting.</p>
        )}
      </section>
      <section aria-label="Authored connection and edge specimens">
        <h2>Authored presentation specimens</h2>
        <p className="muted">
          These finite paths are separate from the recorded graph. Valid means a supplied visual
          validation state, not an accepted business connection; the traveller is decorative, not
          processing.
        </p>
        <label>
          Connection specimen{" "}
          <select
            aria-label="Connection specimen state"
            value={connection ?? "default"}
            onChange={(e) => {
              if (!admitted()) return
              const next = e.target.value
              if (!["default", "valid", "invalid"].includes(next)) return
              if ((next === "default" ? null : next) === connection) return
              current.current.lease++
              setConnection(next === "default" ? null : (next as "valid" | "invalid"))
              setInspection("")
            }}
          >
            <option>default</option>
            <option>valid</option>
            <option>invalid</option>
          </select>
        </label>
        <div className="workflow-specimen">
          <p>Connection: {connection ?? "default"} · bounded authored cubic path</p>
          <svg
            className="kit-workflow react-flow workflow-specimen-svg"
            viewBox="0 0 320 90"
            aria-hidden="true"
            data-testid="connection-specimen"
          >
            <Connection fromX={20} fromY={30} toX={295} toY={60} connectionStatus={connection} />
          </svg>
          <p>Animated edge · decorative traveler (hidden with reduced motion)</p>
          <svg
            className="kit-workflow react-flow workflow-specimen-svg"
            viewBox="0 0 320 90"
            aria-hidden="true"
            data-testid="animated-specimen"
          >
            <Edge.Animated
              id="SPECIMEN-ANIMATED"
              source="authored-a"
              target="authored-b"
              sourceX={20}
              sourceY={30}
              targetX={295}
              targetY={60}
              sourcePosition={Position.Right}
              targetPosition={Position.Left}
            />
          </svg>
          <p>Temporary edge · authored dashed proposal, not a recorded relationship</p>
          <svg
            className="kit-workflow react-flow workflow-specimen-svg"
            viewBox="0 0 320 90"
            aria-hidden="true"
            data-testid="temporary-specimen"
          >
            <Edge.Temporary
              id="SPECIMEN-TEMPORARY"
              source="authored-a"
              target="authored-b"
              sourceX={20}
              sourceY={30}
              targetX={295}
              targetY={60}
              sourcePosition={Position.Right}
              targetPosition={Position.Left}
            />
          </svg>
        </div>
      </section>
    </>
  )
}
export default WorkflowReview
