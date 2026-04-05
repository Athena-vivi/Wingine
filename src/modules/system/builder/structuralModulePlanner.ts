import type { BuildSystemGoal } from "../../../contracts/index.ts"

type StructuralModuleList = {
  modules: string[]
}

const BASE_STRUCTURAL_MODULES = [
  "builder.problem_spec_loader",
  "builder.system_goal_resolver",
  "builder.workflow_planner"
]

export function planStructuralModules(goal: BuildSystemGoal): StructuralModuleList {
  const type = String(goal.problem_type ?? goal.builder_record?.problem?.tag ?? "").toLowerCase()

  if (type === "ads") {
    return {
      modules: [...BASE_STRUCTURAL_MODULES, "builder.ads_signal_analyzer"]
    }
  }

  if (type === "content") {
    return {
      modules: [...BASE_STRUCTURAL_MODULES, "builder.content_pipeline_designer"]
    }
  }

  if (type === "analytics") {
    return {
      modules: [...BASE_STRUCTURAL_MODULES, "builder.metric_model_builder"]
    }
  }

  return {
    modules: BASE_STRUCTURAL_MODULES
  }
}
