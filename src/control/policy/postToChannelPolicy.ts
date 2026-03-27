export function resolvePostDecisionReason(input: {
  baseReason: string
  mode: "auto" | "direct"
  decision: "invest" | "skip" | "hold"
}) {
  if (input.mode === "direct" && input.decision !== "invest") {
    return `${input.baseReason}; direct mode bypassed the generation gate`
  }

  return input.baseReason
}
