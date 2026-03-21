import type { OutputStatus, Problem } from "@/types/builder"

type ProblemInfoPanelProps = {
  problems: Problem[]
  problem: Problem
  selectedStatus: OutputStatus
  onSelect: (problemId: string) => void
}

const rows: Array<{ key: keyof Problem; label: string }> = [
  { key: "context", label: "Context" },
  { key: "frequency", label: "Frequency" },
  { key: "cost", label: "Cost" }
]

const statusTone: Record<OutputStatus, string> = {
  draft: "bg-stone-200 text-stone-700",
  "in-progress": "bg-amber-100 text-amber-800",
  testing: "bg-blue-100 text-blue-800",
  done: "bg-emerald-100 text-emerald-800"
}

export function ProblemInfoPanel({ problems, problem, selectedStatus, onSelect }: ProblemInfoPanelProps) {
  return (
    <section className="workbench-panel py-3">
      <div className="section-toolbar">
        <div className="min-w-0">
          <p className="section-kicker">Problem Info</p>
          <h2 className="panel-title mt-1.5">{problem.title}</h2>
          <div className="section-meta">
            <span className={`badge ${statusTone[selectedStatus]}`}>{selectedStatus}</span>
            <span className="badge bg-accentSoft text-accent">{problem.tag}</span>
          </div>
        </div>
      </div>

      <div className="workbench-gutter min-h-0 space-y-4 overflow-y-auto">
        <div>
          <label className="field-label" htmlFor="problem-selector">
            Problem Selector
          </label>
          <select
            id="problem-selector"
            className="field-input"
            value={problem.id}
            onChange={(event) => onSelect(event.target.value)}
          >
            {problems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </div>

        <div className="inspector-section space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
            <span>{problem.source || "Unknown source"}</span>
            <span>&middot;</span>
            <span>{problem.tag || "No tag"}</span>
            <span>&middot;</span>
            <span>{selectedStatus}</span>
          </div>
          <div>
            <p className="mb-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted">Description</p>
            <p className="text-sm leading-6 text-ink">{problem.description || "Not set"}</p>
          </div>
        </div>

        <div className="space-y-2">
          {rows.map((row) => (
            <div key={row.key} className="grid grid-cols-[76px_minmax(0,1fr)] gap-3 text-sm">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted">{row.label}</p>
              <p className="leading-5 text-ink">{problem[row.key] || "Not set"}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
