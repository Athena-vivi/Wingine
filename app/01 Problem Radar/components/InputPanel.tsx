"use client"

import { Loader2, Link2, NotebookPen, TextCursorInput } from "lucide-react"

import type { AnalyzeRequestBody } from "@/types/radar"

interface InputPanelProps {
  form: AnalyzeRequestBody
  loading: boolean
  onChange: (field: keyof AnalyzeRequestBody, value: string) => void
  onAnalyze: () => void
}

export function InputPanel({ form, loading, onChange, onAnalyze }: InputPanelProps) {
  return (
    <section className="panel-card flex h-full min-h-0 flex-col overflow-hidden p-5">
      <div className="mb-6 shrink-0">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">Material Intake</p>
        <h2 className="mt-2 text-2xl font-semibold text-gray-900">Source Input</h2>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          Paste a source URL or enter the post and comments manually. The current workflow can read Reddit links and falls back to manual text when needed.
        </p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        <div>
          <label className="field-label" htmlFor="redditUrl">
            <span className="inline-flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              Source Link
            </span>
          </label>
          <input
            id="redditUrl"
            className="field-input"
            placeholder="https://www.reddit.com/r/... or another source URL"
            value={form.redditUrl ?? ""}
            onChange={(event) => onChange("redditUrl", event.target.value)}
          />
        </div>

        <div>
          <label className="field-label" htmlFor="postText">
            <span className="inline-flex items-center gap-2">
              <TextCursorInput className="h-4 w-4" />
              Source Post Text
            </span>
          </label>
          <textarea
            id="postText"
            className="field-input min-h-[150px]"
            placeholder="Paste the source post body here."
            value={form.postText ?? ""}
            onChange={(event) => onChange("postText", event.target.value)}
          />
        </div>

        <div>
          <label className="field-label" htmlFor="comments">
            Source Comments
          </label>
          <textarea
            id="comments"
            className="field-input min-h-[160px]"
            placeholder="One comment per line, or paste a combined comment block."
            value={form.comments ?? ""}
            onChange={(event) => onChange("comments", event.target.value)}
          />
        </div>

        <div>
          <label className="field-label" htmlFor="notes">
            <span className="inline-flex items-center gap-2">
              <NotebookPen className="h-4 w-4" />
              Notes
            </span>
          </label>
          <textarea
            id="notes"
            className="field-input min-h-[120px]"
            placeholder="Capture context, hypotheses, or follow-up notes."
            value={form.notes ?? ""}
            onChange={(event) => onChange("notes", event.target.value)}
          />
        </div>
      </div>

      <button className="primary-button mt-6 w-full shrink-0 gap-2" onClick={onAnalyze} disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {loading ? "Analyzing..." : "Analyze"}
      </button>
    </section>
  )
}
