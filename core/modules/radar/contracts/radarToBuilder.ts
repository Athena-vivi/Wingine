import type { FlowRequest, FlowResponse, ProblemObject } from "../../shared/index.ts"
import { exportProblemObjectFromRadarRecord } from "../adapters/problemExportAdapter.ts"
import type { RadarRecord } from "../types/radar.ts"

export function buildRadarToBuilderRequest(record: RadarRecord): FlowRequest<ProblemObject> {
  const problem = exportProblemObjectFromRadarRecord(record)

  return {
    contract_name: "radar_to_builder",
    producer: "radar",
    consumer: "builder",
    object: problem,
    context: {
      request_id: `radar-to-builder-${problem.id}`,
      trigger: "problem_ready_for_builder",
      sent_at: new Date().toISOString()
    }
  }
}

export function evaluateRadarToBuilderGate(problem: ProblemObject): FlowResponse {
  const accepted = Boolean(problem.id && problem.normalized_problem && problem.status !== "archived")

  return {
    contract_name: "radar_to_builder",
    accepted,
    gate_result: accepted ? "pass" : "reject",
    state_change: accepted
      ? {
          from: problem.status,
          to: "linked"
        }
      : null,
    references: {
      input_id: problem.id,
      output_id: accepted ? `workflow_${problem.id}` : null,
      output_type: accepted ? "workflow" : null
    },
    message: accepted ? "problem accepted for builder intake" : "problem rejected by builder intake gate"
  }
}


