import type { ScoringDimension, TypeProfile } from "@/types/scoring"

type TypeProfilePanelProps = {
  profile: TypeProfile
}

const dimensionLabels: Record<ScoringDimension, string> = {
  value: "Value",
  quality: "Quality",
  reliability: "Reliability",
  leverage: "Leverage"
}

export function TypeProfilePanel({ profile }: TypeProfilePanelProps) {
  return (
    <div className="right-rail-section">
      <p className="field-label">Type Profile</p>
      <div className="space-y-3">
        {(Object.keys(profile.dimensions) as ScoringDimension[]).map((dimension) => {
          const entry = profile.dimensions[dimension]

          return (
            <div key={dimension} className="rounded-md border border-[rgba(168,151,132,0.18)] bg-white/10 px-3 py-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-ink">{dimensionLabels[dimension]}</span>
                <span className="text-xs uppercase tracking-[0.16em] text-muted">{profile.objectType}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-ink">{entry.meaning}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
