"use client"

import { useEffect, useState } from "react"

import { AllocationPanel } from "@/components/AllocationPanel"
import { BettingInputPanel } from "@/components/BettingInputPanel"
import { CandidateContextPanel } from "@/components/CandidateContextPanel"
import { DecisionPanel } from "@/components/DecisionPanel"
import { HistoryPanel } from "@/components/HistoryPanel"
import { invokeWorkspaceProtocol } from "@/protocol/workspaceInvoker"
import type { BettingInput, TrendValue } from "@/types/betting"
import type { BettingWorkspaceState } from "@/protocol/bettingProtocol"

export function BettingWorkspace() {
  const [workspace, setWorkspace] = useState<BettingWorkspaceState | null>(null)
  const [draftInput, setDraftInput] = useState<BettingInput>({
    score: 3,
    confidence: 0.6,
    trend: "flat",
    cost: 2
  })
  const [protocolError, setProtocolError] = useState<string | null>(null)

  useEffect(() => {
    const response = invokeWorkspaceProtocol("candidate_load", {
      candidateId: "problem-001"
    })

    if (response.status === "error" || !response.data) {
      setProtocolError(response.error?.message ?? "Failed to load betting workspace")
      return
    }

    setWorkspace(response.data)
    setDraftInput(response.data.currentInput)
  }, [])

  const handleSelectCandidate = (candidateId: string) => {
    const response = invokeWorkspaceProtocol("candidate_load", {
      candidateId
    })

    if (response.status === "error" || !response.data) {
      setProtocolError(response.error?.message ?? "Failed to switch candidate")
      return
    }

    setProtocolError(null)
    setWorkspace(response.data)
    setDraftInput(response.data.currentInput)
  }

  const handleChangeInput = (field: keyof BettingInput, value: number | TrendValue) => {
    setDraftInput((current) => ({
      ...current,
      [field]: value
    }))
  }

  const handleEvaluate = () => {
    if (!workspace) {
      return
    }

    const response = invokeWorkspaceProtocol("bet_evaluate", {
      candidateId: workspace.selectedCandidateId,
      input: draftInput
    })

    if (response.status === "error" || !response.data) {
      setProtocolError(response.error?.message ?? "Failed to evaluate bet")
      return
    }

    setProtocolError(null)
    const evaluatedWorkspace = response.data
    setWorkspace(evaluatedWorkspace)

    if (evaluatedWorkspace.currentRecord) {
      const persistResponse = invokeWorkspaceProtocol("bet_persist", {
        candidateId: evaluatedWorkspace.selectedCandidateId,
        record: evaluatedWorkspace.currentRecord
      })

      if (persistResponse.status === "success" && persistResponse.data) {
        setWorkspace(persistResponse.data)
      }
    }
  }

  if (!workspace) {
    return (
      <main className="flex h-screen items-center justify-center px-6 text-sm text-muted">
        {protocolError ?? "Loading betting workspace"}
      </main>
    )
  }

  return (
    <main className="h-screen overflow-hidden bg-transparent py-4 pl-4 pr-0 md:pl-6 xl:pl-8">
      <div className="grid h-full xl:grid-cols-[300px_minmax(0,1fr)_420px]">
        <div className="min-h-0">
          <CandidateContextPanel
            candidates={workspace.candidates}
            candidate={workspace.currentCandidate}
            onSelect={handleSelectCandidate}
          />
        </div>

        <div className="min-h-0 border-l border-r workbench-divider">
          <BettingInputPanel
            input={draftInput}
            inputSource={workspace.inputSource}
            onChange={handleChangeInput}
            onEvaluate={handleEvaluate}
          />
        </div>

        <div className="workbench-panel py-3">
          <div className="section-toolbar">
            <div className="min-w-0">
              <p className="section-kicker">Result</p>
              <h2 className="panel-title mt-1.5">Betting decision and allocation</h2>
            </div>
          </div>

          <div className="workbench-gutter min-h-0 space-y-4 overflow-y-auto">
            <DecisionPanel record={workspace.currentRecord} />
            <AllocationPanel record={workspace.currentRecord} />
            <HistoryPanel history={workspace.history} />
          </div>
        </div>
      </div>
    </main>
  )
}
