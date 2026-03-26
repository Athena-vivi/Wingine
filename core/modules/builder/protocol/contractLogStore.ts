import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

import type { ContractInvocationLogEntry, FlowContractName } from "../../SharedContracts.ts"
import type { BuilderProtocolResponse } from "../types/protocol.ts"

const LOG_PATH = path.join(process.cwd(), "data", "contract-activity.json")
let builderContractLogs: ContractInvocationLogEntry[] | null = null

async function loadBuilderContractLogs() {
  if (builderContractLogs) {
    return builderContractLogs
  }

  try {
    const raw = await readFile(LOG_PATH, "utf8")
    builderContractLogs = JSON.parse(raw) as ContractInvocationLogEntry[]
  } catch {
    builderContractLogs = []
  }

  return builderContractLogs
}

async function persistBuilderContractLogs(logs: ContractInvocationLogEntry[]) {
  await mkdir(path.dirname(LOG_PATH), { recursive: true })
  await writeFile(LOG_PATH, JSON.stringify(logs, null, 2), "utf8")
}

function readFlowSignal(response: BuilderProtocolResponse<Record<string, unknown>>) {
  const data = response.data as Record<string, unknown> | null
  const contractRequest =
    data && "contract_request" in data && data.contract_request && typeof data.contract_request === "object"
      ? (data.contract_request as {
          contract_name?: FlowContractName
          object?: { id?: string }
          references?: { input_id?: string; output_id?: string | null }
        })
      : null
  const contractResponse =
    data && "contract_response" in data && data.contract_response && typeof data.contract_response === "object"
      ? (data.contract_response as {
          contract_name?: FlowContractName
          gate_result?: "pass" | "hold" | "reject"
          references?: { input_id?: string; output_id?: string | null }
        })
      : null

  return {
    contract_name: contractRequest?.contract_name ?? contractResponse?.contract_name ?? null,
    gate_result: contractResponse?.gate_result ?? null,
    input_id: contractResponse?.references?.input_id ?? contractRequest?.references?.input_id ?? null,
    output_id: contractResponse?.references?.output_id ?? contractRequest?.references?.output_id ?? null
  }
}

export async function appendBuilderContractLog(
  protocolName: string,
  response: BuilderProtocolResponse<Record<string, unknown>>
) {
  const logs = await loadBuilderContractLogs()
  const signal = readFlowSignal(response)

  logs.unshift({
    id: `${response.request_id}-${Date.now()}`,
    system: "builder",
    protocol_name: protocolName,
    request_id: response.request_id,
    contract_name: signal.contract_name,
    status: response.status,
    state: response.state,
    gate_result: signal.gate_result,
    input_id: signal.input_id,
    output_id: signal.output_id,
    timestamp: new Date().toISOString()
  })

  if (logs.length > 100) {
    logs.length = 100
  }

  await persistBuilderContractLogs(logs)
}

export async function listBuilderContractLogs() {
  return loadBuilderContractLogs()
}

export async function getBuilderContractLogCount() {
  const logs = await loadBuilderContractLogs()
  return logs.length
}


