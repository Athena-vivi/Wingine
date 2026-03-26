import type { BuilderCapabilityDefinition, UITemplate } from "@/types/builder"

type ResolveUITemplateInput = {
  templateId: string
  templates: UITemplate[]
}

export const uiTemplateManagerCapability: BuilderCapabilityDefinition = {
  name: "ui_template_manager",
  purpose: "Load and expose the builder UI template asset for human, agent, and api use.",
  input_schema: {
    template_id: "string",
    templates: "ui_template[]"
  },
  process_logic: [
    "resolve ui template asset by id",
    "fallback to default available template when missing",
    "return normalized template payload"
  ],
  output_schema: {
    ui_template: "ui_template"
  },
  state: "idle|loading|ready|error",
  trigger: "called on builder load or template request",
  error_handling: {
    template_missing: "fallback to first available template",
    invalid_template_id: "fallback to first available template"
  }
}

export function resolveUITemplate({ templateId, templates }: ResolveUITemplateInput): { template: UITemplate } {
  const template = templates.find((item) => item.id === templateId) ?? templates[0]

  return { template }
}
