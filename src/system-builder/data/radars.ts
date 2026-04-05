import type { ProblemRadarMap } from "../types.js"

function createRadar(
  projectId: string,
  clusterNames: [string, string, string],
  signalTitles: [string, string, string, string, string, string]
): ProblemRadarMap {
  return {
    projectId,
    clusters: [
      { id: `${projectId}-c1`, name: clusterNames[0] },
      { id: `${projectId}-c2`, name: clusterNames[1] },
      { id: `${projectId}-c3`, name: clusterNames[2] }
    ],
    signals: [
      { id: `${projectId}-s1`, title: signalTitles[0], summary: `${signalTitles[0]} is still raw and requires clearer shaping.`, status: "raw", x: 18, y: 25, clusterId: `${projectId}-c1`, heat: 0.62, relatedModuleCandidateIds: [`${projectId}-mod-1`] },
      { id: `${projectId}-s2`, title: signalTitles[1], summary: `${signalTitles[1]} is beginning to cluster into a stable concern.`, status: "clustered", x: 24, y: 31, clusterId: `${projectId}-c1`, heat: 0.85 },
      { id: `${projectId}-s3`, title: signalTitles[2], summary: `${signalTitles[2]} is still creating noise in the field.`, status: "raw", x: 50, y: 39, clusterId: `${projectId}-c2`, heat: 0.58 },
      { id: `${projectId}-s4`, title: signalTitles[3], summary: `${signalTitles[3]} is the strongest currently selected signal.`, status: "selected", x: 58, y: 44, clusterId: `${projectId}-c2`, heat: 0.98, relatedModuleCandidateIds: [`${projectId}-mod-2`, `${projectId}-mod-3`] },
      { id: `${projectId}-s5`, title: signalTitles[4], summary: `${signalTitles[4]} is forming a late-stage problem cluster.`, status: "clustered", x: 77, y: 66, clusterId: `${projectId}-c3`, heat: 0.76 },
      { id: `${projectId}-s6`, title: signalTitles[5], summary: `${signalTitles[5]} still needs sharper downstream interpretation.`, status: "raw", x: 82, y: 73, clusterId: `${projectId}-c3`, heat: 0.6 }
    ]
  }
}

export const mockRadars: Record<string, ProblemRadarMap> = {
  "wingine-core": createRadar(
    "wingine-core",
    ["Problem Intake", "Signal Shaping", "Decision Risk"],
    ["Source ambiguity", "Input normalization gap", "Protocol surface drift", "Builder context loss", "Gate timing uncertainty", "Confidence signal noise"]
  ),
  "module-expansion": createRadar(
    "module-expansion",
    ["Registry Load", "Module Sync", "Execution Handoff"],
    ["Registry coverage", "Handshake versioning", "Capability overlap", "Module orchestration", "Shell observability", "Execution readiness"]
  ),
  "faceless-video": createRadar(
    "faceless-video",
    ["Audience Signal", "Pipeline Drift", "Publish Friction"],
    ["Topic instability", "Story hook weakness", "Scene pacing drift", "Narration mismatch", "Channel timing risk", "Asset fatigue"]
  ),
  "ai-scriptmaker": createRadar(
    "ai-scriptmaker",
    ["Prompt Load", "Format Pressure", "Output Control"],
    ["Prompt ambiguity", "Outline compression", "Tone mismatch", "Variation noise", "Formatting drift", "Review lag"]
  ),
  "narrative-os": createRadar(
    "narrative-os",
    ["Narrative Intake", "Role Tension", "Arc Stability"],
    ["Theme ambiguity", "Voice conflict", "Scene bridge weakness", "Arc alignment gap", "Pacing uncertainty", "Ending coherence risk"]
  ),
  "signal-lab": createRadar(
    "signal-lab",
    ["Signal Capture", "Cluster Draft", "Heat Review"],
    ["Weak capture rules", "Sparse signal density", "Cluster naming drift", "Heat bias", "Selection ambiguity", "Observation gap"]
  )
}
