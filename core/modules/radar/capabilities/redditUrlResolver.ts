import type { RadarCapabilityDefinition } from "../types/radar.ts"

export type RedditUrlType = "canonical" | "share" | "app_link"

export type ResolvedRedditUrl = {
  original_url: string
  resolved_url: string
  url_type: RedditUrlType
  redirect_count: number
  final_status: number
  resolved_post_id: string | null
}

const REDDIT_HEADERS = {
  "User-Agent": "reddit-insight-desk/1.0"
}

function normalizeRedditUrl(input: string) {
  const url = new URL(input)

  if (url.hostname === "reddit.com") {
    url.hostname = "www.reddit.com"
  }

  url.search = ""
  url.hash = ""

  if (!url.pathname.endsWith("/")) {
    url.pathname = `${url.pathname}/`
  }

  return url.toString()
}

function detectUrlType(input: string): RedditUrlType {
  const url = new URL(input)
  const pathname = url.pathname
  const hostname = url.hostname.toLowerCase()

  if (/\/s\/[^/]+\/?$/.test(pathname)) {
    return "share"
  }

  if (hostname.includes("reddit.app.link") || hostname.includes("www.reddit.com") && pathname.startsWith("/link/")) {
    return "app_link"
  }

  return "canonical"
}

function extractPostId(input: string): string | null {
  const pathname = new URL(input).pathname

  const commentsMatch = pathname.match(/\/comments\/([^/]+)\//)
  if (commentsMatch?.[1]) {
    return commentsMatch[1]
  }

  const shortCommentsMatch = pathname.match(/\/comments\/([^/]+)\/?$/)
  if (shortCommentsMatch?.[1]) {
    return shortCommentsMatch[1]
  }

  return null
}

export const redditUrlResolverCapability: RadarCapabilityDefinition = {
  name: "reddit_url_resolver",
  purpose: "Resolve arbitrary Reddit URLs into a canonical post URL before source fetching.",
  input_schema: {
    reddit_url: "string"
  },
  process_logic: [
    "normalize incoming reddit url",
    "detect canonical, share, or app_link types",
    "follow redirect for share and app links",
    "return canonical post url diagnostics"
  ],
  output_schema: {
    original_url: "string",
    resolved_url: "string",
    url_type: "canonical|share|app_link",
    redirect_count: "number",
    final_status: "number",
    resolved_post_id: "string|null"
  },
  state: "idle|resolving|ready|error",
  trigger: "called before reddit json fetching",
  error_handling: {
    invalid_url: "throw invalid url error",
    unresolved_redirect: "fallback to normalized input url"
  }
}

export async function resolveRedditUrl(input: string): Promise<ResolvedRedditUrl> {
  const originalUrl = input
  const normalizedUrl = normalizeRedditUrl(input)
  const urlType = detectUrlType(normalizedUrl)

  if (urlType === "canonical") {
    return {
      original_url: originalUrl,
      resolved_url: normalizedUrl,
      url_type: urlType,
      redirect_count: 0,
      final_status: 200,
      resolved_post_id: extractPostId(normalizedUrl)
    }
  }

  try {
    const response = await fetch(normalizedUrl, {
      headers: REDDIT_HEADERS,
      redirect: "follow",
      next: { revalidate: 0 }
    } as RequestInit & { next?: { revalidate: number } })

    const resolvedUrl = response.url ? normalizeRedditUrl(response.url) : normalizedUrl

    return {
      original_url: originalUrl,
      resolved_url: resolvedUrl,
      url_type: urlType,
      redirect_count: resolvedUrl === normalizedUrl ? 0 : 1,
      final_status: response.status,
      resolved_post_id: extractPostId(resolvedUrl)
    }
  } catch {
    return {
      original_url: originalUrl,
      resolved_url: normalizedUrl,
      url_type: urlType,
      redirect_count: 0,
      final_status: 0,
      resolved_post_id: extractPostId(normalizedUrl)
    }
  }
}

