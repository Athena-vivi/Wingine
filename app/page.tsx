"use client"

import { useState } from "react"

export default function Home() {
  const [url, setUrl] = useState("")
  const [channel, setChannel] = useState("xiaohongshu")
  const [modelProvider, setModelProvider] = useState("glm")
  const [model, setModel] = useState("glm-4.5-air")
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
        mode: "auto",
        model_provider: modelProvider,
        model
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

      <select
        value={modelProvider}
        onChange={(e) => setModelProvider(e.target.value)}
        style={{ display: "block", marginTop: 10 }}
      >
        <option value="glm">GLM</option>
        <option value="openai">OpenAI</option>
        <option value="openrouter">OpenRouter</option>
        <option value="none">No Model</option>
      </select>

      <input
        placeholder="Model name"
        value={model}
        onChange={(e) => setModel(e.target.value)}
        style={{ width: "100%", marginTop: 10 }}
      />

      <button onClick={handleSubmit} style={{ display: "block", marginTop: 10 }}>
        Generate
      </button>

      <pre style={{ marginTop: 20, whiteSpace: "pre-wrap" }}>
        {result ? JSON.stringify(result, null, 2) : ""}
      </pre>
    </main>
  )
}
