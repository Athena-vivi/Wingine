import type { NodeStatus, SystemEdge, SystemNode } from "../../../../system-builder/types.js"

const statusColorMap: Record<NodeStatus, string> = {
  undefined: "#4B5563",
  defined: "#FACC15",
  connected: "#38BDF8",
  stable: "#4ADE80"
}

type EdgeProps = {
  edge: SystemEdge
  nodes: SystemNode[]
}

export function Edge({ edge, nodes }: EdgeProps) {
  const fromNode = nodes.find((node) => node.id === edge.from)
  const toNode = nodes.find((node) => node.id === edge.to)

  if (!fromNode || !toNode) {
    return null
  }

  return (
    <line
      x1={fromNode.x}
      y1={fromNode.y}
      x2={toNode.x}
      y2={toNode.y}
      stroke={statusColorMap[fromNode.status]}
      strokeOpacity={0.32}
      strokeWidth={0.32}
    />
  )
}
