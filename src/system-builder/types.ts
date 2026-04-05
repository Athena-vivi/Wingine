export type NodeStatus =
  | "undefined"
  | "defined"
  | "connected"
  | "stable"

export type ActiveSpace =
  | "problem-radar"
  | "builder-space"

export type NodeLayer =
  | "protocol"
  | "module"
  | "control"
  | "execution"

export type SystemNode = {
  id: string
  name: string
  layer: NodeLayer
  status: NodeStatus
  x: number
  y: number
  sourceType?: "internal" | "opensource" | "mcp" | "api"
  issueCount?: number
}

export type SystemEdge = {
  id: string
  from: string
  to: string
}

export type SystemMap = {
  projectId: string
  nodes: SystemNode[]
  edges: SystemEdge[]
}

export type SystemProject = {
  id: string
  name: string
  summary: string
}

export type ProblemSignalStatus =
  | "raw"
  | "clustered"
  | "selected"

export type ProblemSignal = {
  id: string
  title: string
  summary?: string
  status: ProblemSignalStatus
  x: number
  y: number
  clusterId?: string
  heat?: number
  relatedModuleCandidateIds?: string[]
}

export type ProblemCluster = {
  id: string
  name: string
}

export type ProblemRadarMap = {
  projectId: string
  signals: ProblemSignal[]
  clusters: ProblemCluster[]
}

export type ProjectPhase =
  | "mapping"
  | "protocol"
  | "module"
  | "control"
  | "execution"
  | "stabilizing"

export type ProjectHealth =
  | "clear"
  | "blocked"
  | "partial"
  | "unstable"

export type ProjectStatus = {
  projectId: string
  currentPhase: ProjectPhase
  health: ProjectHealth
  summary: string
  currentFocus: string
  nextStep: string
  blockers: string[]
}

export type LayerKind =
  | "protocol"
  | "module"
  | "control"
  | "execution"

export type LayerProgressStatus =
  | "empty"
  | "draft"
  | "active"
  | "stable"

export type LayerStatus = {
  layer: LayerKind
  status: LayerProgressStatus
  progress: number
  note?: string
  issues?: string[]
}

export type ProjectLayerState = {
  projectId: string
  layers: LayerStatus[]
}

export type ModuleSourceType =
  | "opensource"
  | "mcp"
  | "api"
  | "internal"

export type IntegrationMode =
  | "direct_use"
  | "adapter"
  | "decompose"
  | "observe_only"

export type ModuleCandidateStatus =
  | "backlog"
  | "reviewing"
  | "testing"
  | "adopted"
  | "rejected"

export type ModuleCandidate = {
  id: string
  name: string
  sourceType: ModuleSourceType
  sourceName: string
  purpose: string
  targetLayer: "module" | "execution"
  integrationMode: IntegrationMode
  status: ModuleCandidateStatus
  notes?: string
}

export type ModuleRegistry = {
  projectId: string
  candidates: ModuleCandidate[]
}

export type RightPanelTab =
  | "detail"
  | "overview"
  | "layers"
  | "modules"

export type ProductStage =
  | "idea"
  | "mapping"
  | "protocol"
  | "module"
  | "control"
  | "execution"
  | "paused"

export type ProductHealth =
  | "clear"
  | "partial"
  | "blocked"
  | "drifting"

export type ProductStatusCard = {
  id: string
  name: string
  category: string
  stage: ProductStage
  health: ProductHealth
  currentFocus: string
  nextStep: string
  lastNote?: string
}

export type CapabilityStatus =
  | "known"
  | "candidate"
  | "adopted"

export type Capability = {
  id: string
  name: string
  description: string
  location?: string
  sourceType?: "opensource" | "mcp" | "api" | "internal"
  layer: "problem" | "build" | "distribution"
  status: CapabilityStatus
}
