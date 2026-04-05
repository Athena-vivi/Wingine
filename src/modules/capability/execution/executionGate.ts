import type { BetObject, ProblemObject } from "../shared/index.ts"
import type { ExecutionGateInput as BaseExecutionGateInput, ExecutionResultRecord as BaseExecutionResultRecord } from "../../../contracts/execution.ts"
import type { ContentDraft } from "../../system/builder/contentDraftGenerator.ts"
import { runExecutionGateWorkflow } from "../../../workflows/execution/executionGateWorkflow.ts"

export type ExecutionGateInput = BaseExecutionGateInput<ProblemObject, BetObject>

export type ExecutionResultRecord = BaseExecutionResultRecord<ContentDraft | null>

export function applyExecutionGate(input: ExecutionGateInput): ExecutionResultRecord {
  return runExecutionGateWorkflow(input)
}


