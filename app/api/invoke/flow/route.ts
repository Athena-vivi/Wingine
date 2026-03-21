import { NextResponse } from "next/server"

import { invokeFlowContract } from "@/connectors/invoke"
import type { FlowContractName } from "../../../../SharedContracts"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      contract_name: FlowContractName | "mvp_main_chain"
      payload: Record<string, unknown>
    }

    const result = await invokeFlowContract(body)

    return NextResponse.json({
      ok: true,
      result
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Flow invocation failed"
      },
      {
        status: 400
      }
    )
  }
}
