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
import { adaptTypeBias, type TypeBiasAdapterInput, type TypeBiasAdapterOutput } from "../core/feedback/typeBiasAdapter.ts"
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

type PreferenceRoundResult = {
  round: number
  type: string
  bias: number
  stability: number
  confidence_weight: number
  effective_score: number
  decision: string
}

type PreferenceTrack = {
  type: string
  trajectory: PreferenceRoundResult[]
}

type PreferenceFormationResult = {
  bias_tracks: PreferenceTrack[]
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

function resolveStability(history: DecisionFeedbackRecord[]) {
  const recent = history.slice(-5)

  if (recent.length === 0) {
    return 0
  }

  const counts = new Map<string, number>()

  for (const record of recent) {
    counts.set(record.decision, (counts.get(record.decision) ?? 0) + 1)
  }

  const dominantCount = Math.max(...counts.values())
  return Number((dominantCount / recent.length).toFixed(3))
}

function resolveConfidenceWeight(stability: number) {
  const value = 1 - stability * 0.7
  return Number(Math.max(0.3, Math.min(1, value)).toFixed(3))
}

function createRuntimeForPreference() {
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
      module_id: "scoring.type_bias_adapter",
      system: "scoring",
      actions: ["adapt"],
      input_contract: "decision_feedback_records",
      output_contract: "type_bias",
      module_version: "0.1.0",
      status: "active"
    },
    execution: {
      mode: "local",
      target: "core/feedback/typeBiasAdapter.ts.adaptTypeBias",
      handler: (input) => adaptTypeBias(input as TypeBiasAdapterInput)
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
  currentBias: number,
  typeKey: string
): Promise<PreferenceRoundResult> {
  const resolverResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `pref-resolver-${problemText}-${history.length}`,
    module: "problem_radar.source_input_resolver",
    action: "resolve",
    caller: { system: "runtime_demo", role: "runtime", id: "preference-formation-demo" },
    input: { source: { provider: "manual" }, raw_text: problemText },
    meta: { timestamp: new Date().toISOString() }
  })

  const normalizerResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `pref-normalizer-${problemText}-${history.length}`,
    module: "problem_radar.source_normalizer",
    action: "normalize",
    caller: { system: "runtime_demo", role: "runtime", id: "preference-formation-demo" },
    input: {
      sourceMode: (resolverResponse.output as SourceNormalizerInput).sourceMode,
      normalizedInput: (resolverResponse.output as SourceNormalizerInput).normalizedInput
    },
    meta: { timestamp: new Date().toISOString() }
  })

  const extractorResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `pref-extractor-${problemText}-${history.length}`,
    module: "problem_radar.problem_extractor",
    action: "extract",
    caller: { system: "runtime_demo", role: "runtime", id: "preference-formation-demo" },
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
    insightDraft: "Preference formation validation record."
  })

  const problemResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `pref-problem-${problemText}-${history.length}`,
    module: "problem_radar.problem_structurer",
    action: "structure",
    caller: { system: "runtime_demo", role: "runtime", id: "preference-formation-demo" },
    input: radarRecord,
    meta: { timestamp: new Date().toISOString() }
  })

  const classifierResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `pref-classifier-${problemText}-${history.length}`,
    module: "scoring.problem_classifier",
    action: "classify",
    caller: { system: "runtime_demo", role: "runtime", id: "preference-formation-demo" },
    input: { problem: problemResponse.output as ProblemObject },
    meta: { timestamp: new Date().toISOString() }
  })

  const problemScoreResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `pref-problem-score-${problemText}-${history.length}`,
    module: "scoring.problem_evaluator",
    action: "evaluate",
    caller: { system: "runtime_demo", role: "runtime", id: "preference-formation-demo" },
    input: { problem: classifierResponse.output as ProblemObject },
    meta: { timestamp: new Date().toISOString() }
  })

  const problemDecisionResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `pref-problem-decision-${problemText}-${history.length}`,
    module: "betting.problem_decision_resolver",
    action: "resolve",
    caller: { system: "runtime_demo", role: "runtime", id: "preference-formation-demo" },
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
    throw new Error("problem gate blocked builder during preference formation validation")
  }

  const builderProblemResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `pref-builder-problem-${problemText}-${history.length}`,
    module: "builder.problem_spec_loader",
    action: "load",
    caller: { system: "runtime_demo", role: "runtime", id: "preference-formation-demo" },
    input: {
      contract_name: "radar_to_builder",
      producer: "radar",
      consumer: "builder",
      object: classifierResponse.output as ProblemObject,
      context: {
        request_id: `pref-builder-${problemText}-${history.length}`,
        trigger: "problem_gate_pass",
        sent_at: new Date().toISOString()
      }
    } as BuilderIntakeInput,
    meta: { timestamp: new Date().toISOString() }
  })

  const goalResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `pref-goal-${problemText}-${history.length}`,
    module: "builder.system_goal_resolver",
    action: "resolve",
    caller: { system: "runtime_demo", role: "runtime", id: "preference-formation-demo" },
    input: builderProblemResponse.output as BuilderGoalInput,
    meta: { timestamp: new Date().toISOString() }
  })

  const structuralResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `pref-structural-${problemText}-${history.length}`,
    module: "builder.structural_module_planner",
    action: "plan",
    caller: { system: "runtime_demo", role: "runtime", id: "preference-formation-demo" },
    input: goalResponse.output as BuilderGoalOutput,
    meta: { timestamp: new Date().toISOString() }
  })

  const contractsResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `pref-contracts-${problemText}-${history.length}`,
    module: "builder.io_contract_builder",
    action: "build",
    caller: { system: "runtime_demo", role: "runtime", id: "preference-formation-demo" },
    input: structuralResponse.output as StructuralModuleList,
    meta: { timestamp: new Date().toISOString() }
  })

  const systemSpecResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `pref-spec-${problemText}-${history.length}`,
    module: "builder.system_spec_builder",
    action: "build",
    caller: { system: "runtime_demo", role: "runtime", id: "preference-formation-demo" },
    input: {
      modules: (structuralResponse.output as StructuralModuleList).modules,
      contracts: (contractsResponse.output as ModuleIOContractList).contracts
    },
    meta: { timestamp: new Date().toISOString() }
  })

  const systemScoreResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `pref-system-score-${problemText}-${history.length}`,
    module: "scoring.system_evaluator",
    action: "evaluate",
    caller: { system: "runtime_demo", role: "runtime", id: "preference-formation-demo" },
    input: { spec: systemSpecResponse.output as SystemSpec },
    meta: { timestamp: new Date().toISOString() }
  })

  const scoreObject = systemScoreResponse.output as ScoreObject
  const thresholdResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `pref-threshold-${problemText}-${history.length}`,
    module: "scoring.threshold_adapter",
    action: "adapt",
    caller: { system: "runtime_demo", role: "runtime", id: "preference-formation-demo" },
    input: {
      type: typeKey,
      base_high_threshold: 0.65,
      base_low_threshold: 0.62,
      feedback_records: history,
      current_round: history.length + 1,
      last_adjust_round: null,
      confirmation_count: 3,
      cooldown_rounds: 2
    } as ThresholdAdapterInput,
    meta: { timestamp: new Date().toISOString() }
  })

  const threshold = thresholdResponse.output as ThresholdAdapterOutput
  const biasResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `pref-bias-${problemText}-${history.length}`,
    module: "scoring.type_bias_adapter",
    action: "adapt",
    caller: { system: "runtime_demo", role: "runtime", id: "preference-formation-demo" },
    input: {
      type: typeKey,
      current_bias: currentBias,
      feedback_records: history
    } as TypeBiasAdapterInput,
    meta: { timestamp: new Date().toISOString() }
  })

  const bias = biasResponse.output as TypeBiasAdapterOutput
  const stability = resolveStability(history)
  const confidenceWeight = resolveConfidenceWeight(stability)
  const effectiveScore = Number((scoreObject.weighted_score + bias.bias * confidenceWeight).toFixed(3))
  const adaptedScore: ScoreObject = {
    ...scoreObject,
    weighted_score: effectiveScore,
    metadata: {
      ...scoreObject.metadata,
      custom: {
        ...scoreObject.metadata.custom,
        high_threshold: threshold.high_threshold,
        low_threshold: threshold.low_threshold,
        bias: bias.bias,
        stability,
        confidence_weight: confidenceWeight
      }
    }
  }

  const decisionResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `pref-final-decision-${problemText}-${history.length}`,
    module: "betting.decision_resolver",
    action: "resolve",
    caller: { system: "runtime_demo", role: "runtime", id: "preference-formation-demo" },
    input: { score: adaptedScore },
    meta: { timestamp: new Date().toISOString() }
  })

  const bet = decisionResponse.output as BetObject
  const feedbackResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `pref-feedback-${problemText}-${history.length}`,
    module: "betting.decision_feedback_recorder",
    action: "record",
    caller: { system: "runtime_demo", role: "runtime", id: "preference-formation-demo" },
    input: { bet },
    meta: { timestamp: new Date().toISOString() }
  })

  const feedback = feedbackResponse.output as DecisionFeedbackRecord

  return {
    round: history.length + 1,
    type: typeKey,
    bias: bias.bias,
    stability,
    confidence_weight: confidenceWeight,
    effective_score: effectiveScore,
    decision: feedback.decision
  }
}

