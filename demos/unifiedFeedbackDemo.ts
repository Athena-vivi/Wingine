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
import { dispatchExecution } from "../core/execution/executionDispatcher.ts"
import type { ExecutionRequest } from "../core/execution/executionProtocol.ts"
import {
  recordFeedback,
  recordDecisionFeedback,
  type DecisionFeedbackInput,
  type FeedbackRecord,
  type FeedbackRecordInput
} from "../core/feedback/decisionFeedbackRecorder.ts"
import { adaptOutcomeFeedback, type OutcomeAdapterInput } from "../core/feedback/outcomeAdapter.ts"
import { adaptTypeBias, type TypeBiasAdapterInput } from "../core/feedback/typeBiasAdapter.ts"
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

type UnifiedFeedbackDemoResult = {
  decision_feedback: FeedbackRecord
  outcome_feedback: FeedbackRecord
  bias_before: number
  bias_after: number
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

function resolveExecutionType(type: string): ExecutionRequest["execution_type"] {
  if (type === "analytics") {
    return "tool"
  }

  return "content"
}

function buildExecutionRequest(problem: ProblemObject, bet: BetObject): ExecutionRequest {
  const type = String(problem.metadata.custom.type ?? "general")

  if (resolveExecutionType(type) === "tool") {
    return {
      execution_type: "tool",
      payload: {
        tool_name: "metric_monitor",
        target: "saas_metrics_workspace",
        problem_type: type
      },
      source_problem_id: problem.id,
      decision_ref: bet.id
    }
  }

  return {
    execution_type: "content",
    payload: {
      title: problem.title,
      summary: problem.summary,
      body: `Problem: ${problem.normalized_problem}. Source: ${problem.source.system}.`
    },
    source_problem_id: problem.id,
    decision_ref: bet.id
  }
}

function createRuntimeForUnifiedFeedback() {
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
      input_contract: "feedback_record",
      output_contract: "feedback_record",
      module_version: "0.1.0",
      status: "active"
    },
    execution: {
      mode: "local",
      target: "core/feedback/decisionFeedbackRecorder.ts.recordFeedback",
      handler: (input) => {
        if ((input as DecisionFeedbackInput).bet) {
          return recordDecisionFeedback(input as DecisionFeedbackInput)
        }

        return recordFeedback(input as FeedbackRecordInput)
      }
    }
  })

  registry.register({
    module: {
      module_id: "scoring.type_bias_adapter",
      system: "scoring",
      actions: ["adapt"],
      input_contract: "feedback_records",
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

  return {
    dispatcher
  }
}

export async function runUnifiedFeedbackDemo(): Promise<UnifiedFeedbackDemoResult> {
  const { dispatcher } = createRuntimeForUnifiedFeedback()
  const problemText = "User needs to analyze SaaS metrics and detect churn risk"

  const resolverResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: "unified-feedback-resolver",
    module: "problem_radar.source_input_resolver",
    action: "resolve",
    caller: { system: "runtime_demo", role: "runtime", id: "unified-feedback-demo" },
    input: { source: { provider: "manual" }, raw_text: problemText },
    meta: { timestamp: new Date().toISOString() }
  })

  const normalizerResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: "unified-feedback-normalizer",
    module: "problem_radar.source_normalizer",
    action: "normalize",
    caller: { system: "runtime_demo", role: "runtime", id: "unified-feedback-demo" },
    input: {
      sourceMode: (resolverResponse.output as SourceNormalizerInput).sourceMode,
      normalizedInput: (resolverResponse.output as SourceNormalizerInput).normalizedInput
    },
    meta: { timestamp: new Date().toISOString() }
  })

  const extractorResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: "unified-feedback-extractor",
    module: "problem_radar.problem_extractor",
    action: "extract",
    caller: { system: "runtime_demo", role: "runtime", id: "unified-feedback-demo" },
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
    insightDraft: "Unified feedback validation record."
  })

  const problemResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: "unified-feedback-problem",
    module: "problem_radar.problem_structurer",
    action: "structure",
    caller: { system: "runtime_demo", role: "runtime", id: "unified-feedback-demo" },
    input: radarRecord,
    meta: { timestamp: new Date().toISOString() }
  })

  const classifierResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: "unified-feedback-classifier",
    module: "scoring.problem_classifier",
    action: "classify",
    caller: { system: "runtime_demo", role: "runtime", id: "unified-feedback-demo" },
    input: { problem: problemResponse.output as ProblemObject },
    meta: { timestamp: new Date().toISOString() }
  })

  const problemScoreResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: "unified-feedback-problem-score",
    module: "scoring.problem_evaluator",
    action: "evaluate",
    caller: { system: "runtime_demo", role: "runtime", id: "unified-feedback-demo" },
    input: { problem: classifierResponse.output as ProblemObject },
    meta: { timestamp: new Date().toISOString() }
  })

  const problemDecisionResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: "unified-feedback-problem-decision",
    module: "betting.problem_decision_resolver",
    action: "resolve",
    caller: { system: "runtime_demo", role: "runtime", id: "unified-feedback-demo" },
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
    throw new Error("problem gate blocked builder during unified feedback validation")
  }

  const problemObject = classifierResponse.output as ProblemObject

  const builderProblemResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: "unified-feedback-builder-problem",
    module: "builder.problem_spec_loader",
    action: "load",
    caller: { system: "runtime_demo", role: "runtime", id: "unified-feedback-demo" },
    input: {
      contract_name: "radar_to_builder",
      producer: "radar",
      consumer: "builder",
      object: problemObject,
      context: {
        request_id: "unified-feedback-builder-problem",
        trigger: "problem_gate_pass",
        sent_at: new Date().toISOString()
      }
    } as BuilderIntakeInput,
    meta: { timestamp: new Date().toISOString() }
  })

  const goalResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: "unified-feedback-goal",
    module: "builder.system_goal_resolver",
    action: "resolve",
    caller: { system: "runtime_demo", role: "runtime", id: "unified-feedback-demo" },
    input: builderProblemResponse.output as BuilderGoalInput,
    meta: { timestamp: new Date().toISOString() }
  })

  const structuralResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: "unified-feedback-structural",
    module: "builder.structural_module_planner",
    action: "plan",
    caller: { system: "runtime_demo", role: "runtime", id: "unified-feedback-demo" },
    input: goalResponse.output as BuilderGoalOutput,
    meta: { timestamp: new Date().toISOString() }
  })

  const contractsResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: "unified-feedback-contracts",
    module: "builder.io_contract_builder",
    action: "build",
    caller: { system: "runtime_demo", role: "runtime", id: "unified-feedback-demo" },
    input: structuralResponse.output as StructuralModuleList,
    meta: { timestamp: new Date().toISOString() }
  })

  const systemSpecResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: "unified-feedback-spec",
    module: "builder.system_spec_builder",
    action: "build",
    caller: { system: "runtime_demo", role: "runtime", id: "unified-feedback-demo" },
    input: {
      modules: (structuralResponse.output as StructuralModuleList).modules,
      contracts: (contractsResponse.output as ModuleIOContractList).contracts
    },
    meta: { timestamp: new Date().toISOString() }
  })

  const systemScoreResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: "unified-feedback-system-score",
    module: "scoring.system_evaluator",
    action: "evaluate",
    caller: { system: "runtime_demo", role: "runtime", id: "unified-feedback-demo" },
    input: { spec: systemSpecResponse.output as SystemSpec },
    meta: { timestamp: new Date().toISOString() }
  })

  const finalDecisionResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: "unified-feedback-final-decision",
    module: "betting.decision_resolver",
    action: "resolve",
    caller: { system: "runtime_demo", role: "runtime", id: "unified-feedback-demo" },
    input: { score: systemScoreResponse.output as ScoreObject },
    meta: { timestamp: new Date().toISOString() }
  })

  const betObject = finalDecisionResponse.output as BetObject

  const decisionFeedbackResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: "unified-feedback-decision-record",
    module: "betting.decision_feedback_recorder",
    action: "record",
    caller: { system: "runtime_demo", role: "runtime", id: "unified-feedback-demo" },
    input: { bet: betObject } as DecisionFeedbackInput,
    meta: { timestamp: new Date().toISOString() }
  })

  const decisionFeedback = decisionFeedbackResponse.output as FeedbackRecord
  const executionRequest = buildExecutionRequest(problemObject, betObject)
  const executionResult = dispatchExecution(executionRequest)
  const outcomeFeedbackRecord = adaptOutcomeFeedback({
    execution_result: executionResult,
    object_id: problemObject.id,
    type: String(problemObject.metadata.custom.type ?? "general")
  } as OutcomeAdapterInput)

  const outcomeFeedbackResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: "unified-feedback-outcome-record",
    module: "betting.decision_feedback_recorder",
    action: "record",
    caller: { system: "runtime_demo", role: "runtime", id: "unified-feedback-demo" },
    input: {
      record: outcomeFeedbackRecord
    } as FeedbackRecordInput,
    meta: { timestamp: new Date().toISOString() }
  })

  const outcomeFeedback = outcomeFeedbackResponse.output as FeedbackRecord
  const biasBefore = 0.03
  const biasFeedbackHistory: FeedbackRecord[] = [
    decisionFeedback,
    outcomeFeedback,
    {
      ...outcomeFeedback,
      timestamp: new Date().toISOString()
    },
    {
      ...outcomeFeedback,
      timestamp: new Date().toISOString()
    }
  ]
  const biasResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: "unified-feedback-bias",
    module: "scoring.type_bias_adapter",
    action: "adapt",
    caller: { system: "runtime_demo", role: "runtime", id: "unified-feedback-demo" },
    input: {
      type: "analytics",
      current_bias: biasBefore,
      feedback_records: biasFeedbackHistory
    } as TypeBiasAdapterInput,
    meta: { timestamp: new Date().toISOString() }
  })

  return {
    decision_feedback: decisionFeedback,
    outcome_feedback: outcomeFeedback,
    bias_before: biasBefore,
    bias_after: (biasResponse.output as { bias: number }).bias
  }
}

if (import.meta.url === new URL(process.argv[1], "file://").href) {
  runUnifiedFeedbackDemo()
    .then((result) => {
      console.log(JSON.stringify(result, null, 2))
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error)
      process.exit(1)
    })
}


