"use client"

import { useEffect, useState } from "react"

import { AggregatePanel } from "@/components/AggregatePanel"
import { DimensionScorePanel } from "@/components/DimensionScorePanel"
import { ObjectContextPanel } from "@/components/ObjectContextPanel"
import {
  invokeWorkspaceProtocol
} from "@/protocol/workspaceInvoker"
import type { ScoringWorkspaceState } from "@/types/protocol"
import type { EvaluatorRole, RoleInputStatus, ScoringDimension } from "@/types/scoring"

export function ScoringConsole() {
  const [workspace, setWorkspace] = useState<ScoringWorkspaceState | null>(null)
  const [protocolError, setProtocolError] = useState<string | null>(null)

  useEffect(() => {
    const response = invokeWorkspaceProtocol("workspace_load", {
      selectedObjectId: "",
      evaluations: undefined
    })

    if (response.status === "error" || !response.data) {
      setProtocolError(response.error?.message ?? "Failed to load scoring workspace")
      return
    }

    setWorkspace(response.data)
  }, [])

  useEffect(() => {
    if (!workspace) {
      return
    }

    invokeWorkspaceProtocol("workspace_persist", {
      selectedObjectId: workspace.selectedObjectId,
      evaluations: workspace.evaluations
    })
  }, [workspace])

  const updateDimension = (
    dimension: ScoringDimension,
    field: "score" | "confidence" | "note" | "evidence",
    value: number | string | string[]
  ) => {
    if (!workspace) {
      return
    }

    const response = invokeWorkspaceProtocol("dimension_update", {
      selectedObjectId: workspace.selectedObjectId,
      evaluations: workspace.evaluations,
      dimension,
      field,
      value
    })

    if (response.status === "error" || !response.data) {
      setProtocolError(response.error?.message ?? "Failed to update dimension")
      return
    }

    setProtocolError(null)
    setWorkspace(response.data)
  }

  const updateRoleInput = (
    role: EvaluatorRole,
    field: "status" | "note",
    value: RoleInputStatus | string
  ) => {
    if (!workspace) {
      return
    }

    const response = invokeWorkspaceProtocol("role_update", {
      selectedObjectId: workspace.selectedObjectId,
      evaluations: workspace.evaluations,
      role,
      field,
      value
    })

    if (response.status === "error" || !response.data) {
      setProtocolError(response.error?.message ?? "Failed to update role input")
      return
    }

    setProtocolError(null)
    setWorkspace(response.data)
  }

  const handleSelectObject = (objectId: string) => {
    if (!workspace) {
      return
    }

    const response = invokeWorkspaceProtocol("workspace_select", {
      selectedObjectId: objectId,
      evaluations: workspace.evaluations
    })

    if (response.status === "error" || !response.data) {
      setProtocolError(response.error?.message ?? "Failed to switch object")
      return
    }

    setProtocolError(null)
    setWorkspace(response.data)
  }

  if (!workspace) {
    return (
      <main className="flex h-screen items-center justify-center px-6 text-sm text-muted">
        {protocolError ?? "Loading scoring workspace"}
      </main>
    )
  }

  return (
    <main className="h-screen overflow-hidden bg-transparent py-4 pl-4 pr-0 md:pl-6 xl:pl-8">
      <div className="grid h-full xl:grid-cols-[300px_minmax(0,1fr)_420px]">
        <div className="min-h-0">
          <ObjectContextPanel
            objects={workspace.objects}
            object={workspace.currentObject}
            evaluation={workspace.evaluation}
            profile={workspace.profile}
            onSelect={handleSelectObject}
          />
        </div>

        <div className="min-h-0 border-l border-r workbench-divider">
          <DimensionScorePanel
            evaluation={workspace.evaluation}
            profile={workspace.profile}
            onUpdateScore={updateDimension}
          />
        </div>

        <div className="min-h-0">
          <AggregatePanel
            evaluation={workspace.evaluation}
            history={workspace.history}
            onUpdateRoleInput={updateRoleInput}
          />
        </div>
      </div>
    </main>
  )
}
