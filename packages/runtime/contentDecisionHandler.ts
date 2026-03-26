import {
  createActivityLogStore,
  createModuleRegistry,
  createProtocolDispatcher
} from "./index.ts"
import { classifyProblem, type ProblemClassifierInput } from "./problemClassifier.ts"
import { evaluateProblem, type ProblemEvaluatorInput } from "./problemEvaluator.ts"
import { resolveProblemDecision, type ProblemDecisionInput } from "./problemDecisionResolver.ts"
import { runContentExecutor } from "./contentExecutor.ts"
import type { ExecutionRequest } from "./executionProtocol.ts"
import { exportProblemObjectFromRadarRecord } from "../../apps/radar/adapters/problemExportAdapter.ts"
import { runProblemAnalysis } from "../../apps/radar/capabilities/problemAnalysisEngine.ts"
import { buildRadarRecord } from "../../apps/radar/capabilities/radarRecordBuilder.ts"
import { resolveSourceInput } from "../../apps/radar/capabilities/sourceInputResolver.ts"
import { resolveSourceMaterial } from "../../apps/radar/capabilities/sourceMaterialNormalizer.ts"
import type { BetObject, ProblemObject, ScoreObject } from "../shared/index.ts"

type ContentDecisionInput = {
  source_url: string
}

type SourceNormalizerInput = {
  sourceMode: "reddit" | "manual"
  normalizedInput: {
    redditUrl?: string
    postText?: string
    comments?: string
    notes?: string
  }
}

type ProblemExtractorInput = {
  source: {
    url: string
    title: string
    selftext: string
    subreddit: string
    score: number
    comments: Array<{
      author: string
      score: number
      body: string
    }>
  }
  notes: string
}

type ProblemStructurerInput = Parameters<typeof exportProblemObjectFromRadarRecord>[0]
type DispatchResponse = Awaited<ReturnType<ReturnType<typeof createProtocolDispatcher>["dispatch"]>>

export type ContentDecisionResult =
  | {
      decision: "skip"
      reason: string
      confidence: number
      problem_summary: string
    }
  | {
      decision: "invest"
      reason: string
      confidence: number
      problem_summary: string
      content_draft: {
        title: string
        summary: string
        body: string
      }
    }

function buildSeedText(sourceUrl: string) {
  const lower = sourceUrl.toLowerCase()

  if (lower.includes("acos") || lower.includes("ad-spend") || lower.includes("ad_spend")) {
    return "Amazon seller has high ACoS and wasted ad spend"
  }

  if (lower.includes("youtube") || lower.includes("video")) {
    return "User wants to generate faceless YouTube videos at scale"
  }

  if (lower.includes("saas") || lower.includes("metrics") || lower.includes("churn")) {
    return "User needs to analyze SaaS metrics and detect churn risk"
  }

  return ""
}

function adaptResolverInput(input: ContentDecisionInput) {
  return {
    redditUrl: input.source_url,
    postText: buildSeedText(input.source_url),
    comments: "",
    notes: "content_decision_handler"
  }
}

function createRuntimeForContentDecision() {
  const registry = createModuleRegistry()
  const activityLogStore = createActivityLogStore()
  const dispatcher = createProtocolDispatcher({
    registry,
    activityLogStore
  })

  registry.register({
    module: {
      module_id: "problem_radar.source_input_resolver",
      system: "problem_radar",
      actions: ["resolve"],
      input_contract: "content_decision_input",
      output_contract: "normalized_source_input",
      module_version: "0.1.0",
      status: "active"
    },
    execution: {
      mode: "local",
      target: "apps/radar/capabilities/sourceInputResolver.resolveSourceInput",
      handler: (input) => resolveSourceInput(adaptResolverInput(input as ContentDecisionInput))
    }
  })

  registry.register({
    module: {
      module_id: "problem_radar.source_normalizer",
      system: "problem_radar",
      actions: ["normalize"],
      input_contract: "normalized_source_input",
      output_contract: "normalized_source_material",
      module_version: "0.1.0",
      status: "active"
    },
    execution: {
      mode: "local",
      target: "apps/radar/capabilities/sourceMaterialNormalizer.resolveSourceMaterial",
      handler: (input) => resolveSourceMaterial(input as SourceNormalizerInput)
    }
  })

  registry.register({
    module: {
      module_id: "problem_radar.problem_extractor",
      system: "problem_radar",
      actions: ["extract"],
      input_contract: "source_analysis_input",
      output_contract: "problem_analysis_result",
      module_version: "0.1.0",
      status: "active"
    },
    execution: {
      mode: "local",
      target: "apps/radar/capabilities/problemAnalysisEngine.runProblemAnalysis",
      handler: runProblemAnalysis
    }
  })

  registry.register({
    module: {
      module_id: "problem_radar.problem_structurer",
      system: "problem_radar",
      actions: ["structure"],
      input_contract: "radar_record",
      output_contract: "problem_object",
      module_version: "0.1.0",
      status: "active"
    },
    execution: {
      mode: "local",
      target: "apps/radar/adapters/problemExportAdapter.exportProblemObjectFromRadarRecord",
      handler: (input) => exportProblemObjectFromRadarRecord(input as ProblemStructurerInput)
    }
  })

  registry.register({
    module: {
      module_id: "scoring.problem_classifier",
      system: "scoring",
      actions: ["classify"],
      input_contract: "problem_object",
      output_contract: "classified_problem_object",
      module_version: "0.1.0",
      status: "active"
    },
    execution: {
      mode: "local",
      target: "packages/runtime/problemClassifier.classifyProblem",
      handler: (input) => classifyProblem(input as ProblemClassifierInput)
    }
  })

  registry.register({
    module: {
      module_id: "scoring.problem_evaluator",
      system: "scoring",
      actions: ["evaluate"],
      input_contract: "problem_object",
      output_contract: "score_object",
      module_version: "0.1.0",
      status: "active"
    },
    execution: {
      mode: "local",
      target: "packages/runtime/problemEvaluator.evaluateProblem",
      handler: (input) => evaluateProblem(input as ProblemEvaluatorInput)
    }
  })

  registry.register({
    module: {
      module_id: "betting.problem_decision_resolver",
      system: "betting",
      actions: ["resolve"],
      input_contract: "score_object",
      output_contract: "bet_object",
      module_version: "0.1.0",
      status: "active"
    },
    execution: {
      mode: "local",
      target: "packages/runtime/problemDecisionResolver.resolveProblemDecision",
      handler: (input) => resolveProblemDecision(input as ProblemDecisionInput)
    }
  })

  return {
    dispatcher,
    activityLogStore
  }
}

