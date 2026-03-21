import { FLOW_CONTRACT_REGISTRY, MVP_FLOW_CONTRACTS } from "../../SharedContracts"
import type { ConsoleTraceManifest, ConsoleTraceStep } from "@/types/console"

function buildTraceSteps(names: (keyof typeof FLOW_CONTRACT_REGISTRY)[], mode: "forward" | "feedback"): ConsoleTraceStep[] {
  return names.map((name, index) => {
    const contract = FLOW_CONTRACT_REGISTRY[name]

    return {
      order: index + 1,
      contract: contract.name,
      producer: contract.producer,
      consumer: contract.consumer,
      input_type: contract.input_type,
      output_type: contract.output_type,
      mode
    }
  })
}

export function loadTraceManifests(): ConsoleTraceManifest[] {
  return [
    {
      name: "Main Chain",
      type: "main-chain",
      steps: buildTraceSteps(MVP_FLOW_CONTRACTS, "forward")
    },
    {
      name: "Feedback Chain",
      type: "feedback-chain",
      steps: buildTraceSteps(
        [
          "scoring_to_builder_feedback",
          "scoring_to_radar_feedback",
          "betting_to_builder_feedback",
          "betting_to_radar_feedback"
        ],
        "feedback"
      )
    }
  ]
}
