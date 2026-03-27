export type PostToChannelChannel = "xiaohongshu" | "twitter" | "substack" | "seo"

export type PostToChannelContentInput = {
  title?: string
  post_content: string
  comments?: string
  channel: PostToChannelChannel
  mode?: "auto" | "direct"
}

export type PostToChannelContentResult = {
  decision: "invest" | "skip" | "hold"
  reason: string
  confidence: number
  channel_content: {
    channel: PostToChannelChannel
    title: string
    body: string
  } | null
}
