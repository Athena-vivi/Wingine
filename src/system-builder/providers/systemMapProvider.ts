import type {
  Capability,
  ModuleRegistry,
  ProductStatusCard,
  ProjectLayerState,
  ProjectStatus,
  ProblemRadarMap,
  ProblemSignal,
  SystemEdge,
  SystemMap,
  SystemNode,
  SystemProject
} from "../types.js"

export interface SystemMapProvider {
  getMap(projectId: string): Promise<SystemMap>
  updateNode(node: SystemNode): Promise<void>
  updateEdge(edge: SystemEdge): Promise<void>
}

export interface SystemProjectProvider {
  getProjects(): Promise<SystemProject[]>
}

export type SystemWorkspaceProvider = SystemMapProvider & SystemProjectProvider

export interface ProblemRadarProvider {
  getRadar(projectId: string): Promise<ProblemRadarMap>
  updateSignal(signal: ProblemSignal): Promise<void>
}

export interface ProblemSignalBuilderAdapter {
  addToBuilder(projectId: string, signal: ProblemSignal): Promise<void>
}

export interface WorkspaceStatusProvider {
  getProjectStatus(projectId: string): Promise<ProjectStatus>
  getProjectLayerState(projectId: string): Promise<ProjectLayerState>
  getModuleRegistry(projectId: string): Promise<ModuleRegistry>
}

export interface PortfolioProvider {
  getAllProducts(): Promise<ProductStatusCard[]>
}

export interface CapabilityProvider {
  getAllCapabilities(): Promise<Capability[]>
}
