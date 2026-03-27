import type { ProblemObject } from "../modules/capability/shared/index.ts"

export type BuildMode = "content" | "system"

export type BuildSystemGoal = {
  name: string
  outcome: string
  problem_type?: string
  builder_record?: {
    problem?: {
      tag?: string
    }
  }
}

export type BuildModuleFlow = {
  from: string
  to: string
}

export type ContentAsset = {
  topic: string
  audience: string
  angle: string
  core_claim: string
  outline: string[]
}

export type SystemSpec = {
  type: "system_spec"
  modules: string[]
  flows: BuildModuleFlow[]
}

export type BuildContentInput = {
  mode: "content"
  problem: ProblemObject
}

export type BuildSystemInput = {
  mode: "system"
  goal: BuildSystemGoal
}

export type BuildInput = BuildContentInput | BuildSystemInput

export type BuildContentResult = ContentAsset
export type BuildSystemResult = SystemSpec
export type BuildResult = BuildContentResult | BuildSystemResult
