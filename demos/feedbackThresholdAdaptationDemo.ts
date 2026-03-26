import {
  createActivityLogStore,
  createModuleRegistry,
  createProtocolDispatcher
} from "../core/runtime/index.ts"
import { classifyProblem, type ProblemClassifierInput } from "../core/scoring/problemClassifier.ts"
import { evaluateProblem, type ProblemEvaluatorInput } from "../core/scoring/problemEvaluator.ts"
import { resolveProblemDecision, type ProblemDecisionInput } from "../core/betting/problemDecisionResolver.ts"
import { buildModuleIOContracts } from "../core/modules/ioContractBuilder.ts"
import { buildSystemSpec } from "../core/modules/systemSpecBuilder.ts"
import { planStructuralModules } from "../core/modules/structuralModulePlanner.ts"
import { evaluateSystemSpec, type SystemEvaluatorInput } from "../core/scoring/systemEvaluator.ts"
import { resolveBetDecision, type DecisionInput } from "../core/betting/bettingDecisionResolver.ts"
import {
  recordDecisionFeedback,
  type DecisionFeedbackInput,
  type DecisionFeedbackRecord
} from "../core/feedback/decisionFeedbackRecorder.ts"
import { adaptThreshold, type ThresholdAdapterInput, type ThresholdAdapterOutput } from "../core/betting/thresholdAdapter.ts"
import { buildBuilderWorkspaceRecord } from "../core/modules/builder/capabilities/builderRecordManager.ts"
import { resolveUITemplate } from "../core/modules/builder/capabilities/uiTemplateManager.ts"
import { importProblemObjectToBuilderProblem } from "../core/modules/builder/adapters/problemImportAdapter.ts"
import { defaultTemplate } from "../core/modules/builder/data/defaultTemplate.ts"
import { exportProblemObjectFromRadarRecord } from "../core/modules/radar/adapters/problemExportAdapter.ts"
import { runProblemAnalysis } from "../core/modules/radar/capabilities/problemAnalysisEngine.ts"
import { buildRadarRecord } from "../core/modules/radar/capabilities/radarRecordBuilder.ts"
import { resolveSourceInput } from "../core/modules/radar/capabilities/sourceInputResolver.ts"
import { resolveSourceMaterial } from "../core/modules/radar/capabilities/sourceMaterialNormalizer.ts"
import type { BetObject, FlowRequest, ProblemObject, ScoreObject } from "../core/modules/shared/index.ts"
import type { Problem } from "../core/modules/builder/types/builder.ts"

