import type { FlowContractName } from "./names.ts"
import type { SharedObjectType } from "../enums/objectTypes.ts"

export type {
  ContractGateResult,
  ContractReferences,
  ContractStateChange
} from "../../../../contracts/flow.ts"

export type FlowRequest<TObject> = import("../../../../contracts/flow.ts").FlowRequest<TObject, FlowContractName>
export type FlowResponse = import("../../../../contracts/flow.ts").FlowResponse<FlowContractName, SharedObjectType | null>
