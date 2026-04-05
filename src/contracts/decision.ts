import type { ProblemObject, ScoreObject } from "../modules/capability/shared/index.ts"
import type { BettingInput } from "../modules/capability/decision/betting_module/types/betting.ts"
import type { EvaluatorRole } from "../modules/capability/decision/scoring_module/types/scoring.ts"

export type DecisionMode = "problem" | "build"

export type ProblemDecisionTarget = ProblemObject

export type BuildDecisionTarget = {
  score?: ScoreObject
  input?: BettingInput
  role?: EvaluatorRole | null
}

export type DecisionTarget = ProblemDecisionTarget | BuildDecisionTarget

export type DecisionInput<
  TTarget = DecisionTarget,
  TContext = unknown,
  TMode extends DecisionMode = DecisionMode
> = {
  target: TTarget
  context?: TContext
  mode?: TMode
}

export type DecisionResult = {
  score: number
  bet?: number
  strategy?: string
  role?: string
  confidence?: number
  metadata?: Record<string, unknown>
}
