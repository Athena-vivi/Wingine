import type { ProblemObject } from "../../shared/index.ts"
import type { Problem } from "../types/builder.ts"

function resolveFrequency(problem: ProblemObject): Problem["frequency"] {
  const value = String(problem.metadata.custom.trend_signal ?? "").toLowerCase()

  if (value === "true") {
    return "high"
  }

  return "medium"
}

export function importProblemObjectToBuilderProblem(problem: ProblemObject): Problem {
  return {
    id: problem.id,
    title: problem.title,
    description: problem.description ?? problem.summary,
    source: String(problem.source.system),
    tag: String(problem.metadata.custom.type ?? problem.metadata.custom.problem_type ?? problem.type),
    context: String(problem.metadata.custom.business_stage ?? ""),
    frequency: resolveFrequency(problem),
    cost: String(problem.metadata.custom.record_reason ?? "")
  }
}