type RadarCaptureRequest = {
  source: {
    provider: string
    url?: string
  }
  raw_text?: string
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
type BuilderIntakeInput = FlowRequest<ProblemObject>
type BuilderGoalInput = Problem
type BuilderGoalOutput = {
  name: string
  outcome: string
  problem_type?: string
  builder_record: ReturnType<typeof buildBuilderWorkspaceRecord>
}
type StructuralModuleList = {
  modules: string[]
}
type ModuleIOContractList = {
  contracts: Array<{
    from: string
    to: string
  }>
}
type SystemSpec = {
  type: "system_spec"
  modules: string[]
  flows: Array<{
    from: string
    to: string
  }>
}
type DispatchResponse = Awaited<ReturnType<ReturnType<typeof createProtocolDispatcher>["dispatch"]>>

type ProblemRoundResult = {
  round: number
  type: string
  threshold: {
    high: number
    low: number
  }
  decision: string
  adjusted: boolean
  adjustment_reason: string
}

type ThresholdTrack = {
  type: string
  trajectory: ProblemRoundResult[]
}

type AdaptationDemoResult = {
  threshold_tracks: ThresholdTrack[]
  final_decisions: Array<{
    type: string
    final_decision: string
  }>
}

function adaptCaptureRequest(input: RadarCaptureRequest) {
  return {
    redditUrl: input.source.url ?? "",
    postText: input.raw_text ?? "",
    comments: "",
    notes: `source_provider:${input.source.provider}`
  }
}

function resolveSystemGoal(problem: Problem) {
  const template = resolveUITemplate({
    templateId: defaultTemplate.id,
    templates: [defaultTemplate]
  }).template

  const builderRecord = buildBuilderWorkspaceRecord({
    problemId: problem.id,
    problems: [problem],
    workflows: [],
    capabilitySets: [],
    outputs: [],
    template
  })

  return {
    name: builderRecord.problem.title,
    outcome: builderRecord.template.description,
    problem_type: builderRecord.problem.tag,
    builder_record: builderRecord
  }
}

function createRuntimeForAdaptation() {
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
      input_contract: "radar_capture_request",
      output_contract: "normalized_source_input",
      module_version: "0.1.0",
      status: "active"
    },
    execution: {
      mode: "local",
      target: "core/modules/radar/capabilities/sourceInputResolver.resolveSourceInput",
      handler: (input) => resolveSourceInput(adaptCaptureRequest(input as RadarCaptureRequest))
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
      target: "core/modules/radar/capabilities/sourceMaterialNormalizer.resolveSourceMaterial",
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
      target: "core/modules/radar/capabilities/problemAnalysisEngine.runProblemAnalysis",
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
      target: "core/modules/radar/adapters/problemExportAdapter.exportProblemObjectFromRadarRecord",
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
      target: "core/scoring/problemClassifier.ts.classifyProblem",
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
      target: "core/scoring/problemEvaluator.ts.evaluateProblem",
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
      target: "core/betting/problemDecisionResolver.ts.resolveProblemDecision",
      handler: (input) => resolveProblemDecision(input as ProblemDecisionInput)
    }
  })

  registry.register({
    module: {
      module_id: "builder.problem_spec_loader",
      system: "builder",
      actions: ["load"],
      input_contract: "radar_to_builder_transport",
      output_contract: "builder_problem_context",
      module_version: "0.1.0",
      status: "active"
    },
    execution: {
      mode: "local",
      target: "core/modules/builder/adapters/problemImportAdapter.importProblemObjectToBuilderProblem",
      handler: (input) => importProblemObjectToBuilderProblem((input as BuilderIntakeInput).object)
    }
  })

  registry.register({
    module: {
      module_id: "builder.system_goal_resolver",
      system: "builder",
      actions: ["resolve"],
      input_contract: "builder_problem_context",
      output_contract: "system_goal",
      module_version: "0.1.0",
      status: "active"
    },
    execution: {
      mode: "local",
      target: "core/modules/builder/capabilities/builderRecordManager.buildBuilderWorkspaceRecord",
      handler: (input) => resolveSystemGoal(input as BuilderGoalInput)
    }
  })

  registry.register({
    module: {
      module_id: "builder.structural_module_planner",
      system: "builder",
      actions: ["plan"],
      input_contract: "system_goal",
      output_contract: "structural_module_list",
      module_version: "0.1.0",
      status: "active"
    },
    execution: {
      mode: "local",
      target: "core/modules/structuralModulePlanner.ts.planStructuralModules",
      handler: (input) => planStructuralModules(input as BuilderGoalOutput)
    }
  })

  registry.register({
    module: {
      module_id: "builder.io_contract_builder",
      system: "builder",
      actions: ["build"],
      input_contract: "structural_module_list",
      output_contract: "module_io_contract_list",
      module_version: "0.1.0",
      status: "active"
    },
    execution: {
      mode: "local",
      target: "core/modules/ioContractBuilder.ts.buildModuleIOContracts",
      handler: (input) => buildModuleIOContracts(input as StructuralModuleList)
    }
  })

  registry.register({
    module: {
      module_id: "builder.system_spec_builder",
      system: "builder",
      actions: ["build"],
      input_contract: "system_spec_builder_input",
      output_contract: "system_spec",
      module_version: "0.1.0",
      status: "active"
    },
    execution: {
      mode: "local",
      target: "core/modules/systemSpecBuilder.ts.buildSystemSpec",
      handler: (input) =>
        buildSystemSpec(
          input as {
            modules: string[]
            contracts: Array<{ from: string; to: string }>
          }
        )
    }
  })

  registry.register({
    module: {
      module_id: "scoring.system_evaluator",
      system: "scoring",
      actions: ["evaluate"],
      input_contract: "system_spec",
      output_contract: "score_object",
      module_version: "0.1.0",
      status: "active"
    },
    execution: {
      mode: "local",
      target: "core/scoring/systemEvaluator.ts.evaluateSystemSpec",
      handler: (input) => evaluateSystemSpec(input as SystemEvaluatorInput)
    }
  })

  registry.register({
    module: {
      module_id: "scoring.threshold_adapter",
      system: "scoring",
      actions: ["adapt"],
      input_contract: "decision_feedback_records",
      output_contract: "adapted_threshold",
      module_version: "0.1.0",
      status: "active"
    },
    execution: {
      mode: "local",
      target: "core/betting/thresholdAdapter.ts.adaptThreshold",
      handler: (input) => adaptThreshold(input as ThresholdAdapterInput)
    }
  })

  registry.register({
    module: {
      module_id: "betting.decision_resolver",
      system: "betting",
      actions: ["resolve"],
      input_contract: "score_object",
      output_contract: "bet_object",
      module_version: "0.1.0",
      status: "active"
    },
    execution: {
      mode: "local",
      target: "core/betting/bettingDecisionResolver.ts.resolveBetDecision",
      handler: (input) => resolveBetDecision(input as DecisionInput)
    }
  })

  registry.register({
    module: {
      module_id: "betting.decision_feedback_recorder",
      system: "betting",
      actions: ["record"],
      input_contract: "bet_object",
      output_contract: "decision_feedback_record",
      module_version: "0.1.0",
      status: "active"
    },
    execution: {
      mode: "local",
      target: "core/feedback/decisionFeedbackRecorder.ts.recordDecisionFeedback",
      handler: (input) => recordDecisionFeedback(input as DecisionFeedbackInput)
    }
  })

  return { dispatcher }
}

