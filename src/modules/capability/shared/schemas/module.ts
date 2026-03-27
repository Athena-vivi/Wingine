import type { ModuleStatus } from "../enums/statuses.ts"
import type { SharedObjectBase } from "./base.ts"

export type ModuleObject = SharedObjectBase<"module", ModuleStatus> & {
  name: string
  description: string
  input_schema?: Record<string, unknown>
  process_logic?: string[]
  output_schema?: Record<string, unknown>
}

