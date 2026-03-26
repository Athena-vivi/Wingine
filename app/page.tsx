"use client"

import { useState } from "react"

type Result = {
  decision: "invest" | "skip" | "hold"
  reason: string
  confidence: number
  channel_content: {
    channel: "xiaohongshu" | "twitter" | "substack" | "seo"
    title: string
    body: string
  } | null
}

export default function Home() {
  const [title, setTitle] = useState("")
  const [postContent, setPostContent] = useState("")
  const [comments, setComments] = useState("")
  const [channel, setChannel] = useState<"xiaohongshu" | "twitter" | "substack" | "seo">("xiaohongshu")
  const [mode, setMode] = useState<"auto" | "direct">("auto")
  const [result, setResult] = useState<Result | null>(null)

  async function handleSubmit() {
    const res = await fetch("/api/post-to-channel-content", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        post_content: postContent,
        comments,
        channel,
        mode
      })
    })

    const data = await res.json()
    setResult(data)
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>Post To Channel Content</h1>

      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <textarea
        placeholder="Post Content"
        value={postContent}
        onChange={(e) => setPostContent(e.target.value)}
        style={{ width: "100%", minHeight: 140, marginBottom: 10 }}
      />

      <textarea
        placeholder="Comments"
        value={comments}
        onChange={(e) => setComments(e.target.value)}
        style={{ width: "100%", minHeight: 100, marginBottom: 10 }}
      />

      <select value={channel} onChange={(e) => setChannel(e.target.value as "xiaohongshu" | "twitter" | "substack" | "seo")}>
        <option value="xiaohongshu">Xiaohongshu</option>
        <option value="twitter">Twitter</option>
        <option value="substack">Substack</option>
        <option value="seo">SEO</option>
      </select>

      <select
        value={mode}
        onChange={(e) => setMode(e.target.value as "auto" | "direct")}
        style={{ display: "block", marginTop: 10 }}
      >
        <option value="auto">auto</option>
        <option value="direct">direct</option>
      </select>

      <button onClick={handleSubmit} style={{ display: "block", marginTop: 10 }}>
        Generate
      </button>

      {result ? (
        <section style={{ marginTop: 20 }}>
          <p><strong>Decision:</strong> {result.decision}</p>
          <p><strong>Reason:</strong> {result.reason}</p>
          <p><strong>Confidence:</strong> {result.confidence}</p>
          {result.channel_content ? (
            <div style={{ marginTop: 16 }}>
              <p><strong>Channel:</strong> {result.channel_content.channel}</p>
              <p><strong>Title:</strong> {result.channel_content.title}</p>
              <pre style={{ whiteSpace: "pre-wrap" }}>{result.channel_content.body}</pre>
            </div>
          ) : (
            <p><strong>Channel Content:</strong> null</p>
          )}
        </section>
      ) : null}
    </main>
  )
}
