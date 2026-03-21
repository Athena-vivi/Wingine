"use client"

import { Database, Loader2 } from "lucide-react"

import { ContentCard } from "@/components/ContentCard"
import type { GeneratedContent, RadarRecord } from "@/types/radar"

interface OutputPanelProps {
  radarRecord: RadarRecord | null
  generatedContent: GeneratedContent | null
  saving: boolean
  generating: boolean
  saveMessage: string
  onSaveRadar: () => void
  onRewrite: (platform: string, instruction: string) => Promise<void>
}

const radarMetrics: Array<{ key: keyof RadarRecord; label: string }> = [
  { key: "problem_type", label: "Problem Type" },
  { key: "business_stage", label: "Stage" },
  { key: "tool_signal", label: "Tool Signal" },
  { key: "trend_signal", label: "Trend Signal" },
  { key: "emotion_signal", label: "Emotion Signal" }
]

export function OutputPanel({
  radarRecord,
  generatedContent,
  saving,
  generating,
  saveMessage,
  onSaveRadar,
  onRewrite
}: OutputPanelProps) {
  return (
    <section className="panel-card flex h-full min-h-0 flex-col overflow-hidden p-5">
      <div className="mb-6 shrink-0">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">Radar & Output</p>
        <h2 className="mt-2 text-2xl font-semibold text-gray-900">Radar Save + Content Output</h2>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          Confirm the radar fields, save them to Feishu, then rewrite or copy the generated drafts per platform.
        </p>
      </div>

      <div className="shrink-0 rounded-3xl border border-border bg-gray-50/70 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Radar Record</h3>
            <p className="mt-1 text-sm text-gray-600">`source_url` is treated as the unique key. Existing rows update, new rows create.</p>
          </div>
          <button className="primary-button gap-2" onClick={onSaveRadar} disabled={!radarRecord || saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
            Save to Radar
          </button>
        </div>

        {radarRecord ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {radarMetrics.map((metric) => (
              <div key={metric.key} className="rounded-2xl border border-border bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">{metric.label}</p>
                <p className="mt-2 text-sm font-medium text-gray-800">{String(radarRecord[metric.key])}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-gray-500">The radar field summary will appear here after analysis.</p>
        )}

        {saveMessage ? <p className="mt-4 text-sm text-green-700">{saveMessage}</p> : null}
      </div>

      <div className="mt-6 flex-1 min-h-0 overflow-y-auto pr-1">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Generated Drafts</h3>
            <p className="mt-1 text-sm text-gray-600">Twitter / Xiaohongshu / WeChat / Substack</p>
          </div>
          {generating ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-2 text-sm text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating
            </div>
          ) : null}
        </div>

        {!generatedContent ? (
          <div className="flex min-h-[240px] items-center justify-center rounded-3xl border border-dashed border-border bg-white/70 px-6 text-center text-sm leading-6 text-gray-500">
            Draft cards for all four platforms will appear here after generation.
          </div>
        ) : (
          <div className="space-y-4">
            <ContentCard platform="Twitter" content={generatedContent.twitter} onRewrite={onRewrite} />
            <ContentCard platform="Xiaohongshu" content={generatedContent.xiaohongshu} onRewrite={onRewrite} />
            <ContentCard platform="WeChat" content={generatedContent.wechat} onRewrite={onRewrite} />
            <ContentCard platform="Substack" content={generatedContent.substack} onRewrite={onRewrite} />
          </div>
        )}
      </div>
    </section>
  )
}
