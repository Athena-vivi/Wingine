import type { BettingCandidate } from "@/types/betting"

type CandidateSelectorProps = {
  candidates: BettingCandidate[]
  selectedCandidateId: string
  onSelect: (candidateId: string) => void
}

export function CandidateSelector({ candidates, selectedCandidateId, onSelect }: CandidateSelectorProps) {
  return (
    <div>
      <label className="field-label" htmlFor="candidate-selector">
        Candidate Selector
      </label>
      <select
        id="candidate-selector"
        className="field-input"
        value={selectedCandidateId}
        onChange={(event) => onSelect(event.target.value)}
      >
        {candidates.map((candidate) => (
          <option key={candidate.id} value={candidate.id}>
            {candidate.objectType} / {candidate.objectName}
          </option>
        ))}
      </select>
    </div>
  )
}
