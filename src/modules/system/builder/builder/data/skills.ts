import skills from "./skills.json"
import type { SkillModule } from "../types/builder.ts"

export const skillLibrary = skills as SkillModule[]
export const coreSkillLibrary = skillLibrary.filter((skill) => skill.group !== "secondary")
export const secondarySkillLibrary = skillLibrary.filter((skill) => skill.group === "secondary")
export const skillModulesById = Object.fromEntries(skillLibrary.map((skill) => [skill.id, skill])) as Record<
  string,
  SkillModule
>

export const skillDisplay = {
  "flow-designer": {
    name: "flow_designer",
    description: "Map the problem into an executable workflow."
  },
  "capability-mapper": {
    name: "capability_mapper",
    description: "Translate workflow stages into reusable capabilities."
  },
  "spec-writer": {
    name: "spec_writer",
    description: "Produce a build-ready implementation specification."
  },
  review: {
    name: "review",
    description: "Run a structured review across feature, PR, or system changes."
  },
  debug: {
    name: "debug",
    description: "Isolate failure causes and define the fix path."
  },
  "design-review": {
    name: "design_review",
    description: "Review interface clarity, hierarchy, and usability."
  },
  "qa-check": {
    name: "qa_check",
    description: "Review artifacts for gaps, bugs, and weak assumptions."
  },
  "ship-readiness": {
    name: "ship_readiness",
    description: "Decide whether the current output is ready to ship."
  },
  "document-release": {
    name: "document_release",
    description: "Package the current output into release-ready documentation."
  },
  "design-consultation": {
    name: "design_consultation",
    description: "Provide concrete interface guidance for the current screen or flow."
  },
  "plan-design-review": {
    name: "plan_design_review",
    description: "Plan interaction structure before UI work begins."
  },
  "plan-ceo-review": {
    name: "plan_ceo_review",
    description: "Evaluate the problem with an executive decision lens."
  },
  "plan-eng-review": {
    name: "plan_eng_review",
    description: "Turn the goal into an engineering execution plan."
  },
  browse: {
    name: "browse",
    description: "Research external information that the workflow depends on."
  },
  retro: {
    name: "retro",
    description: "Capture lessons and process improvements after a cycle."
  }
} as const


