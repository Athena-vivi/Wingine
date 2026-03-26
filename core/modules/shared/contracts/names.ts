export const FLOW_CONTRACTS = [
  "radar_to_builder",
  "builder_to_scoring",
  "scoring_to_betting",
  "scoring_to_builder_feedback",
  "scoring_to_radar_feedback",
  "betting_to_builder_feedback",
  "betting_to_radar_feedback"
] as const

export type FlowContractName = (typeof FLOW_CONTRACTS)[number]
