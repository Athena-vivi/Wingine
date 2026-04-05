"use client"

import { useState } from "react"
import type { ActiveSpace, SystemProject } from "../../../../system-builder/types.js"
import { ProjectPanel } from "../ProjectPanel/ProjectPanel.js"
import { SpaceSwitcher } from "../SpaceSwitcher/SpaceSwitcher.js"

type SidebarProps = {
  activeSection: "overview" | "capabilities" | ActiveSpace
  projects: SystemProject[]
  selectedProjectId: string
  defaultProjectId: string
}

export function Sidebar({
  activeSection,
  projects,
  selectedProjectId,
  defaultProjectId
}: SidebarProps) {
  const [projectPanelOpen, setProjectPanelOpen] = useState(false)
  const currentProjectId = selectedProjectId || defaultProjectId

  function getSpaceHref(space: ActiveSpace | "capabilities") {
    if (space === "capabilities") {
      return "/capabilities"
    }

    return `/workspace?projectId=${currentProjectId}&space=${space}`
  }

  function getProjectHref(projectId: string) {
    const space = activeSection === "overview" || activeSection === "capabilities"
      ? "builder-space"
      : activeSection

    return `/workspace?projectId=${projectId}&space=${space}`
  }

  return (
    <>
      <aside className="flex h-[calc(100vh-48px)] w-[240px] shrink-0 flex-col overflow-hidden border-r border-slate-400/10 bg-[#0a0f17] px-[18px] py-6 max-[980px]:h-auto max-[980px]:w-full max-[980px]:px-4 max-[980px]:py-[18px]">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-[14px] border border-sky-400/30 bg-linear-to-br from-sky-400/25 to-emerald-400/12 text-[14px] font-bold tracking-[0.08em] text-sky-100">
            WB
          </div>
          <div>
            <p className="mb-1 text-[11px] uppercase tracking-[0.18em] text-slate-400/70">Wingine</p>
            <h2 className="m-0 text-[18px] font-semibold text-slate-50">System Workspace</h2>
          </div>
        </div>

        <div className="my-[22px] h-px bg-slate-400/10" />

        <a
          href="/overview"
          className={[
            "block rounded-2xl border px-3 py-3 text-left text-[14px] font-medium transition-colors",
            activeSection === "overview"
              ? "border-violet-400/25 bg-violet-400/10 text-violet-100"
              : "border-transparent bg-slate-900/50 text-slate-200 hover:border-violet-400/20 hover:bg-slate-900/82"
          ].join(" ")}
        >
          System Overview
        </a>

        <div className="my-[22px] h-px bg-slate-400/10" />

        <SpaceSwitcher activeSpace={activeSection === "overview" ? undefined : activeSection} getSpaceHref={getSpaceHref} />

        <div className="my-[22px] h-px bg-slate-400/10" />

        <div className="flex-1" />

        <div className="mb-[22px] h-px bg-slate-400/10" />

        <button
          type="button"
          onClick={() => setProjectPanelOpen(true)}
          className="w-full rounded-2xl border border-slate-400/12 bg-slate-900/50 px-3 py-3 text-left text-[14px] font-medium text-slate-100 transition-colors hover:border-slate-300/16 hover:bg-slate-900/82"
        >
          Projects
        </button>

        <div className="my-[22px] h-px bg-slate-400/10" />

        <button
          type="button"
          className="w-full rounded-2xl border border-yellow-400/25 bg-yellow-400/8 px-[14px] py-3 text-yellow-200"
        >
          + New Project
        </button>
      </aside>

      <ProjectPanel
        open={projectPanelOpen}
        projects={projects}
        selectedProjectId={selectedProjectId}
        getProjectHref={getProjectHref}
        onClose={() => setProjectPanelOpen(false)}
      />
    </>
  )
}
