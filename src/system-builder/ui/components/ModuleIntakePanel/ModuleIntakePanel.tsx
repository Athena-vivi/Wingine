import type { ModuleCandidateStatus, ModuleRegistry } from "../../../../system-builder/types.js"

const statusClassMap: Record<ModuleCandidateStatus, string> = {
  backlog: "bg-slate-800 text-slate-200",
  reviewing: "bg-sky-400/15 text-sky-100",
  testing: "bg-amber-400/15 text-amber-100",
  adopted: "bg-emerald-400/15 text-emerald-100",
  rejected: "bg-rose-400/15 text-rose-100"
}

type ModuleIntakePanelProps = {
  moduleRegistry: ModuleRegistry | null
}

export function ModuleIntakePanel({ moduleRegistry }: ModuleIntakePanelProps) {
  return (
    <div className="grid gap-3">
      {moduleRegistry?.candidates.map((candidate) => (
        <div
          key={candidate.id}
          className="rounded-[14px] border border-slate-400/10 bg-slate-950/35 p-3"
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="m-0 text-[14px] font-semibold text-slate-50">{candidate.name}</p>
              <p className="m-0 text-[12px] text-slate-400/70">
                {candidate.sourceType} · {candidate.sourceName}
              </p>
            </div>
            <span
              className={[
                "rounded-full px-2.5 py-1 text-[11px] font-medium capitalize",
                statusClassMap[candidate.status]
              ].join(" ")}
            >
              {candidate.status}
            </span>
          </div>

          <p className="mb-3 text-sm leading-6 text-slate-100/85">{candidate.purpose}</p>

          <dl className="grid gap-2 text-[13px] text-slate-200/80">
            <div className="flex justify-between gap-3">
              <dt className="text-slate-400/70">Target Layer</dt>
              <dd className="m-0 capitalize">{candidate.targetLayer}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-400/70">Integration</dt>
              <dd className="m-0">{candidate.integrationMode}</dd>
            </div>
          </dl>

          {candidate.notes ? (
            <div className="mt-3 rounded-[12px] border border-slate-400/8 bg-slate-900/60 p-2.5">
              <p className="m-0 text-[12px] leading-6 text-slate-300/78">{candidate.notes}</p>
            </div>
          ) : null}
        </div>
      )) ?? <p className="m-0 text-slate-300/70">No module candidates available.</p>}
    </div>
  )
}
