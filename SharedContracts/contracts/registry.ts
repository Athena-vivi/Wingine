import type { SharedObjectType } from "../enums/objectTypes"
import type { FlowContractName } from "./names"

export type FlowGateResult = "pass" | "hold" | "reject"

export type FlowContractSpec = {
  name: FlowContractName
  producer: "radar" | "builder" | "scoring" | "betting"
  consumer: "radar" | "builder" | "scoring" | "betting"
  input_type: SharedObjectType
  output_type: SharedObjectType
  trigger: string[]
  gate: string[]
  state_change: {
    input?: string
    output?: string
  }
}

export const FLOW_CONTRACT_REGISTRY: Record<FlowContractName, FlowContractSpec> = {
  radar_to_builder: {
    name: "radar_to_builder",
    producer: "radar",
    consumer: "builder",
    input_type: "problem",
    output_type: "workflow",
    trigger: ["problem.status in [qualified, structured]"],
    gate: ["problem.id exists", "problem.normalized_problem exists", "problem.status != archived"],
    state_change: {
      input: "problem: qualified|structured -> linked",
      output: "workflow: missing -> draft"
    }
  },
  builder_to_scoring: {
    name: "builder_to_scoring",
    producer: "builder",
    consumer: "scoring",
    input_type: "workflow",
    output_type: "score",
    trigger: ["workflow.status in [mapped, executable, blocked]", "explicit scoring request exists"],
    gate: ["workflow.id exists", "workflow.problem_id exists", "workflow.status != retired"],
    state_change: {
      output: "score: missing -> draft -> reviewing -> scored"
    }
  },
  scoring_to_betting: {
    name: "scoring_to_betting",
    producer: "scoring",
    consumer: "betting",
    input_type: "score",
    output_type: "bet",
    trigger: ["score.status = scored"],
    gate: ["score.object_id exists", "score.weighted_score exists", "score.confidence exists"],
    state_change: {
      output: "bet: missing -> draft -> active|held|killed|scaled"
    }
  },
  scoring_to_builder_feedback: {
    name: "scoring_to_builder_feedback",
    producer: "scoring",
    consumer: "builder",
    input_type: "score",
    output_type: "workflow",
    trigger: [
      "score.status = scored",
      "score.metadata.custom.object_type in [workflow, module, output]",
      "score.metadata.custom.gate_result in [reject, hold, improve]"
    ],
    gate: ["score.object_id exists", "score.weighted_score exists", "score.confidence exists"],
    state_change: {
      output: "workflow|module|output: active execution state -> revision state"
    }
  },
  scoring_to_radar_feedback: {
    name: "scoring_to_radar_feedback",
    producer: "scoring",
    consumer: "radar",
    input_type: "score",
    output_type: "problem",
    trigger: ["score.status = scored", "score.metadata.custom.object_type = problem"],
    gate: ["score.object_id exists"],
    state_change: {
      output: "problem: qualified|structured|linked -> qualified|structured|linked|archived"
    }
  },
  betting_to_builder_feedback: {
    name: "betting_to_builder_feedback",
    producer: "betting",
    consumer: "builder",
    input_type: "bet",
    output_type: "workflow",
    trigger: ["bet.status in [active, held, killed, scaled]"],
    gate: ["bet.object_id exists", "bet.metadata.custom.decision exists"],
    state_change: {
      output: "workflow|module|output: local execution state updated from bet decision"
    }
  },
  betting_to_radar_feedback: {
    name: "betting_to_radar_feedback",
    producer: "betting",
    consumer: "radar",
    input_type: "bet",
    output_type: "problem",
    trigger: ["bet.metadata.custom.object_type = problem", "bet.status in [held, killed, scaled]"],
    gate: ["bet.object_id exists"],
    state_change: {
      output: "problem: linked -> linked|archived"
    }
  }
}

export const MVP_FLOW_CONTRACTS: FlowContractName[] = [
  "radar_to_builder",
  "builder_to_scoring",
  "scoring_to_betting"
]
