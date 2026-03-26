"use client"

import { useState } from "react"

export default function Home() {
  const [url, setUrl] = useState("")
  const [channel, setChannel] = useState("xiaohongshu")
  const [result, setResult] = useState<any>(null)

  async function handleSubmit() {
    const res = await fetch("/api/content-from-url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        source_url: url,
        channel,
        mode: "auto"
      })
    })

    const data = await res.json()
    setResult(data)
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>Content Generator</h1>

      <input
        placeholder="Paste Reddit URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <select value={channel} onChange={(e) => setChannel(e.target.value)}>
        <option value="xiaohongshu">Xiaohongshu</option>
        <option value="twitter">Twitter</option>
        <option value="substack">Substack</option>
      </select>

      <button onClick={handleSubmit} style={{ display: "block", marginTop: 10 }}>
        Generate
      </button>

      <pre style={{ marginTop: 20, whiteSpace: "pre-wrap" }}>
        {result ? JSON.stringify(result, null, 2) : ""}
      </pre>
    </main>
  )
}