async function runSingleRound(
  dispatcher: ReturnType<typeof createProtocolDispatcher>,
  problemText: string,
  history: DecisionFeedbackRecord[],
  currentRound: number,
  currentThreshold: { high: number; low: number },
  lastAdjustRound: number | null
): Promise<ProblemRoundResult> {
  const resolverResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `adapt-resolver-${problemText}-${history.length}`,
    module: "problem_radar.source_input_resolver",
    action: "resolve",
    caller: { system: "runtime_demo", role: "runtime", id: "threshold-adaptation-demo" },
    input: { source: { provider: "manual" }, raw_text: problemText },
    meta: { timestamp: new Date().toISOString() }
  })

  const normalizerResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `adapt-normalizer-${problemText}-${history.length}`,
    module: "problem_radar.source_normalizer",
    action: "normalize",
    caller: { system: "runtime_demo", role: "runtime", id: "threshold-adaptation-demo" },
    input: {
      sourceMode: (resolverResponse.output as SourceNormalizerInput).sourceMode,
      normalizedInput: (resolverResponse.output as SourceNormalizerInput).normalizedInput
    },
    meta: { timestamp: new Date().toISOString() }
  })

  const extractorResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `adapt-extractor-${problemText}-${history.length}`,
    module: "problem_radar.problem_extractor",
    action: "extract",
    caller: { system: "runtime_demo", role: "runtime", id: "threshold-adaptation-demo" },
    input: {
      source: (normalizerResponse.output as { source: ProblemExtractorInput["source"] }).source,
      notes: ((resolverResponse.output as SourceNormalizerInput).normalizedInput.notes ?? "")
    },
    meta: { timestamp: new Date().toISOString() }
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
    insightDraft: "Adaptive threshold validation record."
  })

  const problemResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `adapt-problem-${problemText}-${history.length}`,
    module: "problem_radar.problem_structurer",
    action: "structure",
    caller: { system: "runtime_demo", role: "runtime", id: "threshold-adaptation-demo" },
    input: radarRecord,
    meta: { timestamp: new Date().toISOString() }
  })

  const classifierResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `adapt-classifier-${problemText}-${history.length}`,
    module: "scoring.problem_classifier",
    action: "classify",
    caller: { system: "runtime_demo", role: "runtime", id: "threshold-adaptation-demo" },
    input: { problem: problemResponse.output as ProblemObject },
    meta: { timestamp: new Date().toISOString() }
  })

  const problemScoreResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `adapt-problem-score-${problemText}-${history.length}`,
    module: "scoring.problem_evaluator",
    action: "evaluate",
    caller: { system: "runtime_demo", role: "runtime", id: "threshold-adaptation-demo" },
    input: { problem: classifierResponse.output as ProblemObject },
    meta: { timestamp: new Date().toISOString() }
  })

  const problemDecisionResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `adapt-problem-decision-${problemText}-${history.length}`,
    module: "betting.problem_decision_resolver",
    action: "resolve",
    caller: { system: "runtime_demo", role: "runtime", id: "threshold-adaptation-demo" },
    input: { score: problemScoreResponse.output as ScoreObject },
    meta: { timestamp: new Date().toISOString() }
  })

  const problemDecision = String(
    (
      problemDecisionResponse.output as {
        metadata: { custom: { decision?: string } }
      }
    ).metadata.custom.decision ??
      (
        problemDecisionResponse.output as {
          resource_allocation: { action: string }
        }
      ).resource_allocation.action
  )

  if (problemDecision !== "invest") {
    throw new Error("problem gate blocked builder during threshold adaptation validation")
  }

  const problemTransport: BuilderIntakeInput = {
    contract_name: "radar_to_builder",
    producer: "radar",
    consumer: "builder",
    object: classifierResponse.output as ProblemObject,
    context: {
      request_id: `adapt-builder-${problemText}-${history.length}`,
      trigger: "problem_gate_pass",
      sent_at: new Date().toISOString()
    }
  }

  const builderProblemResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `adapt-builder-problem-${problemText}-${history.length}`,
    module: "builder.problem_spec_loader",
    action: "load",
    caller: { system: "runtime_demo", role: "runtime", id: "threshold-adaptation-demo" },
    input: problemTransport,
    meta: { timestamp: new Date().toISOString() }
  })

  const goalResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `adapt-goal-${problemText}-${history.length}`,
    module: "builder.system_goal_resolver",
    action: "resolve",
    caller: { system: "runtime_demo", role: "runtime", id: "threshold-adaptation-demo" },
    input: builderProblemResponse.output as BuilderGoalInput,
    meta: { timestamp: new Date().toISOString() }
  })

  const structuralResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `adapt-structural-${problemText}-${history.length}`,
    module: "builder.structural_module_planner",
    action: "plan",
    caller: { system: "runtime_demo", role: "runtime", id: "threshold-adaptation-demo" },
    input: goalResponse.output as BuilderGoalOutput,
    meta: { timestamp: new Date().toISOString() }
  })

  const contractsResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `adapt-contracts-${problemText}-${history.length}`,
    module: "builder.io_contract_builder",
    action: "build",
    caller: { system: "runtime_demo", role: "runtime", id: "threshold-adaptation-demo" },
    input: structuralResponse.output as StructuralModuleList,
    meta: { timestamp: new Date().toISOString() }
  })

  const systemSpecResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `adapt-spec-${problemText}-${history.length}`,
    module: "builder.system_spec_builder",
    action: "build",
    caller: { system: "runtime_demo", role: "runtime", id: "threshold-adaptation-demo" },
    input: {
      modules: (structuralResponse.output as StructuralModuleList).modules,
      contracts: (contractsResponse.output as ModuleIOContractList).contracts
    },
    meta: { timestamp: new Date().toISOString() }
  })

  const systemScoreResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `adapt-system-score-${problemText}-${history.length}`,
    module: "scoring.system_evaluator",
    action: "evaluate",
    caller: { system: "runtime_demo", role: "runtime", id: "threshold-adaptation-demo" },
    input: { spec: systemSpecResponse.output as SystemSpec },
    meta: { timestamp: new Date().toISOString() }
  })

  const scoreObject = systemScoreResponse.output as ScoreObject
  const type = String(scoreObject.metadata.custom.structural_signal ?? "general")

  const thresholdResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `adapt-threshold-${problemText}-${currentRound}`,
    module: "scoring.threshold_adapter",
    action: "adapt",
    caller: { system: "runtime_demo", role: "runtime", id: "threshold-adaptation-demo" },
    input: {
      type,
      base_high_threshold: currentThreshold.high,
      base_low_threshold: currentThreshold.low,
      feedback_records: history,
      current_round: currentRound,
      last_adjust_round: lastAdjustRound,
      confirmation_count: 3,
      cooldown_rounds: 2
    },
    meta: { timestamp: new Date().toISOString() }
  })

  const adapted = thresholdResponse.output as ThresholdAdapterOutput
  const adaptedScore: ScoreObject = {
    ...scoreObject,
    metadata: {
      ...scoreObject.metadata,
      custom: {
        ...scoreObject.metadata.custom,
      high_threshold: adapted.high_threshold,
      low_threshold: adapted.low_threshold
      }
    }
  }

  const decisionResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `adapt-final-decision-${problemText}-${history.length}`,
    module: "betting.decision_resolver",
    action: "resolve",
    caller: { system: "runtime_demo", role: "runtime", id: "threshold-adaptation-demo" },
    input: { score: adaptedScore },
    meta: { timestamp: new Date().toISOString() }
  })

  const bet = decisionResponse.output as BetObject
  const feedbackResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `adapt-feedback-${problemText}-${history.length}`,
    module: "betting.decision_feedback_recorder",
    action: "record",
    caller: { system: "runtime_demo", role: "runtime", id: "threshold-adaptation-demo" },
    input: { bet },
    meta: { timestamp: new Date().toISOString() }
  })

  const feedback = feedbackResponse.output as DecisionFeedbackRecord

  return {
    round: currentRound,
    type,
    threshold: {
      high: adapted.high_threshold,
      low: adapted.low_threshold
    },
    decision: feedback.decision,
    adjusted: adapted.adjusted,
    adjustment_reason: adapted.adjustment_reason
  }
}

