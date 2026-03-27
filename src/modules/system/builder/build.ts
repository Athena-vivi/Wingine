import type {
  BuildContentResult,
  BuildInput,
  BuildSystemGoal,
  BuildSystemResult,
  ProblemObject
} from "../../../contracts/index.ts"
import { buildContentAsset } from "./content/contentAssetBuilder.ts"
import { buildSystemSpec } from "./systemSpecBuilder.ts"
import { buildModuleIOContracts } from "./ioContractBuilder.ts"
import { planStructuralModules } from "./structuralModulePlanner.ts"

export type {
  BuildContentInput,
  BuildContentResult,
  BuildInput,
  BuildMode,
  BuildResult,
  BuildSystemInput,
  BuildSystemResult
} from "../../../contracts/index.ts"

export function build(input: { mode: "content"; problem: ProblemObject }): BuildContentResult
export function build(input: { mode: "system"; goal: BuildSystemGoal }): BuildSystemResult
export function build(input: BuildInput) {
  if (input.mode === "content") {
    return buildContentAsset(input.problem)
  }

  const modulePlan = planStructuralModules(input.goal)
  const contractPlan = buildModuleIOContracts(modulePlan)

  return buildSystemSpec({
    modules: modulePlan.modules,
    contracts: contractPlan.contracts
  })
}


