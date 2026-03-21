import { NextResponse } from "next/server"

import { listRadarContractLogs } from "@/protocol/contractLogStore"

export async function GET() {
  const events = await listRadarContractLogs()

  return NextResponse.json({
    system: "radar",
    events
  })
}
