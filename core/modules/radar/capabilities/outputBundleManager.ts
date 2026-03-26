import type { GeneratedContent, OutputBundle, RadarCapabilityDefinition, RadarRecord, RadarSaveResult } from "../types/radar.ts"

export const outputBundleManagerCapability: RadarCapabilityDefinition = {
  name: "output_bundle_manager",
  purpose: "Build and normalize the output bundle for workspace display and downstream invocation.",
  input_schema: {
    radar_record: "radar_record|null",
    generated_content: "generated_content|null",
    save_result: "radar_save_result|null"
  },
  process_logic: [
    "normalize radar output state",
    "normalize generated content state",
    "normalize save result state",
    "return unified output bundle"
  ],
  output_schema: {
    output_bundle: "output_bundle"
  },
  state: "idle|building|ready|error",
  trigger: "called after analyze, save, generate, or rewrite",
  error_handling: {
    bundle_failed: "return partial output bundle"
  }
}

export function buildOutputBundle({
  radarRecord,
  generatedContent,
  saveResult
}: {
  radarRecord: RadarRecord | null
  generatedContent: GeneratedContent | null
  saveResult: RadarSaveResult | null
}): OutputBundle {
  return {
    radarRecord,
    generatedContent,
    saveResult
  }
}


