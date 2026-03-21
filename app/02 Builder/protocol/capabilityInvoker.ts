import { buildBuilderWorkspaceRecord } from "@/capabilities/builderRecordManager"
import { runCapabilityAttachmentManager } from "@/capabilities/capabilityAttachmentManager"
import { resolveCapabilityDetail } from "@/capabilities/capabilityDetailResolver"
import { runOutputManager } from "@/capabilities/outputManager"
import { resolveUITemplate } from "@/capabilities/uiTemplateManager"
import { runWorkflowManager } from "@/capabilities/workflowManager"
import { runWorkflowStepLinker } from "@/capabilities/workflowStepLinker"
import type { BuilderCapabilityName, BuilderProtocolRequest, BuilderProtocolResponse } from "@/types/protocol"

export function invokeBuilderCapability(
  request: BuilderProtocolRequest
): BuilderProtocolResponse<Record<string, unknown>> {
  try {
    switch (request.capability as BuilderCapabilityName) {
      case "builder_record_manager":
        return {
          request_id: request.request_id,
          capability: request.capability,
          status: "success",
          state: "ready",
          data: {
            builder_record: buildBuilderWorkspaceRecord(request.payload as never)
          },
          error: null
        }
      case "workflow_manager": {
        const payload = request.payload as Parameters<typeof runWorkflowManager>[0]
        return {
          request_id: request.request_id,
          capability: request.capability,
          status: "success",
          state: "ready",
          data: runWorkflowManager(payload),
          error: null
        }
      }
      case "workflow_step_linker": {
        const payload = request.payload as Parameters<typeof runWorkflowStepLinker>[0]
        return {
          request_id: request.request_id,
          capability: request.capability,
          status: "success",
          state: "ready",
          data: runWorkflowStepLinker(payload),
          error: null
        }
      }
      case "capability_attachment_manager": {
        const payload = request.payload as Parameters<typeof runCapabilityAttachmentManager>[0]
        return {
          request_id: request.request_id,
          capability: request.capability,
          status: "success",
          state: "ready",
          data: runCapabilityAttachmentManager(payload),
          error: null
        }
      }
      case "capability_detail_resolver": {
        const payload = request.payload as Parameters<typeof resolveCapabilityDetail>[0]
        return {
          request_id: request.request_id,
          capability: request.capability,
          status: "success",
          state: "ready",
          data: {
            capability_detail: resolveCapabilityDetail(payload)
          },
          error: null
        }
      }
      case "output_manager": {
        const payload = request.payload as Parameters<typeof runOutputManager>[0]
        return {
          request_id: request.request_id,
          capability: request.capability,
          status: "success",
          state: "ready",
          data: runOutputManager(payload),
          error: null
        }
      }
      case "ui_template_manager": {
        const payload = request.payload as Parameters<typeof resolveUITemplate>[0]
        return {
          request_id: request.request_id,
          capability: request.capability,
          status: "success",
          state: "ready",
          data: resolveUITemplate(payload),
          error: null
        }
      }
      default:
        return {
          request_id: request.request_id,
          capability: request.capability,
          status: "error",
          state: "error",
          data: null,
          error: {
            code: "capability_not_found",
            message: `Unknown capability: ${request.capability}`
          }
        }
    }
  } catch (error) {
    return {
      request_id: request.request_id,
      capability: request.capability,
      status: "error",
      state: "error",
      data: null,
      error: {
        code: "capability_invocation_failed",
        message: error instanceof Error ? error.message : "Capability invocation failed."
      }
    }
  }
}
