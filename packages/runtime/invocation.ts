import type { InvocationRecord, ModuleCallRequest } from "./types.ts"

function createInvocationId() {
  return `invocation_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

export function startInvocation(request: ModuleCallRequest): InvocationRecord {
  return {
    invocation_id: createInvocationId(),
    request_id: request.request_id,
    trace_id: request.meta.trace_id,
    module_id: request.module,
    action: request.action,
    protocol_version: request.protocol_version,
    started_at: new Date().toISOString(),
    status: "started"
  }
}

export function finishInvocation(
  record: InvocationRecord,
  status: "success" | "error"
): InvocationRecord {
  return {
    ...record,
    finished_at: new Date().toISOString(),
    status
  }
}
