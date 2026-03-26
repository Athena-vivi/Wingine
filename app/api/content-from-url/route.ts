import { contentDecisionHandler } from "../../../usecases/contentDecision/contentDecisionHandler.ts"

export async function POST(req: Request) {
  try {
    const { source_url, channel = "xiaohongshu", mode = "auto" } = await req.json()

    if (!source_url) {
      return Response.json({ error: "source_url is required" }, { status: 400 })
    }

    const result = await contentDecisionHandler({
      source_url,
      mode
    })

    if (result.decision !== "invest" && mode !== "direct") {
      return Response.json(result)
    }

    const asset = "content_asset" in result ? result.content_asset : null

    const content = {
      channel,
      title: asset?.topic || "Generated Content",
      body: `${asset?.angle || "No angle available"}\n\n${asset?.outline?.join("\n") || ""}`
    }

    return Response.json({
      decision: result.decision,
      reason: result.reason,
      confidence: result.confidence,
      content
    })
  } catch (err) {
    return Response.json({ error: "internal_error", detail: String(err) }, { status: 500 })
  }
}
