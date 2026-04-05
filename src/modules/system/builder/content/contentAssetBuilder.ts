import type { ContentAsset, ProblemObject } from "../../../../contracts/index.ts"

function resolveTopic(problem: ProblemObject) {
  const candidate = String(problem.normalized_problem || problem.description || problem.title).trim()
  return candidate || "General problem"
}

function resolveAudience(problem: ProblemObject) {
  const customAudience = problem.metadata.custom.audience
  if (typeof customAudience === "string" && customAudience.trim()) {
    return customAudience.trim()
  }

  return "general users"
}

function resolveAngle(problem: ProblemObject, topic: string) {
  const type = String(problem.metadata.custom.type ?? "general")
  return `This ${type} problem is worth covering because ${topic.toLowerCase()} creates a concrete decision point.`
}

function resolveCoreClaim(problem: ProblemObject, topic: string) {
  const source = String(problem.source.system ?? "unknown source")
  return `${topic} is a signal that can be turned into an actionable system decision from ${source}.`
}

export function buildContentAsset(problem: ProblemObject): ContentAsset {
  const topic = resolveTopic(problem)
  const audience = resolveAudience(problem)
  const angle = resolveAngle(problem, topic)
  const core_claim = resolveCoreClaim(problem, topic)

  return {
    topic,
    audience,
    angle,
    core_claim,
    outline: [
      "problem framing",
      "why it happens",
      "how to detect",
      "what to do"
    ]
  }
}


