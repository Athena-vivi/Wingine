import type { ScoringObject } from "../types/scoring.ts"

export const scoringObjects: ScoringObject[] = [
  {
    id: "problem-001",
    type: "problem",
    title: "Search term waste in Amazon PPC",
    summary: "High-spend search terms are not filtered quickly enough, causing wasted budget and slow optimization.",
    status: "candidate",
    source: "Problem Radar",
    metadata: {
      source_channel: "reddit",
      frequency: "high",
      cost: "wasted budget"
    }
  },
  {
    id: "module-001",
    type: "module",
    title: "capability_mapper",
    summary: "Translate workflow stages into reusable capabilities for Builder.",
    status: "active",
    source: "Scoring Library",
    metadata: {
      category: "core capability",
      owner: "operator"
    }
  },
  {
    id: "output-001",
    type: "output",
    title: "Negative keyword candidate tool",
    summary: "A web tool that marks high-spend, non-converting search terms for action.",
    status: "in-progress",
    source: "Builder Output",
    metadata: {
      output_type: "web-tool",
      readiness: "testing"
    }
  },
  {
    id: "workflow-001",
    type: "workflow",
    title: "PPC waste reduction workflow",
    summary: "A repeatable path that moves from search term waste detection to review, action, and output delivery.",
    status: "active",
    source: "Builder Workflow",
    metadata: {
      stages: 4,
      linked_modules: 3,
      reuse_scope: "amazon-ads"
    }
  }
]


