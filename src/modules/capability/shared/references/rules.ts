export const REFERENCE_RULES = {
  "workflow.problem_id": "problem.id",
  "workflow.steps[].module_id": "module.id",
  "output.depends_on_modules[]": "module.id",
  "score.object_id": "problem.id | module.id | output.id | workflow.id",
  "bet.object_id": "problem.id | module.id | output.id | workflow.id",
  "bet.metadata.custom.score_id": "score.id"
} as const
