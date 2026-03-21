import { NextResponse } from "next/server"

import { listBettingContractLogs } from "@/protocol/contractLogStore"

export async function GET() {
  const events = await listBettingContractLogs()

  return NextResponse.json({
    system: "betting",
    events
  })
}
