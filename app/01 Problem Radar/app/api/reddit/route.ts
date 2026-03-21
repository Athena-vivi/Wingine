import { NextResponse } from "next/server"

import { fetchRedditSource } from "@/capabilities/redditSourceFetcher"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get("url")

  if (!url) {
    return NextResponse.json({ error: "url query parameter is required." }, { status: 400 })
  }

  try {
    const source = await fetchRedditSource(url)
    return NextResponse.json(source)
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Reddit route failed."
      },
      { status: 500 }
    )
  }
}
