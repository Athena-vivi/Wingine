import type { FlowContractName } from "./names.ts"
import type { SharedObjectType } from "../enums/objectTypes.ts"

export type FlowRequest<TObject> = {
  contract_name: FlowContractName
  producer: string
  consumer: string
  object: TObject
  context: {
    request_id: string
    trigger: string
    sent_at: string
  }
}

export type FlowResponse = {
  contract_name: FlowContractName
  accepted: boolean
  gate_result: "pass" | "hold" | "reject"
  state_change: {
    from: string
    to: string
  } | null
  references: {
    input_id: string
    output_id: string | null
    output_type: SharedObjectType | null
  }
  message: string
}

