import type { SystemMap } from "../types.js"

function createMap(
  projectId: string,
  labels: {
    protocolA: string
    protocolB: string
    moduleA: string
    moduleB: string
    controlA: string
    controlB: string
    executionA: string
    executionB: string
  }
): SystemMap {
  return {
    projectId,
    nodes: [
      { id: `${projectId}-protocol-a`, name: labels.protocolA, layer: "protocol", status: "stable", x: 18, y: 13, sourceType: "internal", issueCount: 1 },
      { id: `${projectId}-protocol-b`, name: labels.protocolB, layer: "protocol", status: "connected", x: 50, y: 18, sourceType: "internal" },
      { id: `${projectId}-module-a`, name: labels.moduleA, layer: "module", status: "connected", x: 26, y: 36, sourceType: "internal", issueCount: 2 },
      { id: `${projectId}-module-b`, name: labels.moduleB, layer: "module", status: "defined", x: 72, y: 38, sourceType: "opensource" },
      { id: `${projectId}-control-a`, name: labels.controlA, layer: "control", status: "defined", x: 30, y: 60, sourceType: "internal" },
      { id: `${projectId}-control-b`, name: labels.controlB, layer: "control", status: "undefined", x: 76, y: 58, sourceType: "api", issueCount: 1 },
      { id: `${projectId}-execution-a`, name: labels.executionA, layer: "execution", status: "connected", x: 38, y: 82, sourceType: "internal" },
      { id: `${projectId}-execution-b`, name: labels.executionB, layer: "execution", status: "stable", x: 68, y: 80, sourceType: "mcp" }
    ],
    edges: [
      { id: `${projectId}-e1`, from: `${projectId}-protocol-a`, to: `${projectId}-module-a` },
      { id: `${projectId}-e2`, from: `${projectId}-protocol-b`, to: `${projectId}-module-b` },
      { id: `${projectId}-e3`, from: `${projectId}-module-a`, to: `${projectId}-control-a` },
      { id: `${projectId}-e4`, from: `${projectId}-module-b`, to: `${projectId}-control-b` },
      { id: `${projectId}-e5`, from: `${projectId}-control-a`, to: `${projectId}-execution-a` },
      { id: `${projectId}-e6`, from: `${projectId}-control-b`, to: `${projectId}-execution-b` }
    ]
  }
}

export const mockMaps: Record<string, SystemMap> = {
  "wingine-core": createMap("wingine-core", {
    protocolA: "System Core Protocol",
    protocolB: "Build Contract",
    moduleA: "Builder Module",
    moduleB: "Runtime Adapter",
    controlA: "Decision Control",
    controlB: "Guard Policy",
    executionA: "Output Execution",
    executionB: "Observer Runtime"
  }),
  "module-expansion": createMap("module-expansion", {
    protocolA: "Registry Contract",
    protocolB: "Module Handshake",
    moduleA: "Planner Module",
    moduleB: "Capability Module",
    controlA: "Sync Controller",
    controlB: "Policy Gate",
    executionA: "Workspace Shell",
    executionB: "Execution Probe"
  }),
  "faceless-video": createMap("faceless-video", {
    protocolA: "Input Story Brief",
    protocolB: "Publish Protocol",
    moduleA: "Script Planner",
    moduleB: "Asset Packager",
    controlA: "Channel Policy",
    controlB: "Timing Review",
    executionA: "Video Output",
    executionB: "Publish Observer"
  }),
  "ai-scriptmaker": createMap("ai-scriptmaker", {
    protocolA: "Prompt Contract",
    protocolB: "Format Protocol",
    moduleA: "Outline Module",
    moduleB: "Tone Adapter",
    controlA: "Quality Control",
    controlB: "Variation Gate",
    executionA: "Draft Export",
    executionB: "Review Trace"
  }),
  "narrative-os": createMap("narrative-os", {
    protocolA: "Narrative Frame",
    protocolB: "Role Contract",
    moduleA: "Scene Builder",
    moduleB: "Arc Resolver",
    controlA: "Consistency Check",
    controlB: "Pacing Gate",
    executionA: "Story Output",
    executionB: "Narrative Probe"
  }),
  "signal-lab": createMap("signal-lab", {
    protocolA: "Signal Intake",
    protocolB: "Cluster Draft",
    moduleA: "Pattern Module",
    moduleB: "Heat Adapter",
    controlA: "Noise Filter",
    controlB: "Signal Gate",
    executionA: "Radar Output",
    executionB: "Lab Observer"
  })
}
