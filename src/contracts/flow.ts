export type ContractGateResult = "pass" | "hold" | "reject"

export type ContractStateChange = {
  from: string
  to: string
} | null

export type ContractReferences<TOutputType = string | null> = {
  input_id: string
  output_id: string | null
  output_type: TOutputType
}

export type FlowRequest<TObject = Record<string, unknown>, TContractName extends string = string> = {
  contract_name: TContractName
  producer: string
  consumer: string
  object: TObject
  context: {
    request_id: string
    trigger: string
    sent_at: string
  }
}

export type FlowResponse<TContractName extends string = string, TOutputType = string | null> = {
  contract_name: TContractName
  accepted: boolean
  gate_result: ContractGateResult
  state_change: ContractStateChange
  references: ContractReferences<TOutputType>
  message: string
}