function resolveDecision(bet: BetObject) {
  return String(bet.metadata.custom.decision ?? bet.resource_allocation.action)
}

function buildReason(bet: BetObject) {
  return String(bet.reason ?? "decision generated")
}

function buildContentExecutionRequest(problem: ProblemObject, bet: BetObject): ExecutionRequest {
  return {
    execution_type: "content",
    payload: {
      title: problem.title,
      summary: problem.summary,
      body: `Problem: ${problem.normalized_problem}. Source: ${problem.source.system}. Context: ${String(
        problem.metadata.custom.type ?? "general"
      )}.`
    },
    source_problem_id: problem.id,
    decision_ref: bet.id
  }
}

export async function runContentDecision(input: ContentDecisionInput): Promise<{
  input: ContentDecisionInput
  response: ContentDecisionResult
}> {
  const { dispatcher } = createRuntimeForContentDecision()

  const resolverResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `content-decision-resolver-${input.source_url}`,
    module: "problem_radar.source_input_resolver",
    action: "resolve",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "content-decision-handler"
    },
    input,
    meta: {
      timestamp: new Date().toISOString()
    }
  })

  const normalizerResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `content-decision-normalizer-${input.source_url}`,
    module: "problem_radar.source_normalizer",
    action: "normalize",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "content-decision-handler"
    },
    input: resolverResponse.output as SourceNormalizerInput,
    meta: {
      timestamp: new Date().toISOString()
    }
  })

  const extractorResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `content-decision-extractor-${input.source_url}`,
    module: "problem_radar.problem_extractor",
    action: "extract",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "content-decision-handler"
    },
    input: {
      source: (normalizerResponse.output as { source: ProblemExtractorInput["source"] }).source,
      notes: (
        (resolverResponse.output as SourceNormalizerInput).normalizedInput.notes ?? ""
      )
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  })

  const radarRecord = buildRadarRecord({
    source: (normalizerResponse.output as { source: Parameters<typeof buildRadarRecord>[0]["source"] }).source,
    analysis: {
      reason: (extractorResponse.output as { analysis: { reason: string } }).analysis.reason,
      recordWorthy: (extractorResponse.output as { analysis: { recordWorthy: boolean } }).analysis.recordWorthy
    },
    businessStage: (
      extractorResponse.output as { fallback: { businessStage: string } }
    ).fallback.businessStage,
    signals: (
      extractorResponse.output as {
        fallback: {
          marketSignals: {
            toolSignal: boolean
            serviceSignal: boolean
            trendSignal: boolean
            emotionSignal: string
          }
        }
      }
    ).fallback.marketSignals,
    insightDraft: "Content decision handler radar record."
  })

  const problemResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `content-decision-structurer-${input.source_url}`,
    module: "problem_radar.problem_structurer",
    action: "structure",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "content-decision-handler"
    },
    input: radarRecord,
    meta: {
      timestamp: new Date().toISOString()
    }
  })

  const classifierResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `content-decision-classifier-${input.source_url}`,
    module: "scoring.problem_classifier",
    action: "classify",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "content-decision-handler"
    },
    input: {
      problem: problemResponse.output as ProblemObject
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  })

  const problemScoreResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `content-decision-score-${input.source_url}`,
    module: "scoring.problem_evaluator",
    action: "evaluate",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "content-decision-handler"
    },
    input: {
      problem: classifierResponse.output as ProblemObject
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  })

  const decisionResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `content-decision-bet-${input.source_url}`,
    module: "betting.problem_decision_resolver",
    action: "resolve",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "content-decision-handler"
    },
    input: {
      score: problemScoreResponse.output as ScoreObject
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  })

  const problemObject = classifierResponse.output as ProblemObject
  const scoreObject = problemScoreResponse.output as ScoreObject
  const betObject = decisionResponse.output as BetObject
  const decision = resolveDecision(betObject)
  const reason = buildReason(betObject)
  const confidence = scoreObject.confidence
  const problemSummary = problemObject.summary

  if (decision !== "invest") {
    return {
      input,
      response: {
        decision: "skip",
        reason,
        confidence,
        problem_summary: problemSummary
      }
    }
  }

  const executionResult = runContentExecutor(buildContentExecutionRequest(problemObject, betObject))
  const draft = executionResult.output.draft as {
    title: string
    summary: string
    body: string
  }

  return {
    input,
    response: {
      decision: "invest",
      reason,
      confidence,
      problem_summary: problemSummary,
      content_draft: draft
    }
  }
}
