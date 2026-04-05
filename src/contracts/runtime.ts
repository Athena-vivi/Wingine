export type ModuleCallerRole = "ui" | "flow" | "agent" | "runtime" | "api"

export type MetaBlock = {
  timestamp: string
  trace_id?: string
  session_id?: string
  asset_type?: string
  asset_id?: string
  source?: {
    provider?: string
    channel?: string
    ref?: string
  }
  tags?: string[]
  labels?: string[]
  custom?: Record<string, unknown>
}

export type ModuleCallRequest<TInput = Record<string, unknown>> = {
  protocol_version: string
  request_id: string
  module: string
  action: string
  caller: {
    system: string
    role: ModuleCallerRole
    id: string
  }
  input: TInput
  meta: MetaBlock
}

export type ModuleCallResponse<TOutput = Record<string, unknown>> = {
  protocol_version: string
  request_id: string
  module: string
  action: string
  status: "success" | "error"
  state: "ready" | "error"
  output: TOutput | null
  error: {
    code: string
    message: string
    retryable?: boolean
  } | null
  meta: MetaBlock
}

export type RuntimeModuleDescriptor = {
  module_id: string
  system: "problem_radar" | "scoring" | "betting" | "builder" | "content_system"
  actions: string[]
  input_contract?: string
  output_contract?: string
  module_version?: string
  status: "active" | "disabled"
}

export type LocalModuleHandler = (input: unknown) => unknown | Promise<unknown>

export type RuntimeExecutionMethod = {
  mode: "local"
  target: string
  handler: LocalModuleHandler
}

export type RegistryRecord = {
  module: RuntimeModuleDescriptor
  execution: RuntimeExecutionMethod
}

export type InvocationRecord = {
  invocation_id: string
  request_id: string
  trace_id?: string
  module_id: string
  action: string
  protocol_version: string
  started_at: string
  finished_at?: string
  status: "started" | "success" | "error"
}

export type ActivityLogRecord = {
  module_id: string
  action: string
  status: "success" | "error"
  timestamp: string
}
