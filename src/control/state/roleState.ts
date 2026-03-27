import type {
  EvaluationRecord,
  EvaluatorRole,
  RoleInputStatus
} from "../../modules/capability/decision/scoring_module/types/scoring.ts"

export function validateRoleInputUpdate(input: {
  evaluation: EvaluationRecord
  role: EvaluatorRole
  field: "status" | "note"
  value: RoleInputStatus | string
}) {
  if (!input.evaluation || !input.evaluation.execution.roleInputs[input.role]) {
    return {
      valid: false,
      error: {
        code: "invalid_role",
        message: "role input could not be resolved"
      }
    } as const
  }

  if (input.field === "status" && !["pending", "active", "reviewed"].includes(String(input.value))) {
    return {
      valid: false,
      error: {
        code: "invalid_status",
        message: "role status is invalid"
      }
    } as const
  }

  return { valid: true } as const
}
