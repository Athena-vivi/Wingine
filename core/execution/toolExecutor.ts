import type { ExecutionRequest, ExecutionResult } from "./executionProtocol.ts"

export function runToolExecutor(request: ExecutionRequest): ExecutionResult {
  const toolName = String(request.payload.tool_name ?? "generic_tool")
  const problemType = String(request.payload.problem_type ?? "general")
  const target = String(request.payload.target ?? "local")

  return {
    execution_id: `execution_tool_${Date.now()}`,
    status: "success",
    output: {
      execution_type: "tool",
      tool_spec: {
        name: toolName,
        target,
        problem_type: problemType
      }
    }
  }
}
