import type { NodeStatus, SystemNode } from "../../../../system-builder/types.js"

const statusColorMap: Record<NodeStatus, string> = {
  undefined: "#4B5563",
  defined: "#FACC15",
  connected: "#38BDF8",
  stable: "#4ADE80"
}

type NodeProps = {
  node: SystemNode
  selected: boolean
  onClick: () => void
}

export function Node({ node, selected, onClick }: NodeProps) {
  const color = statusColorMap[node.status]
  const size = selected ? 12 : 10

  return (
    <button
      type="button"
      className="group absolute inline-flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2.5 border-0 bg-transparent p-0"
      onClick={onClick}
      style={{
        left: `${node.x}%`,
        top: `${node.y}%`
      }}
    >
      <span
        className="block rounded-full"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: color,
          boxShadow: `0 0 18px ${color}66`
        }}
      />
      <span
        className={[
          "pointer-events-none whitespace-nowrap rounded-full bg-slate-900/88 px-2 py-1 text-[12px] text-slate-200/92 transition duration-150",
          selected ? "translate-y-0 opacity-100" : "-translate-y-0.5 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
        ].join(" ")}
      >
        {node.name}
      </span>
    </button>
  )
}
