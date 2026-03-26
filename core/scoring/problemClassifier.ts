import type { ProblemObject } from "../modules/shared/index.ts"

export type ProblemClassifierInput = {
  problem: ProblemObject
}

function resolveProblemType(problem: ProblemObject) {
  const text = `${problem.title} ${problem.summary} ${problem.description ?? ""} ${problem.normalized_problem}`.toLowerCase()

  if (text.includes("acos") || text.includes("ad spend")) {
    return "ads"
  }

  if (text.includes("youtube") || text.includes("video")) {
    return "content"
  }

  if (text.includes("saas") || text.includes("metrics") || text.includes("churn")) {
    return "analytics"
  }

  return "general"
}

export function classifyProblem(input: ProblemClassifierInput): ProblemObject {
  const { problem } = input
  const nextType = resolveProblemType(problem)

  return {
    ...problem,
    metadata: {
      ...problem.metadata,
      custom: {
        ...problem.metadata.custom,
        type: nextType
      }
    }
  }
}
