import { dispatchBuilderProtocol } from "../../../../../protocols/builder/builderProtocolDispatch.ts"
import type {
  BuilderProtocolRequest,
  BuilderProtocolResponse
} from "../types/protocol.ts"

export async function runBuilderProtocol(request: BuilderProtocolRequest): Promise<BuilderProtocolResponse<Record<string, unknown>>> {
  return dispatchBuilderProtocol(request)
}



