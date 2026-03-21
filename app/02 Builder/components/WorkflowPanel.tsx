"use client"

import { useState } from "react"

import type { Capability, WorkflowStep } from "@/types/builder"

type WorkflowPanelProps = {
  steps: WorkflowStep[]
  capabilities: Capability[]
  selectedStepId: string | null
  onSelect: (stepId: string | null) => void
  onAdd: () => void
  onUpdate: (stepId: string, value: string) => void
  onAssignCapability: (stepId: string, capabilityId: string) => void
  onDelete: (stepId: string) => void
  onMove: (stepId: string, direction: "up" | "down") => void
}

export function WorkflowPanel({
  steps,
  capabilities,
  selectedStepId,
  onSelect,
  onAdd,
  onUpdate,
  onAssignCapability,
  onDelete,
  onMove
}: WorkflowPanelProps) {
  const executableCount = steps.filter((step) => step.capabilityId).length
  const blockedCount = steps.length - executableCount
  const [editingStepId, setEditingStepId] = useState<string | null>(null)

  return (
    <section className="workbench-panel py-3">
      <div className="section-toolbar">
        <div className="min-w-0 flex flex-wrap items-center gap-3 text-sm">
          <p className="section-kicker">Workflow</p>
          <span className="text-muted">Problem to action path</span>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
            <span>{steps.length} steps</span>
            <span>{executableCount} executable</span>
            <span>{blockedCount} blocked</span>
          </div>
        </div>
        <button className="solid-button" type="button" onClick={onAdd}>
          Add step
        </button>
      </div>

      <div className="workbench-gutter mb-2 grid shrink-0 grid-cols-[52px_minmax(0,1fr)_170px_92px_132px] gap-3 pb-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted">
        <span>Step</span>
        <span>Summary</span>
        <span>Uses</span>
        <span>State</span>
        <span className="text-right">Actions</span>
      </div>

      <div className="min-h-0 overflow-y-auto">
        {steps.map((step, index) => {
          const linkedCapability = capabilities.find((capability) => capability.id === step.capabilityId)
          const isSelected = selectedStepId === step.id
          const isEditing = editingStepId === step.id
          const executionState = linkedCapability ? "Executable" : "Blocked"

          return (
            <div key={step.id} className="border-b workbench-divider-soft last:border-b-0">
              <div
                className={`workbench-gutter grid grid-cols-[52px_minmax(0,1fr)_170px_92px_132px] items-center gap-3 py-2.5 transition ${
                  isSelected ? "bg-white/42" : "hover:bg-white/28"
                }`}
              >
                <button
                  className="flex items-center gap-2 text-left"
                  type="button"
                  onClick={() => onSelect(isSelected ? null : step.id)}
                >
                  <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border/80 bg-[#f5eee5] text-[0.68rem] font-semibold text-warm">
                    {index + 1}
                  </span>
                </button>

                <button
                  className="min-w-0 text-left"
                  type="button"
                  onClick={() => onSelect(isSelected ? null : step.id)}
                >
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm leading-5 text-ink">{step.text.trim() || "Untitled workflow step"}</p>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.12em] ${
                        linkedCapability ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {executionState}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted">
                    <span>Uses</span>
                    {linkedCapability ? (
                      <span className="inline-flex max-w-full truncate rounded-full bg-accentSoft px-2 py-0.5 text-[0.64rem] font-semibold uppercase tracking-[0.12em] text-accent">
                        {linkedCapability.name}
                      </span>
                    ) : (
                      <span>Unlinked</span>
                    )}
                  </div>
                </button>

                <div className="min-w-0">
                  {linkedCapability ? (
                    <span className="inline-flex max-w-full truncate rounded-full bg-accentSoft px-2.5 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-accent">
                      {linkedCapability.name}
                    </span>
                  ) : (
                    <span className="text-sm text-muted">Unlinked</span>
                  )}
                </div>

                <div>
                  {linkedCapability ? (
                    <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-emerald-800">
                      Executable
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-amber-800">
                      Blocked
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-end gap-1.5">
                  <button className="tool-button" type="button" onClick={() => onMove(step.id, "up")} disabled={index === 0}>
                    Up
                  </button>
                  <button
                    className="tool-button"
                    type="button"
                    onClick={() => onMove(step.id, "down")}
                    disabled={index === steps.length - 1}
                  >
                    Down
                  </button>
                  <button className="danger-button" type="button" onClick={() => onDelete(step.id)}>
                    Del
                  </button>
                </div>
              </div>

              {isSelected ? (
                <div className="workbench-gutter border-t workbench-divider-soft py-3">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted">Step Detail</p>
                    {isEditing ? (
                      <button className="soft-button" type="button" onClick={() => setEditingStepId(null)}>
                        Done
                      </button>
                    ) : (
                      <button className="soft-button" type="button" onClick={() => setEditingStepId(step.id)}>
                        Edit
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="grid gap-3 xl:grid-cols-[220px_minmax(0,1fr)]">
                      <div>
                        <label className="field-label" htmlFor={`workflow-capability-${step.id}`}>
                          Linked Capability
                        </label>
                        <select
                          id={`workflow-capability-${step.id}`}
                          className="field-input"
                          value={step.capabilityId || ""}
                          onChange={(event) => onAssignCapability(step.id, event.target.value)}
                        >
                          <option value="">No linked capability</option>
                          {capabilities.map((capability) => (
                            <option key={capability.id} value={capability.id}>
                              {capability.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="field-label" htmlFor={`workflow-text-${step.id}`}>
                          Step Editor
                        </label>
                        <textarea
                          id={`workflow-text-${step.id}`}
                          className="field-input min-h-[96px]"
                          value={step.text}
                          onChange={(event) => onUpdate(step.id, event.target.value)}
                          placeholder="Describe the next concrete action in the workflow."
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-3 xl:grid-cols-[220px_minmax(0,1fr)]">
                      <div>
                        <p className="field-label">Uses</p>
                        <p className="text-sm leading-5 text-ink">{linkedCapability?.name || "Unlinked"}</p>
                      </div>

                      <div>
                        <p className="field-label">Summary</p>
                        <p className="text-sm leading-6 text-ink">{step.text.trim() || "No step summary yet."}</p>
                        <p className="mt-2 text-xs text-muted">
                          {linkedCapability
                            ? "This step is connected to a capability and can feed the output chain."
                            : "This step is still blocked until a capability is attached."}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </section>
  )
}
