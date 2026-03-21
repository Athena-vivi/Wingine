"use client"

import type { EvaluationRecord, ScoringDimension, TypeProfile } from "@/types/scoring"

type DimensionScorePanelProps = {
  evaluation: EvaluationRecord
  profile: TypeProfile
  onUpdateScore: (
    dimension: ScoringDimension,
    field: "score" | "confidence" | "note" | "evidence",
    value: number | string | string[]
  ) => void
}

const dimensions: ScoringDimension[] = ["value", "quality", "reliability", "leverage"]
const labels: Record<ScoringDimension, string> = {
  value: "Value",
  quality: "Quality",
  reliability: "Reliability",
  leverage: "Leverage"
}

export function DimensionScorePanel({ evaluation, profile, onUpdateScore }: DimensionScorePanelProps) {
  return (
    <section className="workbench-panel py-3">
      <div className="section-toolbar">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <p className="section-kicker">Dimensions</p>
            <span className="text-muted">Unified four-dimension scoring</span>
          </div>
          <div className="section-meta">
            {dimensions.map((dimension) => (
              <span key={dimension}>
                {labels[dimension]} {evaluation.dimensions[dimension].score}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="workbench-gutter min-h-0 overflow-y-auto">
        <div className="grid gap-4 xl:grid-cols-2">
          {dimensions.map((dimension) => {
            const profileEntry = profile.dimensions[dimension]
            const scoreEntry = evaluation.dimensions[dimension]

            return (
              <div key={dimension} className="metric-card">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="section-kicker">{labels[dimension]}</p>
                    <p className="mt-2 text-sm leading-6 text-ink">{profileEntry.meaning}</p>
                  </div>
                  <span className="badge bg-stone-200 text-stone-700">{scoreEntry.ownerRole}</span>
                </div>

                <div className="mt-4 grid gap-3 xl:grid-cols-[96px_minmax(0,1fr)_96px_minmax(0,1fr)]">
                  <label className="field-label" htmlFor={`${dimension}-score`}>
                    Score
                  </label>
                  <input
                    id={`${dimension}-score`}
                    className="field-input"
                    max={5}
                    min={0}
                    step={0.1}
                    type="number"
                    value={scoreEntry.score}
                    onChange={(event) => onUpdateScore(dimension, "score", Number(event.target.value))}
                  />

                  <label className="field-label" htmlFor={`${dimension}-confidence`}>
                    Confidence
                  </label>
                  <input
                    id={`${dimension}-confidence`}
                    className="field-input"
                    max={1}
                    min={0}
                    step={0.05}
                    type="number"
                    value={scoreEntry.confidence}
                    onChange={(event) => onUpdateScore(dimension, "confidence", Number(event.target.value))}
                  />
                </div>

                <div className="mt-4 grid gap-4 xl:grid-cols-2">
                  <div>
                    <p className="field-label">High Score</p>
                    <ul className="space-y-1 text-sm text-muted">
                      {profileEntry.highScoreRule.map((rule) => (
                        <li key={rule}>{rule}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="field-label">Low Score</p>
                    <ul className="space-y-1 text-sm text-muted">
                      {profileEntry.lowScoreRule.map((rule) => (
                        <li key={rule}>{rule}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="field-label" htmlFor={`${dimension}-note`}>
                    Note
                  </label>
                  <textarea
                    id={`${dimension}-note`}
                    className="field-input min-h-[96px]"
                    value={scoreEntry.note}
                    onChange={(event) => onUpdateScore(dimension, "note", event.target.value)}
                  />
                </div>

                <div className="mt-4">
                  <label className="field-label" htmlFor={`${dimension}-evidence`}>
                    Evidence
                  </label>
                  <textarea
                    id={`${dimension}-evidence`}
                    className="field-input min-h-[88px]"
                    placeholder="One line per evidence item"
                    value={scoreEntry.evidence.join("\n")}
                    onChange={(event) =>
                      onUpdateScore(
                        dimension,
                        "evidence",
                        event.target.value
                          .split("\n")
                          .map((item) => item.trim())
                          .filter(Boolean)
                      )
                    }
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
