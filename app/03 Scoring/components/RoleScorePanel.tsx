import type { EvaluationRecord, EvaluatorRole, RoleInputStatus } from "@/types/scoring"

type RoleScorePanelProps = {
  evaluation: EvaluationRecord
  onUpdateRoleInput: (
    role: EvaluatorRole,
    field: "status" | "note",
    value: RoleInputStatus | string
  ) => void
}

const roleLabels: Record<EvaluatorRole, string> = {
  strategist: "Strategist",
  operator: "Operator",
  reviewer: "Reviewer"
}

export function RoleScorePanel({ evaluation, onUpdateRoleInput }: RoleScorePanelProps) {
  return (
    <div className="right-rail-section">
      <p className="field-label">Role Inputs</p>
      <div className="space-y-3">
        {evaluation.execution.evaluators.map((role) => {
          const roleInput = evaluation.execution.roleInputs[role]

          return (
            <div key={role} className="rounded-md border border-[rgba(168,151,132,0.18)] bg-white/10 px-3 py-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-ink">{roleLabels[role]}</p>
                  <p className="mt-1 text-xs text-muted">
                    Focus: {roleInput.focusDimensions.join(", ")}
                  </p>
                </div>
                <select
                  className="field-input max-w-[120px] py-1.5"
                  value={roleInput.status}
                  onChange={(event) => onUpdateRoleInput(role, "status", event.target.value as RoleInputStatus)}
                >
                  <option value="pending">pending</option>
                  <option value="active">active</option>
                  <option value="reviewed">reviewed</option>
                </select>
              </div>

              <div className="mt-3">
                <label className="field-label" htmlFor={`role-${role}-note`}>
                  Note
                </label>
                <textarea
                  id={`role-${role}-note`}
                  className="field-input min-h-[76px]"
                  value={roleInput.note}
                  onChange={(event) => onUpdateRoleInput(role, "note", event.target.value)}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
