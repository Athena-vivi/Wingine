import { NextResponse } from "next/server"

import { loadAllSystemActivity } from "@/connectors/activity"

export async function GET() {
  const systems = await loadAllSystemActivity()
  return NextResponse.json({
    systems
  })
}
