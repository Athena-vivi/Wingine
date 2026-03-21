"use client"

import { Copy, Loader2, Wand2 } from "lucide-react"
import { useState } from "react"

interface ContentCardProps {
  platform: string
  content: string
  onRewrite: (platform: string, instruction: string) => Promise<void>
}

export function ContentCard({ platform, content, onRewrite }: ContentCardProps) {
  const [instruction, setInstruction] = useState("")
  const [copyLabel, setCopyLabel] = useState("Copy")
  const [rewriting, setRewriting] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopyLabel("Copied")
    window.setTimeout(() => setCopyLabel("Copy"), 1200)
  }

  const handleRewrite = async () => {
    setRewriting(true)
    try {
      await onRewrite(platform, instruction)
      setInstruction("")
    } finally {
      setRewriting(false)
    }
  }

  return (
    <article className="rounded-3xl border border-border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">Platform</p>
          <h3 className="mt-1 text-lg font-semibold text-gray-900">{platform}</h3>
        </div>
        <button className="ghost-button gap-2" onClick={handleCopy}>
          <Copy className="h-4 w-4" />
          {copyLabel}
        </button>
      </div>

      <div className="mt-4 rounded-2xl bg-gray-50 p-4">
        <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">{content}</p>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <input
          className="field-input"
          placeholder="Example: make it sharper / shorter / fact only"
          value={instruction}
          onChange={(event) => setInstruction(event.target.value)}
        />
        <button className="ghost-button gap-2 self-start" onClick={handleRewrite} disabled={rewriting}>
          {rewriting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
          Rewrite
        </button>
      </div>
    </article>
  )
}
