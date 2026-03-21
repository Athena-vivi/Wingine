import { NextResponse } from "next/server"

import { listBuilderContractLogs } from "@/protocol/contractLogStore"

export async function GET() {
  const events = await listBuilderContractLogs()

  return NextResponse.json({
    system: "builder",
    events
  })
}
