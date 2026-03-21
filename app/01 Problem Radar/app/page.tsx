"use client"

import { useEffect, useState } from "react"
import { AlertCircle, CheckCircle2 } from "lucide-react"

import { InputPanel } from "@/components/InputPanel"
import { InsightPanel } from "@/components/InsightPanel"
import { OutputPanel } from "@/components/OutputPanel"
import type {
  AnalyzeRequestBody,
  AnalyzeResponse,
  GeneratedContent,
  OutputBundle,
  RadarRecord,
  RadarSaveResult
} from "@/types/radar"
import type { RadarProtocolRequest, RadarProtocolResponse } from "@/types/protocol"

const initialForm: AnalyzeRequestBody = {
  redditUrl: "",
  postText: "",
  comments: "",
  notes: ""
}

const createRequestId = (capability: string) => `${capability}_${Math.random().toString(36).slice(2, 10)}`

export default function HomePage() {
  const [form, setForm] = useState<AnalyzeRequestBody>(initialForm)
  const [analysis, setAnalysis] = useState<AnalyzeResponse | null>(null)
  const [radarRecord, setRadarRecord] = useState<RadarRecord | null>(null)
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)
  const [outputBundle, setOutputBundle] = useState<OutputBundle | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [saveMessage, setSaveMessage] = useState("")

  const invokeProtocol = async <T extends Record<string, unknown>, R extends Record<string, unknown>>(
    capability: RadarProtocolRequest<T>["capability"],
    payload: T,
    context: RadarProtocolRequest<T>["context"] = {}
  ) => {
    const response = await fetch(`/api/protocol/${capability}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        request_id: createRequestId(String(capability)),
        capability,
        caller: {
          type: "human-ui",
          id: "problem-radar"
        },
        payload,
        context
      } satisfies RadarProtocolRequest<T>)
    })

    if (!response.ok) {
      throw new Error("Protocol request failed.")
    }

    const data = (await response.json()) as RadarProtocolResponse<R>

    if (data.status !== "success" || !data.data) {
      throw new Error(data.error?.message || "Protocol invocation failed.")
    }

    return data.data
  }

  useEffect(() => {
    const loadWorkspace = async () => {
      try {
        const data = await invokeProtocol<
          { initialForm: AnalyzeRequestBody },
          { workspace_state: { form: AnalyzeRequestBody; outputBundle: OutputBundle | null } }
        >("workspace_load", { initialForm }, {})

        setForm(data.workspace_state.form)
        setOutputBundle(data.workspace_state.outputBundle)
      } catch {
        setForm(initialForm)
      }
    }

    void loadWorkspace()
  }, [])

  const updateForm = (field: keyof AnalyzeRequestBody, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value
    }))
  }

  const handleAnalyze = async () => {
    setAnalyzing(true)
    setStatus(null)
    setSaveMessage("")

    try {
      const data = await invokeProtocol<
        AnalyzeRequestBody,
        {
          source: AnalyzeResponse["source"]
          analysis: AnalyzeResponse
          sourceMode: "reddit" | "manual"
          outputBundle: OutputBundle
        }
      >("source_analyze", form, {
        source_url: form.redditUrl?.trim() || undefined
      })

      setAnalysis(data.analysis)
      setRadarRecord(data.analysis.radar)
      setGeneratedContent(null)
      setOutputBundle(data.outputBundle)
      setStatus({
        type: "success",
        message: "Analysis is ready. You can save the radar record or generate content next."
      })
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "An unknown error occurred."
      })
    } finally {
      setAnalyzing(false)
    }
  }

  const handleSaveRadar = async () => {
    if (!radarRecord) return

    setSaving(true)
    setStatus(null)

    try {
      const data = await invokeProtocol<
        { radarRecord: RadarRecord; generatedContent?: GeneratedContent | null },
        {
          saveResult: RadarSaveResult
          outputBundle: OutputBundle
        }
      >("radar_save", { radarRecord, generatedContent }, {
        source_url: radarRecord.source_url
      })

      setSaveMessage(
        `Radar ${data.saveResult.action} successfully (${data.saveResult.mode}, id: ${data.saveResult.recordId}).`
      )
      setStatus({
        type: "success",
        message: "The radar record has been synced."
      })
      setRadarRecord(data.outputBundle.radarRecord)
      setOutputBundle(data.outputBundle)
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Save failed."
      })
    } finally {
      setSaving(false)
    }
  }

  const handleGenerateContent = async () => {
    if (!analysis || !radarRecord) return

    setGenerating(true)
    setStatus(null)

    try {
      const data = await invokeProtocol<
        {
          insight: analysis.insightDraft,
          radarRecord
        },
        {
          generatedContent: GeneratedContent
          outputBundle: OutputBundle
        }
      >("content_generate", {
        insight: analysis.insightDraft,
        radarRecord
      })

      setGeneratedContent(data.generatedContent)
      setOutputBundle(data.outputBundle)
      setStatus({
        type: "success",
        message: "Drafts for all four platforms are ready."
      })
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Content generation failed."
      })
    } finally {
      setGenerating(false)
    }
  }

  const handleRewrite = async (platform: string, instruction: string) => {
    if (!generatedContent) return

    const data = await invokeProtocol<
      {
        instruction: string
        platform: string
        generatedContent: GeneratedContent
      },
      {
        result: string
        generatedContent: GeneratedContent | null
        outputBundle: OutputBundle
      }
    >("content_rewrite", {
      instruction,
      platform,
      generatedContent
    }, {
      platform
    })

    setGeneratedContent(data.generatedContent)
    setOutputBundle(data.outputBundle)
  }

  return (
    <main className="h-full overflow-hidden px-4 py-6 md:px-6 xl:px-10">
      <div className="mx-auto flex h-full max-w-[1700px] flex-col">
        <header className="mb-6 shrink-0 rounded-[28px] border border-white/70 bg-white/75 p-6 shadow-card backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gray-500">
                User Problem Radar Assistant
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gray-950 md:text-4xl">
                Problem Radar
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-600 md:text-base">
                Turn seller questions from multiple source platforms into structured market insight, push them into a Feishu radar table, and generate multi-platform draft content in one flow.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-gray-50 px-4 py-3 text-sm text-gray-600">
              Single-page workflow: Analyze {"->"} Add to Radar {"->"} Save to Feishu {"->"} Generate {"->"} Rewrite {"->"} Copy
            </div>
          </div>
        </header>

        {status ? (
          <div
            className={`mb-6 shrink-0 flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${
              status.type === "success"
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {status.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {status.message}
          </div>
        ) : null}

        <div className="grid min-h-0 flex-1 gap-6 xl:grid-cols-[1fr_1.6fr_1.4fr]">
          <InputPanel form={form} loading={analyzing} onChange={updateForm} onAnalyze={handleAnalyze} />
          <InsightPanel
            analysis={analysis}
            analyzing={analyzing}
            onAddToRadar={() => {
              if (analysis) {
                setRadarRecord(analysis.radar)
                setStatus({
                  type: "success",
                  message: "Radar data confirmed. You can save it now."
                })
              }
            }}
            onGenerateContent={handleGenerateContent}
          />
          <OutputPanel
            radarRecord={radarRecord}
            generatedContent={generatedContent}
            saving={saving}
            generating={generating}
            saveMessage={saveMessage}
            onSaveRadar={handleSaveRadar}
            onRewrite={handleRewrite}
          />
        </div>
      </div>
    </main>
  )
}
