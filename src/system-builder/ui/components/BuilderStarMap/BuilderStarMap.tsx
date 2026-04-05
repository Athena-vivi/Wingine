import type { SystemMap } from "../../../../system-builder/types.js"
import { Edge } from "../Edge/Edge.js"
import { Node } from "../Node/Node.js"

const layerLabels = [
  { id: "protocol", label: "Protocol Layer", top: "8%" },
  { id: "module", label: "Module Layer", top: "31%" },
  { id: "control", label: "Control Layer", top: "54%" },
  { id: "execution", label: "Execution Layer", top: "77%" }
] as const

type BuilderStarMapProps = {
  map: SystemMap
  selectedNodeId: string | null
  onNodeSelect: (nodeId: string) => void
  isLoading: boolean
}

export function BuilderStarMap({
  map,
  selectedNodeId,
  onNodeSelect,
  isLoading
}: BuilderStarMapProps) {
  return (
    <div
      className="relative h-full w-full bg-[#0b0f17]"
      style={{
        background:
          "radial-gradient(circle at 20% 30%, #1a1f2b, #0b0f17), #0b0f17"
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          backgroundImage: [
            "radial-gradient(circle at 12% 18%, rgba(255,255,255,0.08) 0, transparent 1px)",
            "radial-gradient(circle at 34% 26%, rgba(255,255,255,0.05) 0, transparent 1px)",
            "radial-gradient(circle at 58% 14%, rgba(255,255,255,0.06) 0, transparent 1px)",
            "radial-gradient(circle at 82% 22%, rgba(255,255,255,0.07) 0, transparent 1px)",
            "radial-gradient(circle at 24% 58%, rgba(255,255,255,0.05) 0, transparent 1px)",
            "radial-gradient(circle at 46% 74%, rgba(255,255,255,0.08) 0, transparent 1px)",
            "radial-gradient(circle at 72% 68%, rgba(255,255,255,0.06) 0, transparent 1px)",
            "radial-gradient(circle at 88% 84%, rgba(255,255,255,0.05) 0, transparent 1px)"
          ].join(", ")
        }}
      />

      {layerLabels.map((layer) => (
        <div
          key={layer.id}
          className="pointer-events-none absolute right-6 left-6 h-[14%] border-t border-slate-400/10"
          style={{ top: layer.top }}
        >
          <span className="absolute top-3 left-0 text-[11px] uppercase tracking-[0.14em] text-slate-400/50">
            {layer.label}
          </span>
        </div>
      ))}

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {map.edges.map((edge) => (
          <Edge key={edge.id} edge={edge} nodes={map.nodes} />
        ))}
      </svg>

      <div className="absolute inset-0">
        {map.nodes.map((node) => (
          <Node
            key={node.id}
            node={node}
            selected={node.id === selectedNodeId}
            onClick={() => onNodeSelect(node.id)}
          />
        ))}
      </div>

      {isLoading ? (
        <div className="absolute inset-0 grid place-items-center bg-[#0b0f17]/35 text-[12px] uppercase tracking-[0.08em] text-slate-200/90">
          Loading builder map...
        </div>
      ) : null}
    </div>
  )
}
