import { ObjectSelector } from "@/components/ObjectSelector"
import { TypeProfilePanel } from "@/components/TypeProfilePanel"
import { scoringWeights } from "@/data/scoringWeights"
import type { EvaluationRecord, ScoringObject, TypeProfile } from "@/types/scoring"

type ObjectContextPanelProps = {
  objects: ScoringObject[]
  object: ScoringObject
  evaluation: EvaluationRecord
  profile: TypeProfile
  onSelect: (objectId: string) => void
}

export function ObjectContextPanel({ objects, object, evaluation, profile, onSelect }: ObjectContextPanelProps) {
  const weights = scoringWeights[object.type]

  return (
    <section className="workbench-panel py-3">
      <div className="section-toolbar">
        <div className="min-w-0">
          <p className="section-kicker">Object Context</p>
          <h2 className="panel-title mt-1.5">{object.title}</h2>
          <div className="section-meta">
            <span className="badge bg-accentSoft text-accent">{object.type}</span>
            {object.status ? <span className="badge bg-stone-200 text-stone-700">{object.status}</span> : null}
          </div>
        </div>
      </div>

      <div className="workbench-gutter min-h-0 space-y-4 overflow-y-auto">
        <ObjectSelector objects={objects} selectedObjectId={object.id} onSelect={onSelect} />

        <div className="right-rail-section">
          <p className="field-label">Summary</p>
          <p className="text-sm leading-6 text-ink">{object.summary}</p>
        </div>

        <div className="right-rail-section">
          <p className="field-label">Scoring Profile</p>
          <div className="space-y-2">
            <div className="grid grid-cols-[84px_minmax(0,1fr)] gap-3 text-sm">
              <span className="text-muted">Profile</span>
              <span className="text-ink">{evaluation.profileId}</span>
            </div>
            <div className="grid grid-cols-[84px_minmax(0,1fr)] gap-3 text-sm">
              <span className="text-muted">System</span>
              <span className="text-ink">{evaluation.systemId}</span>
            </div>
          </div>
        </div>

        <TypeProfilePanel profile={profile} />

        <div className="space-y-2">
          <div className="grid grid-cols-[84px_minmax(0,1fr)] gap-3 text-sm">
            <span className="text-muted">Source</span>
            <span className="text-ink">{object.source || "Not set"}</span>
          </div>
          {Object.entries(object.metadata || {}).map(([key, value]) => (
            <div key={key} className="grid grid-cols-[84px_minmax(0,1fr)] gap-3 text-sm">
              <span className="text-muted">{key}</span>
              <span className="text-ink">{String(value)}</span>
            </div>
          ))}
        </div>

        <div className="right-rail-section">
          <p className="field-label">Dimension Weights</p>
          <div className="space-y-2">
            {Object.entries(weights).map(([dimension, weight]) => (
              <div key={dimension} className="grid grid-cols-[84px_minmax(0,1fr)] gap-3 text-sm">
                <span className="text-muted capitalize">{dimension}</span>
                <span className="text-ink">{weight}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
