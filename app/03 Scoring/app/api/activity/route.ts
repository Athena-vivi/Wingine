import { NextResponse } from "next/server"

import { listScoringContractLogs } from "@/protocol/contractLogStore"

export async function GET() {
  const events = await listScoringContractLogs()

  return NextResponse.json({
    system: "scoring",
    events
  })
}
