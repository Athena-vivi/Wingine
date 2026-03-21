import type { BettingRecord } from "@/types/betting"

type HistoryPanelProps = {
  history: BettingRecord[]
}

export function HistoryPanel({ history }: HistoryPanelProps) {
  return (
    <div className="right-rail-section">
      <p className="field-label">History</p>
      {history.length === 0 ? (
        <p className="text-sm text-muted">No history yet</p>
      ) : (
        <div className="space-y-3">
          {history.map((record) => (
            <div key={record.id} className="rounded-md border border-[rgba(168,151,132,0.18)] bg-white/10 px-3 py-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-ink">{record.decision}</span>
                <span className="text-xs text-muted">{record.timestamp.slice(0, 10)}</span>
              </div>
              <p className="mt-2 text-sm text-muted">{record.reason}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
