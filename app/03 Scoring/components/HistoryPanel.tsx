import type { EvaluationRecord } from "@/types/scoring"

type HistoryPanelProps = {
  records: EvaluationRecord[]
}

const gateTone = {
  reject: "bg-[#f7e4df] text-danger",
  hold: "bg-amber-100 text-amber-800",
  improve: "bg-blue-100 text-blue-800",
  pass: "bg-emerald-100 text-emerald-800",
  prioritize: "bg-accentSoft text-accent"
} as const

export function HistoryPanel({ records }: HistoryPanelProps) {
  return (
    <div className="right-rail-section">
      <p className="field-label">History</p>
      {records.length === 0 ? (
        <p className="text-sm text-muted">No history yet</p>
      ) : (
        <div className="space-y-3">
          {records.map((record) => (
            <div key={record.id} className="rounded-md border border-[rgba(168,151,132,0.18)] bg-white/10 px-3 py-3">
              <div className="flex items-center justify-between gap-3">
                <span className={`badge ${gateTone[record.aggregate.gateResult]}`}>{record.aggregate.gateResult}</span>
                <span className="text-xs text-muted">{record.execution.version}</span>
              </div>
              <div className="mt-3 space-y-1 text-sm">
                <div className="grid grid-cols-[78px_minmax(0,1fr)] gap-3">
                  <span className="text-muted">Score</span>
                  <span className="text-ink">{record.aggregate.weightedScore}</span>
                </div>
                <div className="grid grid-cols-[78px_minmax(0,1fr)] gap-3">
                  <span className="text-muted">Confidence</span>
                  <span className="text-ink">{record.aggregate.confidence}</span>
                </div>
                <div className="grid grid-cols-[78px_minmax(0,1fr)] gap-3">
                  <span className="text-muted">Date</span>
                  <span className="text-ink">{record.execution.timestamp.slice(0, 10)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
