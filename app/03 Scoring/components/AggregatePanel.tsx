import { HistoryPanel } from "@/components/HistoryPanel"
import { RoleScorePanel } from "@/components/RoleScorePanel"
import { scoringGateRules } from "@/data/scoringGateRules"
import type { EvaluationRecord, EvaluatorRole, RoleInputStatus } from "@/types/scoring"

type AggregatePanelProps = {
  evaluation: EvaluationRecord
  history: EvaluationRecord[]
  onUpdateRoleInput: (
    role: EvaluatorRole,
    field: "status" | "note",
    value: RoleInputStatus | string
  ) => void
}

const gateTone = {
  reject: "bg-[#f7e4df] text-danger",
  hold: "bg-amber-100 text-amber-800",
  improve: "bg-blue-100 text-blue-800",
  pass: "bg-emerald-100 text-emerald-800",
  prioritize: "bg-accentSoft text-accent"
} as const

export function AggregatePanel({ evaluation, history, onUpdateRoleInput }: AggregatePanelProps) {
  const matchedRules = scoringGateRules[evaluation.aggregate.gateResult]

  return (
    <section className="workbench-panel py-3">
      <div className="section-toolbar">
        <div className="min-w-0">
          <p className="section-kicker">Result</p>
          <h2 className="panel-title mt-1.5">Aggregate score and gate</h2>
        </div>
      </div>

      <div className="workbench-gutter min-h-0 space-y-4 overflow-y-auto">
        <div className="right-rail-section">
          <p className="field-label">Gate Result</p>
          <div className="flex flex-wrap items-center gap-3">
            <span className={`badge ${gateTone[evaluation.aggregate.gateResult]}`}>{evaluation.aggregate.gateResult}</span>
            <span className="text-sm text-muted">Current decision state for this evaluation record</span>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="metric-card">
            <p className="field-label">Weighted Score</p>
            <p className="text-2xl font-serif text-ink">{evaluation.aggregate.weightedScore}</p>
          </div>
          <div className="metric-card">
            <p className="field-label">Average</p>
            <p className="text-2xl font-serif text-ink">{evaluation.aggregate.dimensionAverage}</p>
          </div>
          <div className="metric-card">
            <p className="field-label">Confidence</p>
            <p className="text-2xl font-serif text-ink">{evaluation.aggregate.confidence}</p>
          </div>
        </div>

        <div className="right-rail-section">
          <p className="field-label">Matched Rules</p>
          <ul className="space-y-2 text-sm text-muted">
            {matchedRules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </div>

        <div className="right-rail-section">
          <p className="field-label">Dimension Scores</p>
          <div className="space-y-2">
            {Object.entries(evaluation.dimensions).map(([dimension, entry]) => (
              <div key={dimension} className="grid grid-cols-[88px_minmax(0,1fr)] gap-3 text-sm">
                <span className="text-muted">{dimension}</span>
                <span className="text-ink">
                  {entry.score} / confidence {entry.confidence}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="right-rail-section">
          <p className="field-label">Evidence Coverage</p>
          <div className="space-y-2">
            {Object.entries(evaluation.dimensions).map(([dimension, entry]) => (
              <div key={dimension} className="grid grid-cols-[88px_minmax(0,1fr)] gap-3 text-sm">
                <span className="text-muted">{dimension}</span>
                <span className="text-ink">{entry.evidence.length} items</span>
              </div>
            ))}
          </div>
        </div>

        <RoleScorePanel evaluation={evaluation} onUpdateRoleInput={onUpdateRoleInput} />

        <div>
          <p className="field-label">Execution</p>
          <div className="space-y-2 text-sm text-muted">
            <p>{evaluation.execution.evaluators.join(", ")}</p>
            <p>{evaluation.execution.version}</p>
            <p>{evaluation.execution.timestamp}</p>
          </div>
        </div>

        <HistoryPanel records={history} />
      </div>
    </section>
  )
}
