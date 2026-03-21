import type { OutputStatus, Problem } from "@/types/builder"

type ProblemSelectorProps = {
  problems: Problem[]
  selectedProblemId: string
  selectedTitle: string
  selectedTag: string
  selectedStatus: OutputStatus
  onSelect: (problemId: string) => void
}

const statusTone: Record<OutputStatus, string> = {
  draft: "bg-stone-200 text-stone-700",
  "in-progress": "bg-amber-100 text-amber-800",
  testing: "bg-blue-100 text-blue-800",
  done: "bg-emerald-100 text-emerald-800"
}

export function ProblemSelector({
  problems,
  selectedProblemId,
  selectedTitle,
  selectedTag,
  selectedStatus,
  onSelect
}: ProblemSelectorProps) {
  return (
    <header className="sticky top-0 z-20 flex shrink-0 items-center rounded-[24px] border border-border/70 bg-shell/95 p-4 shadow-[0_8px_22px_rgba(37,33,29,0.05)] backdrop-blur md:p-5">
      <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex min-w-0 flex-col gap-3">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-muted">Builder Console</p>
            <h1 className="mt-2 font-serif text-[2rem] leading-tight text-ink md:text-[2.3rem]">{selectedTitle}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
            <span className="badge bg-accentSoft text-accent">{selectedTag}</span>
            <span className={`badge ${statusTone[selectedStatus]}`}>{selectedStatus}</span>
          </div>
        </div>

        <div className="w-full max-w-sm">
          <label className="field-label" htmlFor="problem-selector">
            Problem Selector
          </label>
          <select
            id="problem-selector"
            className="field-input"
            value={selectedProblemId}
            onChange={(event) => onSelect(event.target.value)}
          >
            {problems.map((problem) => (
              <option key={problem.id} value={problem.id}>
                {problem.title}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  )
}
