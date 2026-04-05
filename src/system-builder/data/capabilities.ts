import type { Capability } from "../types.js"

export const mockCapabilities: Capability[] = [
  {
    id: "cap-problem-collect",
    name: "problem.collect",
    description: "Capture raw problem signals from lightweight intake sources.",
    location: "repo://problem/intake",
    sourceType: "internal",
    layer: "problem",
    status: "adopted"
  },
  {
    id: "cap-problem-cluster",
    name: "problem.cluster",
    description: "Group diffuse problem signals into interpretable clusters.",
    location: "opensource://signal-clustering-candidate",
    sourceType: "opensource",
    layer: "problem",
    status: "candidate"
  },
  {
    id: "cap-structure-define",
    name: "structure.define",
    description: "Define core structure candidates before build hardens them.",
    location: "repo://builder/structure",
    sourceType: "internal",
    layer: "build",
    status: "adopted"
  },
  {
    id: "cap-structure-link",
    name: "structure.link",
    description: "Link structural elements through protocol-aware relationships.",
    location: "repo://builder/linker",
    sourceType: "internal",
    layer: "build",
    status: "known"
  },
  {
    id: "cap-content-generate",
    name: "content.generate",
    description: "Generate draft content artifacts through an adapter seam.",
    location: "mcp://content-generation-draft",
    sourceType: "mcp",
    layer: "build",
    status: "candidate"
  },
  {
    id: "cap-content-publish",
    name: "content.publish",
    description: "Publish prepared outputs to downstream channels with controlled boundaries.",
    location: "repo://distribution/publish-adapter",
    sourceType: "internal",
    layer: "distribution",
    status: "known"
  },
  {
    id: "cap-content-schedule",
    name: "content.schedule",
    description: "Schedule distribution timing without collapsing execution policy into build.",
    location: "opensource://scheduler-evaluator",
    sourceType: "opensource",
    layer: "distribution",
    status: "candidate"
  },
  {
    id: "cap-content-analytics",
    name: "content.analytics",
    description: "Fetch post-distribution analytics through a contained external interface.",
    location: "api://analytics-provider",
    sourceType: "api",
    layer: "distribution",
    status: "candidate"
  },
  {
    id: "cap-problem-observe",
    name: "problem.observe",
    description: "Observe recurring issue fields without forcing early structure.",
    location: "mcp://problem-observer-draft",
    sourceType: "mcp",
    layer: "problem",
    status: "known"
  },
  {
    id: "cap-build-validate",
    name: "build.validate",
    description: "Evaluate whether build outputs still align with intended structural goals.",
    location: "repo://control/build-validator",
    sourceType: "internal",
    layer: "build",
    status: "adopted"
  }
]
