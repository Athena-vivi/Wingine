import type { ModuleRegistry, ProjectLayerState, ProjectStatus } from "../types.js"

function createProjectStatus(
  projectId: string,
  currentPhase: ProjectStatus["currentPhase"],
  health: ProjectStatus["health"],
  summary: string,
  currentFocus: string,
  nextStep: string,
  blockers: string[]
): ProjectStatus {
  return { projectId, currentPhase, health, summary, currentFocus, nextStep, blockers }
}

function createLayerState(
  projectId: string,
  progress: [number, number, number, number],
  statuses: ProjectLayerState["layers"][number]["status"][]
): ProjectLayerState {
  return {
    projectId,
    layers: [
      { layer: "protocol", status: statuses[0], progress: progress[0], note: "Protocol surface is the current framing anchor.", issues: progress[0] < 70 ? ["Protocol language is still shifting"] : ["Minor interpretation drift remains"] },
      { layer: "module", status: statuses[1], progress: progress[1], note: "Module decisions are shaping the shell's practical structure.", issues: progress[1] < 60 ? ["Candidate intake not yet stable"] : ["Some ownership overlap remains"] },
      { layer: "control", status: statuses[2], progress: progress[2], note: "Control layer is clarifying state, policy, and routing decisions.", issues: progress[2] < 60 ? ["Control semantics are still draft-level"] : ["Needs real-flow validation"] },
      { layer: "execution", status: statuses[3], progress: progress[3], note: "Execution remains intentionally restrained while the shell stabilizes.", issues: progress[3] < 40 ? ["Execution path still mostly reserved"] : ["Execution observability is not final"] }
    ]
  }
}

function createModuleRegistry(
  projectId: string,
  items: Array<{
    name: string
    sourceType: "opensource" | "mcp" | "api" | "internal"
    sourceName: string
    purpose: string
    targetLayer: "module" | "execution"
    integrationMode: "direct_use" | "adapter" | "decompose" | "observe_only"
    status: "backlog" | "reviewing" | "testing" | "adopted" | "rejected"
    notes?: string
  }>
): ModuleRegistry {
  return {
    projectId,
    candidates: items.map((item, index) => ({
      id: `${projectId}-mod-${index + 1}`,
      ...item
    }))
  }
}

export const mockProjectStatuses: Record<string, ProjectStatus> = {
  "wingine-core": createProjectStatus(
    "wingine-core",
    "control",
    "partial",
    "The workspace shell is stable enough to hold problem and builder spaces, while control visibility is still being shaped.",
    "Turning the shell into a clearer control container for project state and module intake.",
    "Validate the control information model before any real integration path is opened.",
    ["No real module intake flow yet", "Builder-to-problem feedback is still mock-only", "Layer health semantics need real movement validation"]
  ),
  "module-expansion": createProjectStatus(
    "module-expansion",
    "module",
    "unstable",
    "The module expansion track is testing how future modules can enter without collapsing protocol boundaries.",
    "Comparing candidate modules and narrowing viable integration modes.",
    "Choose one stable intake gate and reject the rest for now.",
    ["Module ownership boundaries are fuzzy", "Execution readiness criteria are not frozen", "Registry semantics are still draft-level"]
  ),
  "faceless-video": createProjectStatus(
    "faceless-video",
    "mapping",
    "partial",
    "The product is still translating raw content problems into a durable shell shape.",
    "Separating audience signal capture from publish execution assumptions.",
    "Lock one protocol seam for content input and publish output.",
    ["Channel strategy still drifts", "Publish pipeline is not structurally frozen"]
  ),
  "ai-scriptmaker": createProjectStatus(
    "ai-scriptmaker",
    "module",
    "clear",
    "The shell is mature enough to compare script-related module candidates in a controlled way.",
    "Evaluating formatter and tone-control candidates for module intake.",
    "Pick one adapter path and move it into controlled testing.",
    ["Review workload is still manual"]
  ),
  "narrative-os": createProjectStatus(
    "narrative-os",
    "protocol",
    "partial",
    "The project is strong conceptually but still tightening its protocol language.",
    "Reducing narrative role ambiguity before structure expands.",
    "Stabilize framing contracts and only then push module growth.",
    ["Narrative roles are not sharply separated", "Arc semantics still drift"]
  ),
  "signal-lab": createProjectStatus(
    "signal-lab",
    "mapping",
    "blocked",
    "The idea is interesting, but the shell is still too early to decide what belongs in structure.",
    "Testing whether the signal field deserves a fuller system path.",
    "Move from loose exploration into explicit mapping constraints.",
    ["Problem boundaries are still vague", "No stable product direction yet"]
  )
}

