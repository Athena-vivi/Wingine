import { NextResponse } from "next/server"

import { runContentRewrite } from "@/capabilities/contentRewriteEngine"
import type { RewriteRequestBody } from "@/types/radar"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RewriteRequestBody

    if (!body.text?.trim()) {
      return NextResponse.json({ error: "Text is required." }, { status: 400 })
    }

    const result = await runContentRewrite({
      text: body.text.trim(),
      instruction: body.instruction?.trim() || "",
      platform: body.platform
    })
    return NextResponse.json({ result })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Rewrite route failed."
      },
      { status: 500 }
    )
  }
}
