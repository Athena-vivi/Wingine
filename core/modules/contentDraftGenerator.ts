import type { ProblemObject } from "./shared/index.ts"

export type ContentDraft = {
  title: string
  summary: string
  body: string
}

export type ContentDraftInput = {
  problem: ProblemObject
}

export function generateContentDraft(input: ContentDraftInput): ContentDraft {
  const { problem } = input
  const source = String(problem.source.system)
  const context = String(problem.metadata.custom.business_stage ?? problem.metadata.custom.type ?? "")
  const bodyParts = [
    `Problem: ${problem.normalized_problem}.`,
    `Source: ${source}.`
  ]

  if (context) {
    bodyParts.push(`Context: ${context}.`)
  }

  return {
    title: problem.title,
    summary: problem.summary,
    body: bodyParts.join(" ")
  }
}
