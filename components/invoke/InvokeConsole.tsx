"use client"

import { useState } from "react"

const templates: Record<string, string> = {
  mvp_main_chain: JSON.stringify(
    {
      radar_to_builder: {
        radarRecord: {
          source_type: "community",
          source_platform: "reddit",
          source_url: "problem-001",
          post_title: "Problem title",
          raw_problem: "Raw problem text",
          normalized_problem: "Normalized problem",
          problem_type: "General",
          business_stage: "Growth",
          emotion_signal: "urgent",
          tool_signal: true,
          service_signal: false,
          trend_signal: true,
          record_worthy: true,
          record_reason: "ready",
          insight: "insight",
          product_opportunity: "opportunity",
          content_angle: "angle"
        }
      },
      builder_to_scoring: {
        workflow: {
          problemId: "problem_problem-001",
          steps: [
            {
              id: "step-1",
              text: "Map workflow",
              capabilityId: "module-001"
            }
          ]
        }
      },
      scoring_to_betting: {
        evaluation: {
          id: "workflow-problem-001-evaluation",
          objectId: "workflow_problem-001",
          objectType: "workflow",
          profileId: "workflow-profile",
          dimensions: {
            value: { score: 4, weight: 0.2, confidence: 0.7, ownerRole: "strategist", evidence: [], note: "" },
            quality: { score: 4, weight: 0.3, confidence: 0.7, ownerRole: "operator", evidence: [], note: "" },
            reliability: { score: 4, weight: 0.3, confidence: 0.7, ownerRole: "operator", evidence: [], note: "" },
            leverage: { score: 4, weight: 0.2, confidence: 0.7, ownerRole: "strategist", evidence: [], note: "" }
          },
          aggregate: {
            weightedScore: 4,
            dimensionAverage: 4,
            confidence: 0.7,
            gateResult: "pass"
          },
          execution: {
            evaluators: ["strategist", "operator", "reviewer"],
            timestamp: new Date().toISOString(),
            version: "1.0",
            roleInputs: {
              strategist: { role: "strategist", focusDimensions: ["value", "leverage"], status: "active", note: "" },
              operator: { role: "operator", focusDimensions: ["quality", "reliability"], status: "active", note: "" },
              reviewer: { role: "reviewer", focusDimensions: ["value", "quality", "reliability", "leverage"], status: "reviewed", note: "" }
            }
          }
        }
      }
    },
    null,
    2
  ),
  radar_to_builder: JSON.stringify(
    {
      radarRecord: {
        source_type: "community",
        source_platform: "reddit",
        source_url: "problem-001",
        post_title: "Problem title",
        raw_problem: "Raw problem text",
        normalized_problem: "Normalized problem",
        problem_type: "General",
        business_stage: "Growth",
        emotion_signal: "urgent",
        tool_signal: true,
        service_signal: false,
        trend_signal: true,
        record_worthy: true,
        record_reason: "ready",
        insight: "insight",
        product_opportunity: "opportunity",
        content_angle: "angle"
      }
    },
    null,
    2
  ),
  builder_to_scoring: JSON.stringify(
    {
      workflow: {
        problemId: "problem_problem-001",
        steps: [
          {
            id: "step-1",
            text: "Map workflow",
            capabilityId: "module-001"
          }
        ]
      },
      problem: {
        id: "problem_problem-001",
        title: "Problem title",
        description: "Description",
        source: "radar",
        tag: "general"
      }
    },
    null,
    2
  ),
  scoring_to_betting: JSON.stringify(
    {
      object: {
        id: "workflow_problem-001",
        type: "workflow",
        title: "Workflow title",
        summary: "Workflow summary"
      },
      evaluation: {
        id: "workflow-problem-001-evaluation",
        objectId: "workflow_problem-001",
        objectType: "workflow",
        profileId: "workflow-profile",
        dimensions: {
          value: { score: 4, weight: 0.2, confidence: 0.7, ownerRole: "strategist", evidence: [], note: "" },
          quality: { score: 4, weight: 0.3, confidence: 0.7, ownerRole: "operator", evidence: [], note: "" },
          reliability: { score: 4, weight: 0.3, confidence: 0.7, ownerRole: "operator", evidence: [], note: "" },
          leverage: { score: 4, weight: 0.2, confidence: 0.7, ownerRole: "strategist", evidence: [], note: "" }
        },
        aggregate: {
          weightedScore: 4,
          dimensionAverage: 4,
          confidence: 0.7,
          gateResult: "pass"
        },
        execution: {
          evaluators: ["strategist", "operator", "reviewer"],
          timestamp: new Date().toISOString(),
          version: "1.0",
          roleInputs: {
            strategist: { role: "strategist", focusDimensions: ["value", "leverage"], status: "active", note: "" },
            operator: { role: "operator", focusDimensions: ["quality", "reliability"], status: "active", note: "" },
            reviewer: { role: "reviewer", focusDimensions: ["value", "quality", "reliability", "leverage"], status: "reviewed", note: "" }
          }
        }
      }
    },
    null,
    2
  )
}

export function InvokeConsole() {
  const [contractName, setContractName] = useState<keyof typeof templates>("mvp_main_chain")
  const [payload, setPayload] = useState(templates.mvp_main_chain)
  const [result, setResult] = useState<string>("")
  const [status, setStatus] = useState<"idle" | "loading">("idle")

  async function handleInvoke() {
    setStatus("loading")

    try {
      const response = await fetch("/api/invoke/flow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contract_name: contractName,
          payload: JSON.parse(payload)
        })
      })

      const data = await response.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (error) {
      setResult(
        JSON.stringify(
          {
            ok: false,
            error: error instanceof Error ? error.message : "Invocation failed"
          },
          null,
          2
        )
      )
    } finally {
      setStatus("idle")
    }
  }

  return (
    <div className="panel">
      <h2>MVP Contract Invoke</h2>
      <div className="list">
        <div className="list-row">
          <strong>Mode</strong>
          <span>
            `mvp_main_chain` will run `radar_to_builder -> builder_to_scoring -> scoring_to_betting`.
          </span>
        </div>
        <div className="list-row">
          <strong>Contract</strong>
          <select
            value={contractName}
            onChange={(event) => {
              const next = event.target.value as keyof typeof templates
              setContractName(next)
              setPayload(templates[next])
            }}
          >
            <option value="mvp_main_chain">mvp_main_chain</option>
            <option value="radar_to_builder">radar_to_builder</option>
            <option value="builder_to_scoring">builder_to_scoring</option>
            <option value="scoring_to_betting">scoring_to_betting</option>
          </select>
        </div>
        <div className="list-row">
          <strong>Payload</strong>
          <textarea
            value={payload}
            onChange={(event) => setPayload(event.target.value)}
            rows={18}
            style={{ width: "100%", fontFamily: "ui-monospace, SFMono-Regular, monospace" }}
          />
        </div>
        <div className="list-row">
          <button type="button" onClick={handleInvoke} disabled={status === "loading"}>
            {status === "loading" ? "Invoking..." : "Invoke"}
          </button>
        </div>
        <div className="list-row">
          <strong>Result</strong>
          <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "ui-monospace, SFMono-Regular, monospace" }}>
            {result || "No result yet."}
          </pre>
        </div>
      </div>
    </div>
  )
}
