"use client"

import { useEffect, useState } from "react"

import type { UITemplate } from "@/types/builder"

type UITemplateCardProps = {
  template: UITemplate
}

export function UITemplateCard({ template }: UITemplateCardProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setCopied(false)
    }, 1800)

    return () => window.clearTimeout(timeoutId)
  }, [copied])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(template.prompt)
      setCopied(true)
    } catch (error) {
      console.error("Failed to copy UI template prompt.", error)
    }
  }

  return (
    <section className="inspector-section">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted">UI Template Asset</p>
          <p className="mt-1 truncate text-sm font-medium text-ink">{template.name}</p>
        </div>
        <button className="soft-button" type="button" onClick={handleCopy}>
          Copy Prompt
        </button>
      </div>

      <p className="text-sm leading-5 text-muted">{template.description}</p>
      <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted">
        <span>Reusable prompt asset</span>
        <span>{copied ? "Copied" : "Ready"}</span>
      </div>
      <div className="mt-2 max-h-24 overflow-y-auto border-t border-border/50 pt-2 whitespace-pre-line text-sm leading-5 text-muted">
        {template.prompt}
      </div>
    </section>
  )
}
