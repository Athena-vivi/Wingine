import { bettingCapabilityRegistry } from "../capabilities/registry.ts"

export const bettingProtocolRegistry = {
  capabilities: bettingCapabilityRegistry.map((capability) => capability.name),
  composite_protocols: [
    "candidate_load",
    "bet_evaluate",
    "bet_persist",
    "bet_history_load",
    "score_import",
    "bet_export"
  ]
} as const



