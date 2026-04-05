import type { ExecutionRequest, ExecutionResult } from "./executionProtocol.ts"
import { runContentExecutor } from "./contentExecutor.ts"
import { runToolExecutor } from "./toolExecutor.ts"

export function dispatchExecution(request: ExecutionRequest): ExecutionResult {
  if (request.execution_type === "content") {
    return runContentExecutor(request)
  }

  if (request.execution_type === "tool") {
    return runToolExecutor(request)
  }

  return {
    execution_id: `execution_failed_${Date.now()}`,
    status: "failed",
    output: {
      execution_type: request.execution_type,
      reason: "executor_not_implemented"
    }
  }
}
