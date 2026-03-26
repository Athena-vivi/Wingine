import type { ProblemStatus } from "../enums/statuses.ts"
import type { SharedObjectBase } from "./base.ts"

export type ProblemObject = SharedObjectBase<"problem", ProblemStatus> & {
  title: string
  summary: string
  description?: string
  normalized_problem: string
  record_worthy?: boolean
}

