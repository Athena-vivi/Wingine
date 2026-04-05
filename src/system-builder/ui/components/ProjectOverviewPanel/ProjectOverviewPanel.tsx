import type { ProjectStatus } from "../../../../system-builder/types.js"

type ProjectOverviewPanelProps = {
  projectStatus: ProjectStatus | null
}

export function ProjectOverviewPanel({ projectStatus }: ProjectOverviewPanelProps) {
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[14px] border border-slate-400/10 bg-slate-950/35 p-3">
          <p className="mb-1 text-[11px] uppercase tracking-[0.12em] text-slate-400/70">Current Phase</p>
          <p className="m-0 capitalize text-slate-50">
            {projectStatus?.currentPhase ?? "unavailable"}
          </p>
        </div>
        <div className="rounded-[14px] border border-slate-400/10 bg-slate-950/35 p-3">
          <p className="mb-1 text-[11px] uppercase tracking-[0.12em] text-slate-400/70">Health</p>
          <p className="m-0 capitalize text-slate-50">{projectStatus?.health ?? "unavailable"}</p>
        </div>
      </div>

      <div className="rounded-[14px] border border-slate-400/10 bg-slate-950/35 p-3">
        <p className="mb-1 text-[11px] uppercase tracking-[0.12em] text-slate-400/70">Summary</p>
        <p className="m-0 leading-6 text-slate-100/90">
          {projectStatus?.summary ?? "No project summary available."}
        </p>
      </div>

      <div className="rounded-[14px] border border-slate-400/10 bg-slate-950/35 p-3">
        <p className="mb-1 text-[11px] uppercase tracking-[0.12em] text-slate-400/70">Current Focus</p>
        <p className="m-0 leading-6 text-slate-100/90">
          {projectStatus?.currentFocus ?? "No current focus available."}
        </p>
      </div>

      <div className="rounded-[14px] border border-slate-400/10 bg-slate-950/35 p-3">
        <p className="mb-1 text-[11px] uppercase tracking-[0.12em] text-slate-400/70">Next Step</p>
        <p className="m-0 leading-6 text-slate-100/90">
          {projectStatus?.nextStep ?? "No next step available."}
        </p>
      </div>

      <div className="rounded-[14px] border border-slate-400/10 bg-slate-950/35 p-3">
        <p className="mb-2 text-[11px] uppercase tracking-[0.12em] text-slate-400/70">Blockers</p>
        {projectStatus?.blockers?.length ? (
          <ul className="m-0 list-disc space-y-2 pl-5 text-slate-200/85">
            {projectStatus.blockers.map((blocker) => (
              <li key={blocker} className="leading-6">
                {blocker}
              </li>
            ))}
          </ul>
        ) : (
          <p className="m-0 text-slate-300/70">No blockers recorded.</p>
        )}
      </div>
    </div>
  )
}
