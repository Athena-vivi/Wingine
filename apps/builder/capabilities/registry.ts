import { builderRecordManagerCapability } from "@/capabilities/builderRecordManager"
import { capabilityAttachmentManagerCapability } from "@/capabilities/capabilityAttachmentManager"
import { capabilityDetailResolverCapability } from "@/capabilities/capabilityDetailResolver"
import { outputManagerCapability } from "@/capabilities/outputManager"
import { uiTemplateManagerCapability } from "@/capabilities/uiTemplateManager"
import { workflowManagerCapability } from "@/capabilities/workflowManager"
import { workflowStepLinkerCapability } from "@/capabilities/workflowStepLinker"

export const builderCapabilityRegistry = [
  builderRecordManagerCapability,
  workflowManagerCapability,
  workflowStepLinkerCapability,
  capabilityAttachmentManagerCapability,
  capabilityDetailResolverCapability,
  outputManagerCapability,
  uiTemplateManagerCapability
]
