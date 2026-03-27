export const PROBLEM_STATUSES = ["captured", "qualified", "structured", "linked", "archived"] as const
export const MODULE_STATUSES = ["draft", "attached", "active", "idle", "retired"] as const
export const OUTPUT_STATUSES = ["draft", "in-progress", "testing", "done", "archived"] as const
export const WORKFLOW_STATUSES = ["draft", "mapped", "executable", "blocked", "retired"] as const
export const SCORE_STATUSES = ["draft", "reviewing", "scored", "superseded"] as const
export const BET_STATUSES = ["draft", "active", "held", "killed", "scaled"] as const

export type ProblemStatus = (typeof PROBLEM_STATUSES)[number]
export type ModuleStatus = (typeof MODULE_STATUSES)[number]
export type OutputStatus = (typeof OUTPUT_STATUSES)[number]
export type WorkflowStatus = (typeof WORKFLOW_STATUSES)[number]
export type ScoreStatus = (typeof SCORE_STATUSES)[number]
export type BetStatus = (typeof BET_STATUSES)[number]
