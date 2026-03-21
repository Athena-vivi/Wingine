import type { BettingRecord } from "@/types/betting"

type DecisionPanelProps = {
  record: BettingRecord | null
}

const decisionTone = {
  kill: "bg-[#f7e4df] text-danger",
  hold: "bg-amber-100 text-amber-800",
  explore: "bg-blue-100 text-blue-800",
  double_down: "bg-accentSoft text-accent",
  scale: "bg-emerald-100 text-emerald-800"
} as const

export function DecisionPanel({ record }: DecisionPanelProps) {
  if (!record) {
    return (
      <div className="right-rail-section">
        <p className="field-label">Decision</p>
        <p className="text-sm text-muted">No betting decision yet</p>
      </div>
    )
  }

  return (
    <div className="right-rail-section">
      <p className="field-label">Decision</p>
      <div className="flex flex-wrap items-center gap-3">
        <span className={`badge ${decisionTone[record.decision]}`}>{record.decision}</span>
        <span className="text-sm text-muted">{record.reason}</span>
      </div>
    </div>
  )
}
