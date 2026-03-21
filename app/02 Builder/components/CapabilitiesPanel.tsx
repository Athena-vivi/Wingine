"use client"

import { useState } from "react"

import { coreSkillLibrary, secondarySkillLibrary, skillDisplay } from "@/data/skills"
import type { BuilderCapabilityDetail, Capability, WorkflowStep } from "@/types/builder"

type CapabilitiesPanelProps = {
  items: Capability[]
  steps: WorkflowStep[]
  activeCapabilityIds: string[]
  selectedCapabilityId: string | null
  capabilityDetail: BuilderCapabilityDetail
  onSelect: (capabilityId: string | null) => void
  onAdd: () => void
  onAddFromSkill: (skillId: string) => void
  onUpdate: (capabilityId: string, field: "name" | "description", value: string) => void
  onDelete: (capabilityId: string) => void
}

export function CapabilitiesPanel({
  items,
  steps,
  activeCapabilityIds,
  selectedCapabilityId,
  capabilityDetail,
  onSelect,
  onAdd,
  onAddFromSkill,
  onUpdate,
  onDelete
}: CapabilitiesPanelProps) {
  const sortedItems = [...items].sort((a, b) => {
    const aActive = activeCapabilityIds.includes(a.id)
    const bActive = activeCapabilityIds.includes(b.id)

    if (aActive === bActive) {
      return a.name.localeCompare(b.name)
    }

    return aActive ? -1 : 1
  })
  const [editingCapabilityId, setEditingCapabilityId] = useState<string | null>(null)
  const [libraryMode, setLibraryMode] = useState<"core" | "secondary">("core")
  const visibleLibrary = libraryMode === "core" ? coreSkillLibrary : secondarySkillLibrary

  return (
    <section className="workbench-panel py-3">
      <div className="section-toolbar">
        <div className="min-w-0 flex flex-wrap items-center gap-3 text-sm">
          <p className="section-kicker">Capabilities</p>
          <span className="text-muted">Modules this path needs</span>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
            <span>{items.length} attached</span>
            <span>{activeCapabilityIds.length} active</span>
            <span>{coreSkillLibrary.length + secondarySkillLibrary.length} in library</span>
          </div>
        </div>
        <button className="soft-button" type="button" onClick={onAdd}>
          Add capability
        </button>
      </div>

      <div className="min-h-0">
        <div className="workbench-gutter grid h-full min-h-0 gap-0 py-3 xl:grid-cols-[272px_minmax(0,1fr)]">
          <div className="sticky top-0 self-start border-r workbench-divider-soft pr-6">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted">Library</p>
              <div className="flex items-center gap-1">
                <button
                  className={libraryMode === "core" ? "soft-button" : "tool-button"}
                  type="button"
                  onClick={() => setLibraryMode("core")}
                >
                  Core
                </button>
                <button
                  className={libraryMode === "secondary" ? "soft-button" : "tool-button"}
                  type="button"
                  onClick={() => setLibraryMode("secondary")}
                >
                  Secondary
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              {visibleLibrary.map((skill) => (
                <button
                  key={skill.id}
                  className="tool-button w-full justify-start"
                  type="button"
                  onClick={() => onAddFromSkill(skill.id)}
                >
                  {skillDisplay[skill.id as keyof typeof skillDisplay]?.name ?? skill.id}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-0 overflow-y-auto">
            <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
              {sortedItems.map((item) => {
                const isActive = activeCapabilityIds.includes(item.id)
                const isSelected = selectedCapabilityId === item.id
                const usedBySteps = steps
                  .map((step, index) => ({ step, index }))
                  .filter(({ step }) => step.capabilityId === item.id)
                const usedByLabel =
                  usedBySteps.length > 0
                    ? usedBySteps.map(({ step, index }) => step.text.trim() || `Step ${index + 1}`).join(", ")
                    : "No workflow step linked yet"

                return (
                  <div
                    key={item.id}
                    className={`w-full rounded-lg border px-3 py-3 transition ${
                      isSelected
                        ? "border-[rgba(152,134,114,0.42)] bg-white/40"
                        : "border-[rgba(168,151,132,0.22)] bg-white/18 hover:bg-white/28"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <button
                        className="min-w-0 flex-1 text-left"
                        type="button"
                        onClick={() => onSelect(isSelected ? null : item.id)}
                      >
                        <p className="truncate text-sm font-medium leading-5 text-ink">
                          {item.name.trim() || "Untitled capability"}
                        </p>
                        {item.description ? <p className="mt-1 line-clamp-2 text-xs text-muted">{item.description}</p> : null}
                      </button>

                      <button className="danger-button" type="button" onClick={() => onDelete(item.id)}>
                        Delete
                      </button>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span
                        className={`badge ${item.source === "skill-library" ? "bg-accentSoft text-accent" : "bg-[#f2ebe3] text-warm"}`}
                      >
                        {item.source === "skill-library" ? "Skill" : "Custom"}
                      </span>
                      {isActive ? (
                        <span className="badge bg-emerald-100 text-emerald-800">Active</span>
                      ) : (
                        <span className="badge bg-stone-200 text-stone-700">Idle</span>
                      )}
                    </div>

                    <div className="mt-3 text-xs text-muted">
                      <span className="font-medium text-ink">Used by:</span>{" "}
                      {usedByLabel}
                    </div>
                  </div>
                )
              })}
            </div>

            {sortedItems
              .filter((item) => item.id === selectedCapabilityId)
              .map((item) => {
                const isActive = activeCapabilityIds.includes(item.id)
                const isEditing = editingCapabilityId === item.id
                const usedByLabel =
                  capabilityDetail.usedBySteps.length > 0
                    ? capabilityDetail.usedBySteps.join(", ")
                    : "No workflow step linked yet"
                const usedByItems = capabilityDetail.usedBySteps
                const processItems = capabilityDetail.process.slice(0, 4)
                const outputItems = capabilityDetail.output
                const roleText =
                  capabilityDetail.role || "This capability supports the current workflow when attached to a step."
                const trigger = capabilityDetail.trigger || "Linked skill trigger"

                return (
                  <div key={`${item.id}-detail`} className="mt-4 border-t workbench-divider-soft pt-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted">Capability Detail</p>
                        <p className="text-sm font-medium text-ink">{item.name || "Untitled capability"}</p>
                      </div>
                      {isEditing ? (
                        <button className="soft-button" type="button" onClick={() => setEditingCapabilityId(null)}>
                          Done
                        </button>
                      ) : (
                        <button className="soft-button" type="button" onClick={() => setEditingCapabilityId(item.id)}>
                          Edit
                        </button>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="grid gap-x-6 gap-y-3 xl:grid-cols-[96px_minmax(0,1fr)_88px_minmax(0,1fr)]">
                        <label className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted" htmlFor={`capability-name-${item.id}`}>
                          Name
                        </label>
                        <input
                          id={`capability-name-${item.id}`}
                          className="field-input"
                          value={item.name}
                          onChange={(event) => onUpdate(item.id, "name", event.target.value)}
                          placeholder="ex: extract_search_term_data"
                        />

                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted">Status</p>
                        <p className="text-sm text-ink">{isActive ? "Active in workflow" : "Available but unused"}</p>

                        <label
                          className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted"
                          htmlFor={`capability-description-${item.id}`}
                        >
                          Description
                        </label>
                        <textarea
                          id={`capability-description-${item.id}`}
                          className="field-input min-h-[120px]"
                          value={item.description || ""}
                          onChange={(event) => onUpdate(item.id, "description", event.target.value)}
                          placeholder="What this capability should do."
                        />

                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted">Used by</p>
                        <p className="text-sm leading-5 text-muted">{usedByLabel}</p>

                        {item.skillId ? (
                          <>
                            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted">Trigger</p>
                            <p className="text-sm leading-5 text-muted">{trigger}</p>
                          </>
                        ) : null}
                      </div>
                    ) : (
                      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                        <div className="space-y-4">
                          <div>
                            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted">Role</p>
                            <p className="mt-1 text-sm leading-6 text-ink">{roleText}</p>
                          </div>

                          <div>
                            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted">Process</p>
                            {processItems.length > 0 ? (
                              <ol className="mt-2 space-y-1.5 text-sm leading-5 text-muted">
                                {processItems.map((process, index) => (
                                  <li key={`${item.id}-process-${index}`} className="grid grid-cols-[20px_minmax(0,1fr)] gap-2">
                                    <span className="text-ink">{index + 1}.</span>
                                    <span>{process}</span>
                                  </li>
                                ))}
                              </ol>
                            ) : (
                              <p className="mt-1 text-sm leading-5 text-muted">No structured process steps defined yet.</p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted">Status</p>
                            <p className="mt-1 text-sm text-ink">{isActive ? "Active in workflow" : "Available but unused"}</p>
                          </div>

                          <div>
                            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted">Used by</p>
                            {usedByItems.length > 0 ? (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {usedByItems.map((usedBy, index) => (
                                  <span key={`${item.id}-usedby-${index}`} className="badge bg-stone-200 text-stone-700">
                                    {usedBy}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="mt-1 text-sm leading-5 text-muted">{usedByLabel}</p>
                            )}
                          </div>

                          <div>
                            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted">Output</p>
                            {outputItems.length > 0 ? (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {outputItems.map((outputKey) => (
                                  <span key={`${item.id}-output-${outputKey}`} className="badge bg-accentSoft text-accent">
                                    {outputKey}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="mt-1 text-sm leading-5 text-muted">No explicit output contract defined yet.</p>
                            )}
                          </div>

                          {item.skillId ? (
                            <div>
                              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted">Trigger</p>
                              <p className="mt-1 text-sm leading-5 text-muted">{trigger}</p>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
          </div>
        </div>
      </div>
    </section>
  )
}
