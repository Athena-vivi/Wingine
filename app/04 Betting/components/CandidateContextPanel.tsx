import { CandidateSelector } from "@/components/CandidateSelector"
import type { BettingCandidate } from "@/types/betting"

type CandidateContextPanelProps = {
  candidates: BettingCandidate[]
  candidate: BettingCandidate
  onSelect: (candidateId: string) => void
}

export function CandidateContextPanel({ candidates, candidate, onSelect }: CandidateContextPanelProps) {
  return (
    <section className="workbench-panel py-3">
      <div className="section-toolbar">
        <div className="min-w-0">
          <p className="section-kicker">Candidate</p>
          <h2 className="panel-title mt-1.5">{candidate.objectName}</h2>
          <div className="section-meta">
            <span className="badge bg-accentSoft text-accent">{candidate.objectType}</span>
            {candidate.status ? <span className="badge bg-stone-200 text-stone-700">{candidate.status}</span> : null}
          </div>
        </div>
      </div>

      <div className="workbench-gutter min-h-0 space-y-4 overflow-y-auto">
        <CandidateSelector candidates={candidates} selectedCandidateId={candidate.id} onSelect={onSelect} />

        <div className="right-rail-section">
          <p className="field-label">Source</p>
          <p className="text-sm text-ink">{candidate.source || "Not set"}</p>
        </div>
      </div>
    </section>
  )
}
