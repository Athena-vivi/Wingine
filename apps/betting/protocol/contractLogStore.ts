import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

import type { ContractInvocationLogEntry, FlowContractName } from "../../SharedContracts"
import type { ProtocolResponse } from "@/types/protocol"

const LOG_PATH = path.join(process.cwd(), "data", "contract-activity.json")
let bettingContractLogs: ContractInvocationLogEntry[] | null = null

async function loadBettingContractLogs() {
  if (bettingContractLogs) {
    return bettingContractLogs
  }

  try {
    const raw = await readFile(LOG_PATH, "utf8")
    bettingContractLogs = JSON.parse(raw) as ContractInvocationLogEntry[]
  } catch {
    bettingContractLogs = []
  }

  return bettingContractLogs
}

async function persistBettingContractLogs(logs: ContractInvocationLogEntry[]) {
  await mkdir(path.dirname(LOG_PATH), { recursive: true })
  await writeFile(LOG_PATH, JSON.stringify(logs, null, 2), "utf8")
}

function readFlowSignal(response: ProtocolResponse<Record<string, unknown>>) {
  const data = response.data as Record<string, unknown> | null
  const contractRequest =
    data && "contract_request" in data && data.contract_request && typeof data.contract_request === "object"
      ? (data.contract_request as {
          contract_name?: FlowContractName
          object?: { id?: string }
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
  const bet =
    data && "bet" in data && data.bet && typeof data.bet === "object"
      ? (data.bet as { id?: string })
      : null

  return {
    contract_name: contractRequest?.contract_name ?? contractResponse?.contract_name ?? null,
    gate_result: contractResponse?.gate_result ?? null,
    input_id: contractResponse?.references?.input_id ?? contractRequest?.object?.id ?? null,
    output_id: contractResponse?.references?.output_id ?? bet?.id ?? null
  }
}

export async function appendBettingContractLog(
  protocolName: string,
  response: ProtocolResponse<Record<string, unknown>>
) {
  const logs = await loadBettingContractLogs()
  const signal = readFlowSignal(response)

  logs.unshift({
    id: `${response.request_id}-${Date.now()}`,
    system: "betting",
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

  await persistBettingContractLogs(logs)
}

export async function listBettingContractLogs() {
  return loadBettingContractLogs()
}

export async function getBettingContractLogCount() {
  const logs = await loadBettingContractLogs()
  return logs.length
}