export async function runPreferenceFormationDemo(): Promise<PreferenceFormationResult> {
  const { dispatcher } = createRuntimeForPreference()
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
  const biasByType: Record<string, number> = {
    ads: -0.02,
    content: -0.03,
    analytics: 0.03
  }

  const tracks: PreferenceTrack[] = []

  for (const scenario of scenarios) {
    const trajectory: PreferenceRoundResult[] = []

    for (let round = 0; round < 10; round += 1) {
      const result = await runSingleRound(
        dispatcher,
        scenario.problem,
        historyByType[scenario.type],
        biasByType[scenario.type],
        scenario.type
      )
      trajectory.push(result)
      biasByType[scenario.type] = result.bias

      historyByType[scenario.type].push({
        object_id: `${scenario.type}-${round}`,
        type: scenario.type,
        score: result.effective_score,
        threshold: 0.65,
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
    bias_tracks: tracks,
    final_decisions: tracks.map((track) => ({
      type: track.type,
      final_decision: track.trajectory[track.trajectory.length - 1].decision
    }))
  }
}

if (import.meta.url === new URL(process.argv[1], "file://").href) {
  runPreferenceFormationDemo()
    .then((result) => {
      console.log(JSON.stringify(result, null, 2))
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error)
      process.exit(1)
    })
}


