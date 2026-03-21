"use client"

import { useState } from "react"

import { mockCapabilities } from "@/data/mockCapabilities"
import { defaultTemplate } from "@/data/defaultTemplate"
import { mockOutputs } from "@/data/mockOutputs"
import { mockProblems } from "@/data/mockProblems"
import { mockWorkflows } from "@/data/mockWorkflows"
import type { BuilderCapabilityDetail, BuilderWorkspaceRecord, CapabilitySet, Output, Workflow } from "@/types/builder"
import { invokeBuilderWorkspace } from "@/protocol/workspaceInvoker"
import type { BuilderProtocolRequest } from "@/types/protocol"

import { CapabilitiesPanel } from "./CapabilitiesPanel"
import { OutputPanel } from "./OutputPanel"
import { ProblemInfoPanel } from "./ProblemInfoPanel"
import { WorkflowPanel } from "./WorkflowPanel"

const cloneWorkflows = () => mockWorkflows.map((workflow) => ({ ...workflow, steps: workflow.steps.map((step) => ({ ...step })) }))
const cloneCapabilities = () =>
  mockCapabilities.map((set) => ({ ...set, items: set.items.map((item) => ({ ...item })) }))
const cloneOutputs = () => mockOutputs.map((output) => ({ ...output }))

const createId = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`
const createRequestId = (capability: string) => `${capability}_${Math.random().toString(36).slice(2, 10)}`

export function BuilderConsole() {
  const [selectedProblemId, setSelectedProblemId] = useState(mockProblems[0]?.id ?? "")
  const [workflows, setWorkflows] = useState<Workflow[]>(cloneWorkflows)
  const [capabilitySets, setCapabilitySets] = useState<CapabilitySet[]>(cloneCapabilities)
  const [outputs, setOutputs] = useState<Output[]>(cloneOutputs)
  const [selectedWorkflowStepId, setSelectedWorkflowStepId] = useState<string | null>(null)
  const [selectedCapabilityId, setSelectedCapabilityId] = useState<string | null>(null)

  const invoke = (request: Omit<BuilderProtocolRequest, "request_id" | "caller">) =>
    invokeBuilderWorkspace({
      request_id: createRequestId(request.capability),
      caller: {
        type: "human-ui",
        id: "builder-console"
      },
      ...request
    })

  const workspaceResponse = invoke({
    capability: "builder_load",
    payload: {
      problem_id: selectedProblemId,
      problems: mockProblems,
      workflows,
      capability_sets: capabilitySets,
      outputs,
      templates: [defaultTemplate]
    },
    context: {
      problem_id: selectedProblemId
    }
  })

  const workspace = workspaceResponse.data?.builder_record as BuilderWorkspaceRecord

  const activeWorkflowStepId =
    workspace.workflow.steps.find((step) => step.id === selectedWorkflowStepId)?.id ?? null

  const activeCapabilityId =
    workspace.capabilitySet.items.find((item) => item.id === selectedCapabilityId)?.id ?? null

  const capabilityDetailResponse = invoke({
    capability: "capability_detail_resolver",
    payload: {
      capabilityId: activeCapabilityId,
      capabilities: workspace.capabilitySet.items,
      workflowSteps: workspace.workflow.steps
    },
    context: {
      problem_id: workspace.problem.id,
      capability_id: activeCapabilityId ?? undefined
    }
  })

  const capabilityDetail = workspace.capabilitySet.items.length
    ? (capabilityDetailResponse.data?.capability_detail as BuilderCapabilityDetail)
    : {
        capability: null,
        status: "missing",
        usedBySteps: [],
        trigger: "",
        process: [],
        output: [],
        role: ""
      }

  const applyWorkflowMutation = (
    mutation:
      | { action: "load" }
      | { action: "create"; step: { id: string; text: string } }
      | { action: "update"; stepId: string; text: string }
      | { action: "delete"; stepId: string }
      | { action: "move"; stepId: string; direction: "up" | "down" }
  ) => {
    setWorkflows((current) => {
      const response = invoke({
        capability: "workflow_update",
        payload: {
          problem_id: workspace.problem.id,
          workflows: current,
          mutation
        },
        context: {
          problem_id: workspace.problem.id
        }
      })

      return (response.data?.workflows as Workflow[]) ?? current
    })
  }

  const applyWorkflowStepLink = (stepId: string, capabilityId: string | null) => {
    setWorkflows((current) => {
      const response = invoke({
        capability: "workflow_link_update",
        payload: {
          problem_id: workspace.problem.id,
          workflows: current,
          step_id: stepId,
          capability_id: capabilityId
        },
        context: {
          problem_id: workspace.problem.id,
          step_id: stepId,
          capability_id: capabilityId ?? undefined
        }
      })

      return (response.data?.workflows as Workflow[]) ?? current
    })
  }

  const applyCapabilityMutation = (
    mutation:
      | { action: "load" }
      | { action: "create_custom"; item: { id: string; name: string; description?: string } }
      | { action: "attach_skill"; skillId: string; itemId: string }
      | { action: "update_custom"; capabilityId: string; field: "name" | "description"; value: string }
      | { action: "delete_custom"; capabilityId: string }
  ) => {
    setCapabilitySets((current) => {
      const response = invoke({
        capability: "capability_attachment_update",
        payload: {
          problem_id: workspace.problem.id,
          capability_sets: current,
          workflows,
          mutation
        },
        context: {
          problem_id: workspace.problem.id,
          capability_id:
            "capabilityId" in mutation ? mutation.capabilityId : "itemId" in mutation ? mutation.itemId : undefined
        }
      })

      const nextWorkflows = (response.data?.workflows as Workflow[]) ?? workflows
      setWorkflows(nextWorkflows)

      return (response.data?.capabilitySets as CapabilitySet[]) ?? current
    })
  }

  const updateOutput = <K extends keyof Output>(field: K, value: Output[K]) => {
    setOutputs((current) => {
      const response = invoke({
        capability: "output_update",
        payload: {
          problem_id: workspace.problem.id,
          outputs: current,
          workflow: workspace.workflow,
          capability_set: workspace.capabilitySet,
          field,
          value
        },
        context: {
          problem_id: workspace.problem.id
        }
      })

      return (response.data?.outputs as Output[]) ?? current
    })
  }

  return (
    <main className="workspace-compact h-screen overflow-hidden bg-transparent py-4 pl-4 pr-0 md:pl-6 md:pr-0 xl:pl-8 xl:pr-0">
      <div className="flex h-full w-full flex-col">
        <div className="workbench-shell grid h-full xl:grid-cols-[300px_minmax(0,1fr)_480px] xl:grid-rows-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <div className="min-h-0">
            <ProblemInfoPanel
              problems={mockProblems}
              problem={workspace.problem}
              selectedStatus={workspace.output.status}
              onSelect={setSelectedProblemId}
            />
          </div>

          <div className="region-divider-left region-divider-right min-h-0">
            <WorkflowPanel
              steps={workspace.workflow.steps}
              capabilities={workspace.capabilitySet.items}
              selectedStepId={activeWorkflowStepId}
              onSelect={setSelectedWorkflowStepId}
              onAdd={() => {
                const nextStep = { id: createId("workflow"), text: "" }
                setSelectedWorkflowStepId(nextStep.id)
                applyWorkflowMutation({
                  action: "create",
                  step: nextStep
                })
              }}
              onUpdate={(stepId, value) => applyWorkflowMutation({ action: "update", stepId, text: value })}
              onAssignCapability={(stepId, capabilityId) => applyWorkflowStepLink(stepId, capabilityId)}
              onDelete={(stepId) => {
                if (selectedWorkflowStepId === stepId) {
                  setSelectedWorkflowStepId(null)
                }

                applyWorkflowMutation({ action: "delete", stepId })
              }}
              onMove={(stepId, direction) => applyWorkflowMutation({ action: "move", stepId, direction })}
            />
          </div>

          <div className="region-divider-left-strong region-cap min-h-0 row-span-2">
            <OutputPanel
              output={workspace.output}
              linkedCapabilities={workspace.linkedCapabilities}
              template={workspace.template}
              onUpdate={updateOutput}
            />
          </div>

          <div className="region-divider-top-strong region-cap min-h-0 col-span-2">
            <CapabilitiesPanel
              items={workspace.capabilitySet.items}
              steps={workspace.workflow.steps}
              activeCapabilityIds={workspace.activeCapabilityIds}
              selectedCapabilityId={activeCapabilityId}
              capabilityDetail={capabilityDetail}
              onSelect={setSelectedCapabilityId}
              onAdd={() => {
                const nextItem = { id: createId("capability"), name: "", description: "" }
                setSelectedCapabilityId(nextItem.id)
                applyCapabilityMutation({
                  action: "create_custom",
                  item: nextItem
                })
              }}
              onAddFromSkill={(skillId) => {
                const nextItemId = createId("capability")
                setSelectedCapabilityId(nextItemId)
                applyCapabilityMutation({
                  action: "attach_skill",
                  skillId,
                  itemId: nextItemId
                })
              }}
              onUpdate={(capabilityId, field, value) =>
                applyCapabilityMutation({
                  action: "update_custom",
                  capabilityId,
                  field,
                  value
                })
              }
              onDelete={(capabilityId) => {
                if (selectedCapabilityId === capabilityId) {
                  setSelectedCapabilityId(null)
                }

                applyCapabilityMutation({
                  action: "delete_custom",
                  capabilityId
                })
              }}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
