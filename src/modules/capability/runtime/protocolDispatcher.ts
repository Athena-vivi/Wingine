import { createActivityLogStore } from "./activityLogStore.ts"
import { finishInvocation, startInvocation } from "./invocation.ts"
import { createModuleRegistry } from "./moduleRegistry.ts"
import type {
  ActivityLogRecord,
  InvocationRecord,
  ModuleCallRequest,
  ModuleCallResponse,
  RegistryRecord
} from "./types.ts"

type ModuleRegistry = ReturnType<typeof createModuleRegistry>
type ActivityLogStore = ReturnType<typeof createActivityLogStore>

function createActivityRecord(invocation: InvocationRecord, status: "success" | "error"): ActivityLogRecord {
  return {
    module_id: invocation.module_id,
    action: invocation.action,
    status,
    timestamp: new Date().toISOString()
  }
}

function withInvocationMeta(request: ModuleCallRequest, invocationId: string) {
  return {
    ...request.meta,
    timestamp: new Date().toISOString(),
    custom: {
      ...(request.meta.custom ?? {}),
      invocation_id: invocationId
    }
  }
}

function createErrorResponse(
  request: ModuleCallRequest,
  code: string,
  message: string,
  invocationId?: string
): ModuleCallResponse {
  return {
    protocol_version: request.protocol_version,
    request_id: request.request_id,
    module: request.module,
    action: request.action,
    status: "error",
    state: "error",
    output: null,
    error: {
      code,
      message
    },
    meta: invocationId ? withInvocationMeta(request, invocationId) : request.meta
  }
}

async function invokeLocal(record: RegistryRecord, input: unknown) {
  return record.execution.handler(input)
}

export function createProtocolDispatcher(dependencies: {
  registry: ModuleRegistry
  activityLogStore: ActivityLogStore
}) {
  const { registry, activityLogStore } = dependencies

  return {
    async dispatch(request: ModuleCallRequest): Promise<ModuleCallResponse> {
      if (!request.module || !request.action) {
        return createErrorResponse(request, "invalid_request", "module and action are required")
      }

      const record = registry.get(request.module)

      if (!record) {
        return createErrorResponse(request, "module_not_found", "module is not registered")
      }

      if (record.module.status !== "active") {
        return createErrorResponse(request, "module_inactive", "module is not active")
      }

      if (!record.module.actions.includes(request.action)) {
        return createErrorResponse(request, "action_not_supported", "action is not registered for module")
      }

      const invocation = startInvocation(request)

      try {
        const output = await invokeLocal(record, request.input)
        const finishedInvocation = finishInvocation(invocation, "success")
        activityLogStore.append(createActivityRecord(finishedInvocation, "success"))

        return {
          protocol_version: request.protocol_version,
          request_id: request.request_id,
          module: request.module,
          action: request.action,
          status: "success",
          state: "ready",
          output: (output ?? null) as Record<string, unknown> | null,
          error: null,
          meta: withInvocationMeta(request, finishedInvocation.invocation_id)
        }
      } catch (error) {
        const finishedInvocation = finishInvocation(invocation, "error")
        activityLogStore.append(createActivityRecord(finishedInvocation, "error"))

        return createErrorResponse(
          request,
          "module_invocation_failed",
          error instanceof Error ? error.message : "module invocation failed",
          finishedInvocation.invocation_id
        )
      }
    }
  }
}
