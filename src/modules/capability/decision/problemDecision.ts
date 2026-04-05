import { resolveProblemDecision } from "./betting/problemDecisionResolver.ts"
import { evaluateProblem } from "./scoring/problemEvaluator.ts"
import { classifyProblem } from "./scoring/problemClassifier.ts"
import type { BetObject, ProblemObject, ScoreObject } from "../shared/index.ts"
import type { DecisionResult, ProblemDecisionTarget } from "../../../contracts/decision.ts"

export function decideProblem(problem: ProblemDecisionTarget): DecisionResult {
  const classifiedProblem = classifyProblem({ problem })
  const score = evaluateProblem({ problem: classifiedProblem })
  const bet = resolveProblemDecision({ score })
  const decision = String(bet.metadata.custom.decision ?? bet.resource_allocation.action) as "invest" | "skip" | "hold"

  return {
    score: score.weighted_score,
    strategy: String(bet.reason ?? "decision generated"),
    confidence: score.confidence,
    metadata: {
      problem: classifiedProblem,
      score_object: score,
      bet_object: bet,
      decision
    }
  }
}

