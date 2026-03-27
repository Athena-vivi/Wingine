import type { ExecutionRequest, ExecutionResult } from "./executionProtocol.ts"

export function runContentExecutor(request: ExecutionRequest): ExecutionResult {
  const title = String(request.payload.title ?? "Untitled Draft")
  const summary = String(request.payload.summary ?? "")
  const body = String(request.payload.body ?? "")

  return {
    execution_id: `execution_content_${Date.now()}`,
    status: "success",
    output: {
      execution_type: "content",
      draft: {
        title,
        summary,
        body
      },
      ready_to_publish: true
    }
  }
}
