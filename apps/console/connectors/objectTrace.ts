import { loadAllSystemActivity } from "@/connectors/activity"
import type { ObjectTraceEvent, ObjectTraceManifest } from "@/types/console"

export async function loadObjectTrace(objectId: string): Promise<ObjectTraceManifest> {
  const systems = await loadAllSystemActivity()
  const events: ObjectTraceEvent[] = []

  for (const system of systems) {
    for (const event of system.events) {
      if (event.input_id === objectId) {
        events.push({
          id: `${event.id}-input`,
          system: event.system,
          protocol_name: event.protocol_name,
          contract_name: event.contract_name,
          status: event.status,
          state: event.state,
          gate_result: event.gate_result,
          role: "input",
          object_id: objectId,
          timestamp: event.timestamp
        })
      }

      if (event.output_id === objectId) {
        events.push({
          id: `${event.id}-output`,
          system: event.system,
          protocol_name: event.protocol_name,
          contract_name: event.contract_name,
          status: event.status,
          state: event.state,
          gate_result: event.gate_result,
          role: "output",
          object_id: objectId,
          timestamp: event.timestamp
        })
      }
    }
  }

  const sortedEvents = [...events].sort((a, b) => b.timestamp.localeCompare(a.timestamp))

  return {
    object_id: objectId,
    events: sortedEvents,
    systems: Array.from(new Set(sortedEvents.map((event) => event.system))),
    contracts: Array.from(new Set(sortedEvents.map((event) => event.contract_name).filter(Boolean))) as string[]
  }
}
