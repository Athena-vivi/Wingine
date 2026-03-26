import { scoringCapabilityRegistry } from "@/capabilities/registry"

export const scoringProtocolRegistry = {
  capabilities: scoringCapabilityRegistry.map((capability) => capability.name),
  composite_protocols: [
    "workspace_load",
    "workspace_select",
    "dimension_update",
    "role_update",
    "workspace_persist",
    "workflow_import",
    "score_export"
  ]
} as const
