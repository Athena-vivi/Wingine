import type { ProblemStatus } from "../enums/statuses"
import type { SharedObjectBase } from "./base"

export type ProblemObject = SharedObjectBase<"problem", ProblemStatus> & {
  title: string
  summary: string
  description?: string
  normalized_problem: string
  record_worthy?: boolean
}