export const mockProjectLayerStates: Record<string, ProjectLayerState> = {
  "wingine-core": createLayerState("wingine-core", [84, 42, 68, 36], ["stable", "draft", "active", "draft"]),
  "module-expansion": createLayerState("module-expansion", [66, 71, 45, 18], ["active", "active", "draft", "empty"]),
  "faceless-video": createLayerState("faceless-video", [58, 36, 41, 24], ["draft", "draft", "draft", "empty"]),
  "ai-scriptmaker": createLayerState("ai-scriptmaker", [74, 69, 61, 44], ["active", "active", "active", "draft"]),
  "narrative-os": createLayerState("narrative-os", [63, 38, 33, 20], ["active", "draft", "draft", "empty"]),
  "signal-lab": createLayerState("signal-lab", [32, 22, 16, 8], ["draft", "empty", "empty", "empty"])
}

export const mockModuleRegistries: Record<string, ModuleRegistry> = {
  "wingine-core": createModuleRegistry("wingine-core", [
    { name: "AiToEarn Publish Adapter", sourceType: "internal", sourceName: "Wingine Internal Draft", purpose: "Controlled publishing adapter candidate for future execution output.", targetLayer: "execution", integrationMode: "adapter", status: "reviewing", notes: "Good fit for shell testing, but execution boundaries should stay isolated." },
    { name: "MCP Content Connector", sourceType: "mcp", sourceName: "Generic MCP Draft", purpose: "Future MCP-backed content generation connector candidate.", targetLayer: "module", integrationMode: "observe_only", status: "backlog" },
    { name: "Open Source Scheduler", sourceType: "opensource", sourceName: "Scheduler OSS Candidate", purpose: "Evaluate whether scheduling should be adapted in or decomposed.", targetLayer: "module", integrationMode: "decompose", status: "testing" },
    { name: "Node Map Renderer", sourceType: "internal", sourceName: "Workspace UI Toolkit", purpose: "Support internal builder map rendering as reusable shell capability.", targetLayer: "module", integrationMode: "direct_use", status: "adopted" },
    { name: "Analytics Fetch Adapter", sourceType: "api", sourceName: "External Analytics API", purpose: "Potential future analytics fetch path for feedback enrichment.", targetLayer: "execution", integrationMode: "adapter", status: "rejected" }
  ]),
  "module-expansion": createModuleRegistry("module-expansion", [
    { name: "Registry Capability Loader", sourceType: "internal", sourceName: "Registry Prototype", purpose: "Give module candidates a controlled internal entry point.", targetLayer: "module", integrationMode: "direct_use", status: "reviewing" },
    { name: "MCP Tool Envelope Adapter", sourceType: "mcp", sourceName: "MCP Envelope Candidate", purpose: "Observe how MCP tools might fit module envelopes later on.", targetLayer: "module", integrationMode: "observe_only", status: "backlog" },
    { name: "Workflow Queue OSS", sourceType: "opensource", sourceName: "Queue Engine Candidate", purpose: "Assess queue orchestration support for future execution modules.", targetLayer: "execution", integrationMode: "adapter", status: "testing" },
    { name: "Remote Metrics Adapter", sourceType: "api", sourceName: "Metrics Partner API", purpose: "Potential observability add-on for execution readiness signals.", targetLayer: "execution", integrationMode: "adapter", status: "reviewing" },
    { name: "Capability Merge Analyzer", sourceType: "internal", sourceName: "Module Expansion Draft", purpose: "Track overlap between incoming module candidates.", targetLayer: "module", integrationMode: "decompose", status: "backlog" }
  ]),
  "faceless-video": createModuleRegistry("faceless-video", [
    { name: "Scene Cutter Candidate", sourceType: "opensource", sourceName: "Video Scene OSS", purpose: "Potential helper for segmenting short-form scenes.", targetLayer: "module", integrationMode: "adapter", status: "reviewing" },
    { name: "Voiceover MCP Connector", sourceType: "mcp", sourceName: "Narration MCP Draft", purpose: "Observe a future voiceover connector path.", targetLayer: "execution", integrationMode: "observe_only", status: "backlog" },
    { name: "Thumbnail API Adapter", sourceType: "api", sourceName: "Creative Asset API", purpose: "Potential future thumbnail fetch and generation seam.", targetLayer: "execution", integrationMode: "adapter", status: "testing" },
    { name: "Publish Tracker", sourceType: "internal", sourceName: "Content Ops Draft", purpose: "Internal publish-trace candidate for post-output observation.", targetLayer: "execution", integrationMode: "direct_use", status: "reviewing" },
    { name: "Timing Rules Pack", sourceType: "internal", sourceName: "Faceless Ruleset", purpose: "Codify channel timing assumptions into a reusable shell module.", targetLayer: "module", integrationMode: "decompose", status: "backlog" }
  ]),
  "ai-scriptmaker": createModuleRegistry("ai-scriptmaker", [
    { name: "Outline Scaffolder", sourceType: "internal", sourceName: "Script Draft Core", purpose: "Reusable outline generation module for first-pass script structure.", targetLayer: "module", integrationMode: "direct_use", status: "adopted" },
    { name: "Tone MCP Adapter", sourceType: "mcp", sourceName: "Style MCP Candidate", purpose: "Future tone-control adapter for style shaping.", targetLayer: "module", integrationMode: "adapter", status: "reviewing" },
    { name: "Formatter OSS", sourceType: "opensource", sourceName: "Script Formatter OSS", purpose: "Compare existing formatter logic against internal formatting needs.", targetLayer: "module", integrationMode: "decompose", status: "testing" },
    { name: "Review Metrics API", sourceType: "api", sourceName: "Readability API", purpose: "Potential external readability check path.", targetLayer: "execution", integrationMode: "adapter", status: "backlog" },
    { name: "Draft Trace Recorder", sourceType: "internal", sourceName: "Review Layer Draft", purpose: "Preserve review trace inside the shell.", targetLayer: "execution", integrationMode: "direct_use", status: "reviewing" }
  ]),
  "narrative-os": createModuleRegistry("narrative-os", [
    { name: "Arc Consistency Draft", sourceType: "internal", sourceName: "Narrative Core Draft", purpose: "Check whether story arcs remain aligned across scene transitions.", targetLayer: "module", integrationMode: "direct_use", status: "reviewing" },
    { name: "Voice Role Adapter", sourceType: "opensource", sourceName: "Dialogue OSS Candidate", purpose: "Potential adapter for role voice differentiation.", targetLayer: "module", integrationMode: "adapter", status: "backlog" },
    { name: "Narrative MCP Envelope", sourceType: "mcp", sourceName: "Role MCP Draft", purpose: "Observe possible multi-role narrative interaction later on.", targetLayer: "module", integrationMode: "observe_only", status: "backlog" },
    { name: "Story Metrics API", sourceType: "api", sourceName: "Narrative Analytics API", purpose: "Potential future support for story pacing signals.", targetLayer: "execution", integrationMode: "adapter", status: "rejected" },
    { name: "Scene Bridge Tester", sourceType: "internal", sourceName: "Narrative Validation Draft", purpose: "Probe weak transitions between scenes.", targetLayer: "execution", integrationMode: "direct_use", status: "testing" }
  ]),
  "signal-lab": createModuleRegistry("signal-lab", [
    { name: "Cluster Tagger", sourceType: "internal", sourceName: "Signal Draft Kit", purpose: "Experimentally label loose signal groups.", targetLayer: "module", integrationMode: "direct_use", status: "reviewing" },
    { name: "Pattern Scan OSS", sourceType: "opensource", sourceName: "Pattern Miner Candidate", purpose: "Observe whether external pattern mining logic helps signal shaping.", targetLayer: "module", integrationMode: "observe_only", status: "backlog" },
    { name: "Field Metrics API", sourceType: "api", sourceName: "Telemetry API Candidate", purpose: "Potential signal density scoring input.", targetLayer: "execution", integrationMode: "adapter", status: "backlog" },
    { name: "Probe Envelope MCP", sourceType: "mcp", sourceName: "Signal MCP Candidate", purpose: "Track a future MCP-based observation seam.", targetLayer: "execution", integrationMode: "observe_only", status: "backlog" },
    { name: "Heat Review Notes", sourceType: "internal", sourceName: "Lab Notes Draft", purpose: "Retain lightweight observation notes in the shell.", targetLayer: "module", integrationMode: "decompose", status: "testing" }
  ])
}
