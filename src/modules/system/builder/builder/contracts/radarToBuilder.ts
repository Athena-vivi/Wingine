import type { FlowResponse, ProblemObject } from "../../../../capability/shared/index.ts"

export function evaluateRadarToBuilderGate(problem: ProblemObject): FlowResponse {
  const accepted = Boolean(problem.id && problem.title && problem.normalized_problem)

  return {
    contract_name: "radar_to_builder",
    accepted,
    gate_result: accepted ? "pass" : "reject",
    state_change: accepted
      ? {
          from: problem.status,
          to: problem.status
        }
      : null,
    references: {
      input_id: problem.id,
      output_id: accepted ? `builder_problem_${problem.id}` : null,
      output_type: accepted ? "problem" : null
    },
    message: accepted ? "problem accepted into builder" : "problem rejected by builder intake gate"
  }
}
