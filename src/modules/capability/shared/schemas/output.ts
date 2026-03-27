import type { OutputStatus } from "../enums/statuses.ts"
import type { SharedObjectBase } from "./base.ts"

export type OutputObject = SharedObjectBase<"output", OutputStatus> & {
  title: string
  summary: string
  link?: string
  notes?: string
  depends_on_modules?: string[]
}

