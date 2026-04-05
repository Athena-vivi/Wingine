import type { CapabilityDefinition, ProtocolRequest, ProtocolResponse } from "../types/protocol.ts"
import type { EvaluationRecord, EvaluatorRole, RoleInputStatus } from "../types/scoring.ts"
import { validateRoleInputUpdate } from "../../../../../control/state/roleState.ts"

type Payload = {
  evaluation: EvaluationRecord
  role: EvaluatorRole
  field: "status" | "note"
  value: RoleInputStatus | string
}

type Data = {
  evaluation: EvaluationRecord
}

export const roleInputManagerCapability: CapabilityDefinition = {
  name: "role_input_manager",
  purpose: "Manage role-specific evaluation ownership, status, and review notes.",
  input_schema: {
    evaluation: "evaluation_record",
    role: "strategist|operator|reviewer",
    field: "status|note",
    value: "string"
  },
  process_logic: [
    "validate role",
    "validate status",
    "write role input state",
    "return updated role input block"
  ],
  output_schema: {
    evaluation: "evaluation_record"
  },
  state: "idle|updating|ready|error",
  trigger: "called when role state or role note changes",
  error_handling: {
    invalid_role: "reject update",
    invalid_status: "reject update"
  }
}

export function invokeRoleInputManager(
  request: ProtocolRequest<Payload>
): ProtocolResponse<Data> {
  const { evaluation, role, field, value } = request.payload
  const validation = validateRoleInputUpdate({
    evaluation,
    role,
    field,
    value
  })

  if (!validation.valid) {
    return {
      request_id: request.request_id,
      capability: roleInputManagerCapability.name,
      status: "error",
      state: "error",
      data: null,
      error: validation.error
    }
  }

  return {
    request_id: request.request_id,
    capability: roleInputManagerCapability.name,
    status: "success",
    state: "updated",
    data: {
      evaluation: {
        ...evaluation,
        execution: {
          ...evaluation.execution,
          roleInputs: {
            ...evaluation.execution.roleInputs,
            [role]: {
              ...evaluation.execution.roleInputs[role],
              [field]: value
            }
          }
        }
      }
    },
    error: null
  }
}


