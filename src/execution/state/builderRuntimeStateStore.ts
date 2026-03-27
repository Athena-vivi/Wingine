import { mkdir, readFile, writeFile } from "fs/promises"
import path from "path"

import type { ModuleStatus, OutputStatus, WorkflowStatus } from "../../contracts/index.ts"
import type { BuilderFeedbackEntry, BuilderRuntimeStatePatch } from "../../control/state/builderFeedbackState.ts"

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

export async function applyBuilderRuntimeStatePatch(
  patch: BuilderRuntimeStatePatch
): Promise<BuilderRuntimeState> {
  const state = await readState()

  if (patch.workflow_statuses) {
    state.workflow_statuses = {
      ...state.workflow_statuses,
      ...patch.workflow_statuses
    }
  }

  if (patch.module_statuses) {
    state.module_statuses = {
      ...state.module_statuses,
      ...patch.module_statuses
    }
  }

  if (patch.output_statuses) {
    state.output_statuses = {
      ...state.output_statuses,
      ...patch.output_statuses
    }
  }

  state.feedback_log = [patch.feedback_entry, ...state.feedback_log].slice(0, 100)

  await writeState(state)

  return state
}

export async function getBuilderRuntimeState() {
  return readState()
}
