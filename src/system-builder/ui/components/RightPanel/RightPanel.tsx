import type {
  ActiveSpace,
  ModuleRegistry,
  NodeStatus,
  ProblemSignal,
  ProblemSignalStatus,
  ProjectLayerState,
  ProjectStatus,
  RightPanelTab,
  SystemNode
} from "../../../../system-builder/types.js"
import { DetailPanel } from "../DetailPanel/DetailPanel.js"
import { LayerStatusPanel } from "../LayerStatusPanel/LayerStatusPanel.js"
import { ModuleIntakePanel } from "../ModuleIntakePanel/ModuleIntakePanel.js"
import { ProjectOverviewPanel } from "../ProjectOverviewPanel/ProjectOverviewPanel.js"
import { RightPanelTabs } from "../RightPanelTabs/RightPanelTabs.js"

type RightPanelProps = {
  activeSpace: ActiveSpace
  activeTab: RightPanelTab
  projectStatus: ProjectStatus | null
  layerState: ProjectLayerState | null
  moduleRegistry: ModuleRegistry | null
  node: SystemNode | null
  signal: ProblemSignal | null
  onTabChange: (tab: RightPanelTab) => void
  onCloseNode: () => void
  onCloseSignal: () => void
  onNodeStatusChange: (status: NodeStatus) => void
  onSignalStatusChange: (status: ProblemSignalStatus) => void
  onAddToBuilder: () => void
}

export function RightPanel({
  activeSpace,
  activeTab,
  projectStatus,
  layerState,
  moduleRegistry,
  node,
  signal,
  onTabChange,
  onCloseNode,
  onCloseSignal,
  onNodeStatusChange,
  onSignalStatusChange,
  onAddToBuilder
}: RightPanelProps) {
  return (
    <aside className="absolute top-6 right-6 z-[2] min-h-[240px] w-[340px] rounded-[20px] border border-slate-400/15 bg-[#0a0f17]/90 p-5 shadow-[0_18px_48px_rgba(2,6,23,0.4)] backdrop-blur-[10px] max-[980px]:right-4 max-[980px]:bottom-4 max-[980px]:left-4 max-[980px]:top-auto max-[980px]:w-auto">
      <RightPanelTabs activeTab={activeTab} onChange={onTabChange} />

      <div className="max-h-[calc(100vh-180px)] overflow-y-auto pr-1 max-[980px]:max-h-[46vh]">
        {activeTab === "detail" ? (
          <DetailPanel
            activeSpace={activeSpace}
            node={node}
            signal={signal}
            onCloseNode={onCloseNode}
            onCloseSignal={onCloseSignal}
            onNodeStatusChange={onNodeStatusChange}
            onSignalStatusChange={onSignalStatusChange}
            onAddToBuilder={onAddToBuilder}
          />
        ) : null}

        {activeTab === "overview" ? (
          <ProjectOverviewPanel projectStatus={projectStatus} />
        ) : null}

        {activeTab === "layers" ? <LayerStatusPanel layerState={layerState} /> : null}

        {activeTab === "modules" ? (
          <ModuleIntakePanel moduleRegistry={moduleRegistry} />
        ) : null}
      </div>
    </aside>
  )
}
