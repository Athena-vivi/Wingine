import type { RadarCapabilityDefinition, RedditComment, RedditPostData, RedditSourceDiagnostics } from "../types/radar.ts"
import { resolveRedditUrl } from "./redditUrlResolver.ts"

const REDDIT_HEADERS = {
  "User-Agent": "reddit-insight-desk/1.0"
}

export function buildRedditDiagnosticsFromInput(input: string, error?: string): RedditSourceDiagnostics {
  const normalizedUrl = new URL(input).toString()
  const shareUrlDetected = /\/s\/[^/]+\/?$/.test(new URL(normalizedUrl).pathname)

  return {
    original_url: input,
    resolved_url: normalizedUrl,
    url_type: shareUrlDetected ? "share" : "canonical",
    redirect_count: 0,
    final_status: 0,
    resolved_post_id: null,
    normalized_url: normalizedUrl,
    raw_json_available: false,
    post_title: "Manual Reddit Input",
    post_selftext_length: 0,
    comments_count: 0,
    first_3_comment_snippets: [],
    share_url_detected: shareUrlDetected,
    canonical_url_changed: false,
    canonical_resolution_failed: shareUrlDetected,
    fetch_error: error
  }
}

function buildJsonUrl(input: string) {
  const normalized = input.endsWith("/") ? input : `${input}/`
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

function buildDiagnostics(input: {
  normalizedUrl: string
  rawJsonAvailable: boolean
  postTitle: string
  selftext: string
  comments: RedditComment[]
  rawCommentChildrenCount: number
  morePlaceholderCount: number
  shareUrlDetected: boolean
  canonicalUrlChanged: boolean
  canonicalResolutionFailed: boolean
  originalUrl: string
  resolvedUrl: string
  urlType: "canonical" | "share" | "app_link"
  redirectCount: number
  finalStatus: number
  resolvedPostId: string | null
}): RedditSourceDiagnostics {
  return {
    original_url: input.originalUrl,
    resolved_url: input.resolvedUrl,
    url_type: input.urlType,
    redirect_count: input.redirectCount,
    final_status: input.finalStatus,
    resolved_post_id: input.resolvedPostId,
    normalized_url: input.normalizedUrl,
    raw_json_available: input.rawJsonAvailable,
    post_title: input.postTitle,
    post_selftext_length: input.selftext.length,
    comments_count: input.comments.length,
    first_3_comment_snippets: input.comments.slice(0, 3).map((item) => item.body.slice(0, 160)),
    raw_comment_children_count: input.rawCommentChildrenCount,
    more_placeholder_count: input.morePlaceholderCount,
    share_url_detected: input.shareUrlDetected,
    canonical_url_changed: input.canonicalUrlChanged,
    canonical_resolution_failed: input.canonicalResolutionFailed
  }
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
  const resolved = await resolveRedditUrl(redditUrl)
  const jsonUrl = buildJsonUrl(resolved.resolved_url)
  const response = await fetch(jsonUrl, {
    headers: REDDIT_HEADERS,
    next: { revalidate: 0 }
  } as RequestInit & { next?: { revalidate: number } })

  if (!response.ok) {
    throw new Error(`Failed to load Reddit post: ${response.status}`)
  }

  const payload = (await response.json()) as Array<{
    data?: { children?: Array<{ data?: Record<string, unknown> }> }
  }>

  const post = payload?.[0]?.data?.children?.[0]?.data
  const comments = payload?.[1]?.data?.children ?? []
  const morePlaceholderCount = comments.filter((item) => String(item?.data?.body ?? "") === "").length
  const extractedComments = extractTopComments(comments)

  if (!post) {
    throw new Error("Reddit post payload is empty.")
  }

  return {
    url: resolved.resolved_url,
    title: String(post.title ?? ""),
    selftext: String(post.selftext ?? ""),
    subreddit: String(post.subreddit ?? ""),
    score: Number(post.score ?? 0),
    comments: extractedComments,
    diagnostics: buildDiagnostics({
      originalUrl: resolved.original_url,
      resolvedUrl: resolved.resolved_url,
      urlType: resolved.url_type,
      redirectCount: resolved.redirect_count,
      finalStatus: response.status,
      resolvedPostId: resolved.resolved_post_id,
      normalizedUrl: resolved.resolved_url,
      rawJsonAvailable: true,
      postTitle: String(post.title ?? ""),
      selftext: String(post.selftext ?? ""),
      comments: extractedComments,
      rawCommentChildrenCount: comments.length,
      morePlaceholderCount,
      shareUrlDetected: resolved.url_type === "share",
      canonicalUrlChanged: resolved.original_url !== resolved.resolved_url,
      canonicalResolutionFailed: resolved.url_type !== "canonical" && resolved.original_url === resolved.resolved_url
    })
  }
}


