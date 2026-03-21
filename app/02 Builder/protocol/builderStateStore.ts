import { mkdir, readFile, writeFile } from "fs/promises"
import path from "path"

import type { ModuleStatus, OutputStatus, WorkflowStatus } from "../../SharedContracts"
import type { BuilderBetFeedbackIntake } from "@/adapters/betFeedbackImportAdapter"
import type { BuilderFeedbackIntake } from "@/adapters/scoreFeedbackImportAdapter"

type BuilderFeedbackEntry = {
  source: "scoring" | "betting"
  object_id: string
  suggested_state: string
  recommended_action: string
  received_at: string
  reference_id: string
}

export type BuilderRuntimeState = {
  workflow_statuses: Record<string, WorkflowStatus>
  module_statuses: Record<string, ModuleStatus>
  output_statuses: Record<string, OutputStatus>
  feedback_log: BuilderFeedbackEntry[]
}

const STORAGE_PATH = path.join(process.cwd(), "data", "builder-runtime-state.json")

const defaultState: BuilderRuntimeState = {
  workflow_statuses: {},
  module_statuses: {},
  output_statuses: {},
  feedback_log: []
}

async function ensureStoreDir() {
  await mkdir(path.dirname(STORAGE_PATH), { recursive: true })
}

async function readState(): Promise<BuilderRuntimeState> {
  try {
    const content = await readFile(STORAGE_PATH, "utf8")
    return {
      ...defaultState,
      ...(JSON.parse(content) as Partial<BuilderRuntimeState>)
    }
  } catch {
    return defaultState
  }
}

async function writeState(state: BuilderRuntimeState) {
  await ensureStoreDir()
  await writeFile(STORAGE_PATH, JSON.stringify(state, null, 2), "utf8")
}

function isWorkflowState(value: string): value is WorkflowStatus {
  return ["draft", "mapped", "executable", "blocked", "retired"].includes(value)
}

function isModuleState(value: string): value is ModuleStatus {
  return ["draft", "attached", "active", "idle", "retired"].includes(value)
}

function isOutputState(value: string): value is OutputStatus {
  return ["draft", "in-progress", "testing", "done", "archived"].includes(value)
}

export async function applyScoringFeedbackToBuilderState(feedback: BuilderFeedbackIntake) {
  const state = await readState()

  if (feedback.object_type === "workflow" && isWorkflowState(feedback.suggested_state)) {
    state.workflow_statuses[feedback.object_id] = feedback.suggested_state
  } else if (feedback.object_type === "module" && isModuleState(feedback.suggested_state)) {
    state.module_statuses[feedback.object_id] = feedback.suggested_state
  } else if (feedback.object_type === "output" && isOutputState(feedback.suggested_state)) {
    state.output_statuses[feedback.object_id] = feedback.suggested_state
  }

  state.feedback_log = [
    {
      source: "scoring",
      object_id: feedback.object_id,
      suggested_state: feedback.suggested_state,
      recommended_action: feedback.recommended_action,
      received_at: new Date().toISOString(),
      reference_id: feedback.score_id
    },
    ...state.feedback_log
  ].slice(0, 100)

  await writeState(state)

  return {
    object_id: feedback.object_id,
    applied_state: feedback.suggested_state,
    source: "scoring" as const
  }
}

export async function applyBetFeedbackToBuilderState(feedback: BuilderBetFeedbackIntake) {
  const state = await readState()
  const objectType = feedback.object_id.split("_")[0]

  if (objectType === "workflow" && isWorkflowState(feedback.suggested_state)) {
    state.workflow_statuses[feedback.object_id] = feedback.suggested_state
  } else if (objectType === "module" && isModuleState(feedback.suggested_state)) {
    state.module_statuses[feedback.object_id] = feedback.suggested_state
  } else if (objectType === "output" && isOutputState(feedback.suggested_state)) {
    state.output_statuses[feedback.object_id] = feedback.suggested_state
  }

  state.feedback_log = [
    {
      source: "betting",
      object_id: feedback.object_id,
      suggested_state: feedback.suggested_state,
      recommended_action: feedback.recommended_action,
      received_at: new Date().toISOString(),
      reference_id: feedback.bet_id
    },
    ...state.feedback_log
  ].slice(0, 100)

  await writeState(state)

  return {
    object_id: feedback.object_id,
    applied_state: feedback.suggested_state,
    source: "betting" as const
  }
}

export async function getBuilderRuntimeState() {
  return readState()
}