export async function runFeedbackThresholdAdaptationDemo(): Promise<AdaptationDemoResult> {
  const dispatcherBundle = createRuntimeForAdaptation()
  const dispatcher = dispatcherBundle.dispatcher

  const scenarios = [
    { type: "ads", problem: "Amazon seller has high ACoS and wasted ad spend" },
    { type: "content", problem: "User wants to generate faceless YouTube videos at scale" },
    { type: "analytics", problem: "User needs to analyze SaaS metrics and detect churn risk" }
  ]

  const historyByType: Record<string, DecisionFeedbackRecord[]> = {
    ads: [],
    content: [],
    analytics: []
  }
  const thresholdStateByType: Record<string, { high: number; low: number }> = {
    ads: { high: 0.65, low: 0.62 },
    content: { high: 0.65, low: 0.62 },
    analytics: { high: 0.65, low: 0.62 }
  }
  const lastAdjustRoundByType: Record<string, number | null> = {
    ads: null,
    content: null,
    analytics: null
  }

  const tracks: ThresholdTrack[] = []

  for (const scenario of scenarios) {
    const trajectory: ProblemRoundResult[] = []

    for (let round = 1; round <= 8; round += 1) {
      const result = await runSingleRound(
        dispatcher,
        scenario.problem,
        historyByType[scenario.type],
        round,
        thresholdStateByType[scenario.type],
        lastAdjustRoundByType[scenario.type]
      )
      trajectory.push(result)

      thresholdStateByType[scenario.type] = {
        high: result.threshold.high,
        low: result.threshold.low
      }
      if (result.adjusted) {
        lastAdjustRoundByType[scenario.type] = round
      }

      historyByType[scenario.type].push({
        object_id: `${scenario.type}-${round}`,
        type: scenario.type,
        score: 0,
        threshold: result.threshold.high,
        decision: result.decision,
        timestamp: new Date().toISOString()
      })
    }

    tracks.push({
      type: scenario.type,
      trajectory
    })
  }

  return {
    threshold_tracks: tracks,
    final_decisions: tracks.map((track) => ({
      type: track.type,
      final_decision: track.trajectory[track.trajectory.length - 1].decision
    }))
  }
}

if (import.meta.url === new URL(process.argv[1], "file://").href) {
  runFeedbackThresholdAdaptationDemo()
    .then((result) => {
      console.log(JSON.stringify(result, null, 2))
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error)
      process.exit(1)
    })
}


