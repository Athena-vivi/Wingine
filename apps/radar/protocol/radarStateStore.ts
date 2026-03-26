import { mkdir, readFile, writeFile } from "fs/promises"
import path from "path"

import type { ProblemStatus } from "../../SharedContracts"
import type { RadarBetFeedbackIntake } from "@/adapters/betFeedbackImportAdapter"
import type { RadarFeedbackIntake } from "@/adapters/scoreFeedbackImportAdapter"

type RadarFeedbackEntry = {
  source: "scoring" | "betting"
  problem_id: string
  suggested_state: ProblemStatus
  recommended_action: string
  received_at: string
  reference_id: string
}

export type RadarRuntimeState = {
  problem_statuses: Record<string, ProblemStatus>
  feedback_log: RadarFeedbackEntry[]
}

const STORAGE_PATH = path.join(process.cwd(), "data", "radar-runtime-state.json")

const defaultState: RadarRuntimeState = {
  problem_statuses: {},
  feedback_log: []
}

async function ensureStoreDir() {
  await mkdir(path.dirname(STORAGE_PATH), { recursive: true })
}

async function readState(): Promise<RadarRuntimeState> {
  try {
    const content = await readFile(STORAGE_PATH, "utf8")
    return {
      ...defaultState,
      ...(JSON.parse(content) as Partial<RadarRuntimeState>)
    }
  } catch {
    return defaultState
  }
}

async function writeState(state: RadarRuntimeState) {
  await ensureStoreDir()
  await writeFile(STORAGE_PATH, JSON.stringify(state, null, 2), "utf8")
}

export async function applyScoringFeedbackToRadarState(feedback: RadarFeedbackIntake) {
  const state = await readState()
  state.problem_statuses[feedback.problem_id] = feedback.suggested_state
  state.feedback_log = [
    {
      source: "scoring",
      problem_id: feedback.problem_id,
      suggested_state: feedback.suggested_state,
      recommended_action: feedback.recommended_action,
      received_at: new Date().toISOString(),
      reference_id: feedback.score_id
    },
    ...state.feedback_log
  ].slice(0, 100)

  await writeState(state)

  return {
    problem_id: feedback.problem_id,
    applied_state: feedback.suggested_state,
    source: "scoring" as const
  }
}

export async function applyBetFeedbackToRadarState(feedback: RadarBetFeedbackIntake) {
  const state = await readState()
  state.problem_statuses[feedback.problem_id] = feedback.suggested_state
  state.feedback_log = [
    {
      source: "betting",
      problem_id: feedback.problem_id,
      suggested_state: feedback.suggested_state,
      recommended_action: feedback.recommended_action,
      received_at: new Date().toISOString(),
      reference_id: feedback.bet_id
    },
    ...state.feedback_log
  ].slice(0, 100)

  await writeState(state)

  return {
    problem_id: feedback.problem_id,
    applied_state: feedback.suggested_state,
    source: "betting" as const
  }
}

export async function getRadarRuntimeState() {
  return readState()
}
