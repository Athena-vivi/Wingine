import type { AnalyzeRequestBody, RadarCapabilityDefinition, RedditPostData } from "../types/radar.ts"

export const manualSourceBuilderCapability: RadarCapabilityDefinition = {
  name: "manual_source_builder",
  purpose: "Build normalized source material from manual text input.",
  input_schema: {
    reddit_url: "string",
    post_text: "string",
    comments: "string"
  },
  process_logic: [
    "normalize manual post text",
    "split comments into manual comment list",
    "assign manual defaults",
    "return normalized manual source"
  ],
  output_schema: {
    source: "reddit_post_data"
  },
  state: "idle|building|ready|error",
  trigger: "called when source mode is manual or reddit fetch fails",
  error_handling: {
    empty_manual_content: "return manual source with empty body when needed",
    invalid_input: "fallback to manual defaults"
  }
}

export function buildManualSource(input: AnalyzeRequestBody): RedditPostData {
  const commentList = (input.comments ?? "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 20)
    .map((body, index) => ({
      author: `manual_user_${index + 1}`,
      score: 0,
      body
    }))

  return {
    url: input.redditUrl?.trim() || "manual://local-entry",
    title: "Manual Reddit Input",
    selftext: input.postText?.trim() || "",
    subreddit: "manual",
    score: 0,
    comments: commentList,
    diagnostics: {
      normalized_url: input.redditUrl?.trim() || "manual://local-entry",
      raw_json_available: false,
      post_title: "Manual Reddit Input",
      post_selftext_length: (input.postText?.trim() || "").length,
      comments_count: commentList.length,
      first_3_comment_snippets: commentList.slice(0, 3).map((item) => item.body.slice(0, 160))
    }
  }
}


