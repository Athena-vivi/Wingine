import type { RadarCapabilityDefinition, RedditComment, RedditPostData } from "../types/radar.ts"

function normalizeRedditUrl(input: string) {
  const url = new URL(input)
  url.search = ""
  url.hash = ""

  if (!url.pathname.endsWith("/")) {
    url.pathname = `${url.pathname}/`
  }

  return url.toString()
}

function buildJsonUrl(input: string) {
  const normalized = normalizeRedditUrl(input)
  return normalized.endsWith(".json") ? normalized : `${normalized}.json?limit=20`
}

function sanitizeCommentBody(body: string) {
  return body.replace(/\s+/g, " ").trim()
}

function extractTopComments(children: Array<{ data?: Record<string, unknown> }>): RedditComment[] {
  return children
    .map((child) => child.data)
    .filter(Boolean)
    .map((comment) => ({
      author: String(comment?.author ?? "unknown"),
      score: Number(comment?.score ?? 0),
      body: sanitizeCommentBody(String(comment?.body ?? ""))
    }))
    .filter((comment) => comment.body.length > 0 && comment.body !== "[deleted]")
    .sort((a, b) => b.score - a.score)
    .slice(0, 20)
}

export const redditSourceFetcherCapability: RadarCapabilityDefinition = {
  name: "reddit_source_fetcher",
  purpose: "Fetch and normalize reddit post material from a source url.",
  input_schema: {
    reddit_url: "string"
  },
  process_logic: [
    "normalize reddit url",
    "build reddit json endpoint",
    "fetch reddit payload",
    "extract post fields",
    "extract ranked comments",
    "return normalized reddit source"
  ],
  output_schema: {
    source: "reddit_post_data"
  },
  state: "idle|loading|ready|error",
  trigger: "called when source mode is reddit",
  error_handling: {
    invalid_url: "throw invalid url error",
    fetch_failed: "throw fetch error",
    empty_payload: "throw payload empty error"
  }
}

export async function fetchRedditSource(redditUrl: string): Promise<RedditPostData> {
  const jsonUrl = buildJsonUrl(redditUrl)
  const response = await fetch(jsonUrl, {
    headers: {
      "User-Agent": "reddit-insight-desk/1.0"
    },
    next: { revalidate: 0 }
  })

  if (!response.ok) {
    throw new Error(`Failed to load Reddit post: ${response.status}`)
  }

  const payload = (await response.json()) as Array<{
    data?: { children?: Array<{ data?: Record<string, unknown> }> }
  }>

  const post = payload?.[0]?.data?.children?.[0]?.data
  const comments = payload?.[1]?.data?.children ?? []

  if (!post) {
    throw new Error("Reddit post payload is empty.")
  }

  return {
    url: normalizeRedditUrl(redditUrl),
    title: String(post.title ?? ""),
    selftext: String(post.selftext ?? ""),
    subreddit: String(post.subreddit ?? ""),
    score: Number(post.score ?? 0),
    comments: extractTopComments(comments)
  }
}


