export function shouldDetachCapabilityOnMutation(action: string) {
  return action === "delete_custom"
}

export function resolveTemplateSelection<TTemplate>(input: {
  templateId: string
  templates: TTemplate[]
  resolveId: (template: TTemplate) => string
}) {
  return input.templates.find((item) => input.resolveId(item) === input.templateId) ?? input.templates[0]
}
