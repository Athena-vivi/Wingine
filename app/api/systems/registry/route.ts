import { NextResponse } from "next/server"

import { loadAllSystemRegistries } from "@/connectors/systems"

export async function GET() {
  const registries = await loadAllSystemRegistries()
  return NextResponse.json({
    systems: registries
  })
}
