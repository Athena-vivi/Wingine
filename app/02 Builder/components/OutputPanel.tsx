import { useState } from "react"

import { UITemplateCard } from "./UITemplateCard"

import type { Capability, Output, OutputStatus, OutputType, UITemplate } from "@/types/builder"

type OutputPanelProps = {
  output: Output
  linkedCapabilities: Capability[]
  template: UITemplate
  onUpdate: <K extends keyof Output>(field: K, value: Output[K]) => void
}

const outputTypes: OutputType[] = ["not-started", "plugin", "web-tool", "script"]
const statuses: OutputStatus[] = ["draft", "in-progress", "testing", "done"]

const statusTone: Record<OutputStatus, string> = {
  draft: "bg-stone-200 text-stone-700",
  "in-progress": "bg-amber-100 text-amber-800",
  testing: "bg-blue-100 text-blue-800",
  done: "bg-emerald-100 text-emerald-800"
}

export function OutputPanel({ output, linkedCapabilities, template, onUpdate }: OutputPanelProps) {
  const notesPreview = output.notes?.trim() ? output.notes : "No notes yet."
  const hasLink = Boolean(output.link?.trim())
  const [showCapabilities, setShowCapabilities] = useState(linkedCapabilities.length > 0)
  const [showTemplate, setShowTemplate] = useState(false)
  const [showControls, setShowControls] = useState(true)

  return (
    <aside className="workbench-panel py-3">
      <div className="mb-3 flex shrink-0 items-center justify-between gap-3 border-b pb-3 pl-6 pr-8 xl:pl-7 xl:pr-9">
        <div className="min-w-0">
          <p className="section-kicker">Inspector</p>
          <h2 className="panel-title mt-1.5">Output, assets, and controls</h2>
          <div className="section-meta">
            <span>{output.status}</span>
            <span>{output.outputType}</span>
            <span>{linkedCapabilities.length} active capabilities</span>
          </div>
        </div>
      </div>

      <div className="min-h-0 space-y-4 overflow-y-auto pl-6 pr-8 xl:pl-7 xl:pr-9">
        <section className="inspector-section">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted">Output State</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className={`badge ${statusTone[output.status]}`}>{output.status}</span>
                <span className="badge bg-accentSoft text-accent">{output.outputType}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted">Link Readiness</p>
              <p className={`mt-2 text-sm font-medium ${hasLink ? "text-success" : "text-muted"}`}>
                {hasLink ? "Ready" : "Missing"}
              </p>
            </div>
          </div>
        </section>

        <section className="inspector-section">
          <button
            className="mb-2 flex w-full items-center justify-between gap-3 text-left"
            type="button"
            onClick={() => setShowControls((current) => !current)}
          >
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted">Inspector Controls</p>
            <span className="text-xs text-muted">{showControls ? "Hide" : "Edit"}</span>
          </button>
          {showControls ? (
            <div className="space-y-3">
              <div>
                <label className="field-label" htmlFor="output-type">
                  Output Type
                </label>
                <select
                  id="output-type"
                  className="field-input"
                  value={output.outputType}
                  onChange={(event) => onUpdate("outputType", event.target.value as OutputType)}
                >
                  {outputTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="field-label" htmlFor="output-status">
                  Status
                </label>
                <select
                  id="output-status"
                  className="field-input"
                  value={output.status}
                  onChange={(event) => onUpdate("status", event.target.value as OutputStatus)}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="field-label" htmlFor="output-link">
                  Link
                </label>
                <input
                  id="output-link"
                  className="field-input"
                  value={output.link || ""}
                  onChange={(event) => onUpdate("link", event.target.value)}
                  placeholder="Optional local or preview link"
                />
              </div>

              <div>
                <label className="field-label" htmlFor="output-notes">
                  Notes
                </label>
                <textarea
                  id="output-notes"
                  className="field-input min-h-[150px]"
                  value={output.notes || ""}
                  onChange={(event) => onUpdate("notes", event.target.value)}
                  placeholder="Capture decisions, blockers, or what the next build should ship."
                />
              </div>
            </div>
          ) : null}
        </section>

        <section className="inspector-section">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted">Output Summary</p>
            <span className="text-xs text-muted">{hasLink ? "attached" : "empty"}</span>
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-3 text-sm">
              <span className="text-muted">Link</span>
              <span className="truncate text-ink">{output.link?.trim() || "No output link attached yet."}</span>
            </div>
            <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-3 text-sm">
              <span className="text-muted">Notes</span>
              <span className="line-clamp-4 text-ink">{notesPreview}</span>
            </div>
          </div>
        </section>

        <section className="inspector-section">
          <button
            className="mb-2 flex w-full items-center justify-between gap-3 text-left"
            type="button"
            onClick={() => setShowCapabilities((current) => !current)}
          >
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted">Output Depends On</p>
            <span className="text-xs text-muted">
              {linkedCapabilities.length} {showCapabilities ? "Hide" : "Show"}
            </span>
          </button>
          {showCapabilities ? (
            <div className="space-y-2">
              <p className="text-sm text-muted">
                {linkedCapabilities.length > 0
                  ? `This output depends on ${linkedCapabilities.length} linked capabilities.`
                  : "This output does not depend on any linked capability yet."}
              </p>
              <div className="flex flex-wrap gap-2">
                {linkedCapabilities.length > 0 ? (
                  linkedCapabilities.map((capability) => (
                    <span key={capability.id} className="badge bg-accentSoft text-accent">
                      {capability.name}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-muted">No capabilities linked to workflow steps yet.</p>
                )}
              </div>
            </div>
          ) : null}
        </section>

        <section className="inspector-section">
          <button
            className="mb-2 flex w-full items-center justify-between gap-3 text-left"
            type="button"
            onClick={() => setShowTemplate((current) => !current)}
          >
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted">UI Template Asset</p>
            <span className="text-xs text-muted">{showTemplate ? "Hide" : "Show"}</span>
          </button>
          {showTemplate ? <UITemplateCard template={template} /> : null}
        </section>
      </div>
    </aside>
  )
}
