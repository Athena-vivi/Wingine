import type { ScoreObject } from "../modules/shared/index.ts"

type SystemSpec = {
  type: "system_spec"
  modules: string[]
  flows: Array<{
    from: string
    to: string
  }>
}

export type SystemEvaluatorInput = {
  spec: SystemSpec
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function resolveStructuralSignal(modules: string[]) {
  if (modules.includes("builder.ads_signal_analyzer")) {
    return {
      kind: "ads",
      module_type_weight: 0.04,
      specialization_bonus: 0.01
    }
  }

  if (modules.includes("builder.content_pipeline_designer")) {
    return {
      kind: "content",
      module_type_weight: 0.02,
      specialization_bonus: 0.005
    }
  }

  if (modules.includes("builder.metric_model_builder")) {
    return {
      kind: "analytics",
      module_type_weight: 0.05,
      specialization_bonus: 0.02
    }
  }

  return {
    kind: "general",
    module_type_weight: 0,
    specialization_bonus: 0
  }
}

export function evaluateSystemSpec(input: SystemEvaluatorInput): ScoreObject {
  const moduleCount = input.spec.modules.length
  const flowCount = input.spec.flows.length
  const complexity = moduleCount + flowCount
  const structuralSignal = resolveStructuralSignal(input.spec.modules)
  const baseScore = 0.8 - moduleCount * 0.03 - flowCount * 0.03
  const weightedScore = Number(
    clamp(baseScore + structuralSignal.module_type_weight + structuralSignal.specialization_bonus, 0.5, 0.82).toFixed(3)
  )
  const confidence = Number(
    clamp(
      0.88 - complexity * 0.04 + structuralSignal.specialization_bonus + structuralSignal.module_type_weight * 0.4,
      0.5,
      0.88
    ).toFixed(3)
  )
  const timestamp = new Date().toISOString()
  const objectId = `system_spec:${input.spec.modules.join("|")}`
  const systemScoreReason = `Scored from module_count=${moduleCount}, flow_count=${flowCount}, module_type_weight=${structuralSignal.module_type_weight}, specialization_bonus=${structuralSignal.specialization_bonus}.`

  return {
    id: `score_${moduleCount}_${flowCount}`,
    type: "score",
    source: {
      system: "scoring",
      origin_id: "runtime_system_evaluator",
      origin_ref: "core/scoring/systemEvaluator.evaluateSystemSpec"
    },
    status: "scored",
    metadata: {
      tags: ["system_spec", "minimal_score"],
      labels: ["runtime_eval"],
      custom: {
        module_count: moduleCount,
        flow_count: flowCount,
        complexity,
        structural_signal: structuralSignal.kind,
        system_score_reason: systemScoreReason
      }
    },
    timestamps: {
      created_at: timestamp,
      updated_at: timestamp,
      observed_at: timestamp
    },
    object_id: objectId,
    dimensions: {
      value: weightedScore,
      quality: weightedScore,
      reliability: confidence,
      leverage: clamp(0.75 - moduleCount * 0.03, 0.5, 0.75)
    },
    weighted_score: weightedScore,
    confidence
  }
}
