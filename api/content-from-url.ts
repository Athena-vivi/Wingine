import type { VercelRequest, VercelResponse } from "@vercel/node"
import { contentDecisionHandler } from "../usecases/contentDecision/contentDecisionHandler.ts"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { source_url, channel = "xiaohongshu", mode = "auto" } = req.body || {}

    if (!source_url) {
      return res.status(400).json({ error: "source_url is required" })
    }

    const result = await contentDecisionHandler({
      source_url,
      mode
    })

    if (result.decision !== "invest" && mode !== "direct") {
      return res.status(200).json(result)
    }

    const asset = "content_asset" in result ? result.content_asset : null

    const content = {
      channel,
      title: asset?.topic || "Generated Content",
      body: `${asset?.angle || "No angle available"}\n\n${asset?.outline?.join("\n") || ""}`
    }

    return res.status(200).json({
      decision: result.decision,
      reason: result.reason,
      confidence: result.confidence,
      content
    })
  } catch (err) {
    return res.status(500).json({ error: "internal_error", detail: String(err) })
  }
}
