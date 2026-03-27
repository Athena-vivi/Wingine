export type CapabilityCallerType = "human-ui" | "agent" | "api"

export type ProtocolCaller<TType extends string = CapabilityCallerType> = {
  type: TType
  id: string
}

export type ProtocolError = {
  code: string
  message: string
} | null

export type CapabilityDefinition<
  TInputSchema extends Record<string, string | Record<string, string>> = Record<string, string | Record<string, string>>,
  TOutputSchema extends Record<string, string | Record<string, string>> = Record<string, string | Record<string, string>>
> = {
  name: string
  purpose: string
  input_schema: TInputSchema
  process_logic: string[]
  output_schema: TOutputSchema
  state: string
  trigger: string
  error_handling: Record<string, string>
}

export type ProtocolRequest<
  TPayload = Record<string, unknown>,
  TContext = Record<string, unknown>,
  TCapability extends string = string,
  TCallerType extends string = CapabilityCallerType
> = {
  request_id: string
  capability: TCapability
  caller: ProtocolCaller<TCallerType>
  payload: TPayload
  context: TContext
}

export type ProtocolResponse<
  TData = Record<string, unknown>,
  TState extends string = string,
  TCapability extends string = string
> = {
  request_id: string
  capability: TCapability
  status: "success" | "error"
  state: TState
  data: TData | null
  error: ProtocolError
}
