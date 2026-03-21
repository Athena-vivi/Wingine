import type { BettingRecord } from "@/types/betting"

type AllocationPanelProps = {
  record: BettingRecord | null
}

export function AllocationPanel({ record }: AllocationPanelProps) {
  if (!record) {
    return (
      <div className="right-rail-section">
        <p className="field-label">Allocation</p>
        <p className="text-sm text-muted">No resource allocation yet</p>
      </div>
    )
  }

  return (
    <div className="right-rail-section">
      <p className="field-label">Allocation</p>
      <div className="space-y-2">
        <div className="grid grid-cols-[84px_minmax(0,1fr)] gap-3 text-sm">
          <span className="text-muted">Time</span>
          <span className="text-ink">{record.resourceAllocation.time}</span>
        </div>
        <div className="grid grid-cols-[84px_minmax(0,1fr)] gap-3 text-sm">
          <span className="text-muted">Priority</span>
          <span className="text-ink">{record.resourceAllocation.priority}</span>
        </div>
        <div className="grid grid-cols-[84px_minmax(0,1fr)] gap-3 text-sm">
          <span className="text-muted">Action</span>
          <span className="text-ink">{record.resourceAllocation.action}</span>
        </div>
      </div>
    </div>
  )
}
