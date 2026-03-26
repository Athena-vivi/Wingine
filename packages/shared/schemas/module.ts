import type { ModuleStatus } from "../enums/statuses"
import type { SharedObjectBase } from "./base"

export type ModuleObject = SharedObjectBase<"module", ModuleStatus> & {
  name: string
  description: string
  input_schema?: Record<string, unknown>
  process_logic?: string[]
  output_schema?: Record<string, unknown>
}
