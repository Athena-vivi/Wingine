import type { FlowContractName } from "./names.ts"

export type ContractInvocationLogEntry = {
  id: string
  system: "radar" | "builder" | "scoring" | "betting"
  protocol_name: string
  request_id: string
  contract_name: FlowContractName | null
  status: "success" | "error"
  state: string
  gate_result: "pass" | "hold" | "reject" | null
  input_id: string | null
  output_id: string | null
  timestamp: string
}

