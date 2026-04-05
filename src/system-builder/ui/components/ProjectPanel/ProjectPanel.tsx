"use client"

import type { SystemProject } from "../../../../system-builder/types.js"

type ProjectPanelProps = {
  open: boolean
  projects: SystemProject[]
  selectedProjectId: string
  getProjectHref: (projectId: string) => string
  onClose: () => void
}

export function ProjectPanel({
  open,
  projects,
  selectedProjectId,
  getProjectHref,
  onClose
}: ProjectPanelProps) {
  if (!open) {
    return null
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close projects panel"
        className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <aside className="fixed top-12 left-[240px] z-40 h-[calc(100vh-48px)] w-[320px] border-r border-slate-400/12 bg-[#0c1119]/96 p-5 shadow-[18px_0_48px_rgba(2,6,23,0.42)] backdrop-blur-[14px] max-[980px]:top-[72px] max-[980px]:left-0 max-[980px]:h-[calc(100vh-72px)] max-[980px]:w-[min(320px,100vw)]">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="mb-1 text-[11px] uppercase tracking-[0.14em] text-slate-400/72">Projects</p>
            <h2 className="m-0 text-[22px] font-semibold text-slate-50">Projects</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[12px] border border-slate-400/12 bg-slate-900/70 px-3 py-2 text-slate-200"
          >
            Close
          </button>
        </div>

        <div className="mb-5 h-px bg-slate-400/10" />

        <div className="max-h-[calc(100vh-188px)] overflow-y-auto pr-1 max-[980px]:max-h-[calc(100vh-212px)]">
          <div className="grid gap-[10px]">
            {projects.map((project) => {
              const isActive = project.id === selectedProjectId

              return (
                <a
                  key={project.id}
                  href={getProjectHref(project.id)}
                  onClick={onClose}
                  className={[
                    "block rounded-2xl border px-3 py-[14px] text-left transition-colors",
                    isActive
                      ? "border-sky-400/30 bg-slate-900/82"
                      : "border-transparent bg-slate-900/50 hover:border-sky-400/30 hover:bg-slate-900/82"
                  ].join(" ")}
                >
                  <span className="block text-[14px] font-semibold text-slate-50">{project.name}</span>
                  <span className="mt-1.5 block text-[12px] leading-6 text-slate-300/70">
                    {project.summary}
                  </span>
                </a>
              )
            })}
          </div>
        </div>
      </aside>
    </>
  )
}
