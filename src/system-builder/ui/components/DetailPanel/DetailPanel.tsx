import type {
  ActiveSpace,
  NodeStatus,
  ProblemSignal,
  ProblemSignalStatus,
  SystemNode
} from "../../../../system-builder/types.js"
import { NodeDetailPanel } from "../NodeDetailPanel/NodeDetailPanel.js"
import { SignalDetailPanel } from "../SignalDetailPanel/SignalDetailPanel.js"

type DetailPanelProps = {
  activeSpace: ActiveSpace
  node: SystemNode | null
  signal: ProblemSignal | null
  onCloseNode: () => void
  onCloseSignal: () => void
  onNodeStatusChange: (status: NodeStatus) => void
  onSignalStatusChange: (status: ProblemSignalStatus) => void
  onAddToBuilder: () => void
}

export function DetailPanel({
  activeSpace,
  node,
  signal,
  onCloseNode,
  onCloseSignal,
  onNodeStatusChange,
  onSignalStatusChange,
  onAddToBuilder
}: DetailPanelProps) {
  if (activeSpace === "problem-radar") {
    return (
      <SignalDetailPanel
        signal={signal}
        onClose={onCloseSignal}
        onStatusChange={onSignalStatusChange}
        onAddToBuilder={onAddToBuilder}
        embedded
      />
    )
  }

  return (
    <NodeDetailPanel
      node={node}
      onClose={onCloseNode}
      onStatusChange={onNodeStatusChange}
      embedded
    />
  )
}
