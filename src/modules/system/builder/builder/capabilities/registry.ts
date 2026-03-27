import { builderRecordManagerCapability } from "./builderRecordManager.ts"
import { capabilityAttachmentManagerCapability } from "./capabilityAttachmentManager.ts"
import { capabilityDetailResolverCapability } from "./capabilityDetailResolver.ts"
import { outputManagerCapability } from "./outputManager.ts"
import { uiTemplateManagerCapability } from "./uiTemplateManager.ts"
import { workflowManagerCapability } from "./workflowManager.ts"
import { workflowStepLinkerCapability } from "./workflowStepLinker.ts"

export const builderCapabilityRegistry = [
  builderRecordManagerCapability,
  workflowManagerCapability,
  workflowStepLinkerCapability,
  capabilityAttachmentManagerCapability,
  capabilityDetailResolverCapability,
  outputManagerCapability,
  uiTemplateManagerCapability
]


