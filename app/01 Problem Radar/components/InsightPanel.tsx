"use client"

import { FilePlus2, Sparkles } from "lucide-react"

import type { AnalyzeResponse } from "@/types/radar"

interface InsightPanelProps {
  analysis: AnalyzeResponse | null
  analyzing: boolean
  onAddToRadar: () => void
  onGenerateContent: () => void
}

const sections: Array<{
  key: keyof AnalyzeResponse
  label: string
}> = [
  { key: "postSummary", label: "Post Summary" },
  { key: "commentThemes", label: "Comment Themes" },
  { key: "sellerProblem", label: "Seller Problem" },
  { key: "industrySignal", label: "Industry Signal" },
  { key: "reason", label: "Reason" },
  { key: "insightDraft", label: "Insight Draft" }
]

export function InsightPanel({
  analysis,
  analyzing,
  onAddToRadar,
  onGenerateContent
}: InsightPanelProps) {
  return (
    <section className="panel-card flex h-full min-h-0 flex-col overflow-hidden p-5">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">Insight Engine</p>
          <h2 className="mt-2 text-2xl font-semibold text-gray-900">AI Insight Analysis</h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            This panel turns post context, comment consensus, and seller pain into a structured decision.
          </p>
        </div>

        {analysis ? (
          <div className="rounded-2xl border border-border bg-gray-50 px-3 py-2 text-right text-sm">
            <p className="text-gray-500">Record Worthy</p>
            <p className={`font-semibold ${analysis.recordWorthy ? "text-green-700" : "text-amber-700"}`}>
              {analysis.recordWorthy ? "true" : "false"}
            </p>
          </div>
        ) : null}
      </div>

      {!analysis ? (
        <div className="flex flex-1 items-center justify-center rounded-3xl border border-dashed border-border bg-gray-50/60 px-6 text-center text-sm leading-6 text-gray-500">
          {analyzing ? "Extracting source context and comment themes..." : "Run Analyze to populate this panel with structured insight."}
        </div>
      ) : (
        <div className="flex-1 min-h-0 space-y-4 overflow-y-auto pr-1">
          {sections.map((section) => (
            <article key={section.key} className="rounded-2xl border border-border bg-gray-50/70 p-4">
              <h3 className="text-sm font-semibold text-gray-900">{section.label}</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                {String(analysis[section.key])}
              </p>
            </article>
          ))}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button className="ghost-button flex-1 gap-2" onClick={onAddToRadar} disabled={!analysis}>
          <FilePlus2 className="h-4 w-4" />
          Add to Radar
        </button>
        <button className="primary-button flex-1 gap-2" onClick={onGenerateContent} disabled={!analysis}>
          <Sparkles className="h-4 w-4" />
          Generate Content
        </button>
      </div>
    </section>
  )
}
