import { skillDisplay } from "@/data/skills"
import type { BuilderCapabilityDefinition, Capability, CapabilitySet } from "@/types/builder"

type AttachmentMutation =
  | { action: "load" }
  | { action: "create_custom"; item: Capability }
  | { action: "attach_skill"; skillId: string; itemId: string }
  | { action: "update_custom"; capabilityId: string; field: "name" | "description"; value: string }
  | { action: "delete_custom"; capabilityId: string }

type RunCapabilityAttachmentManagerInput = {
  problemId: string
  capabilitySets: CapabilitySet[]
  mutation: AttachmentMutation
}

export const capabilityAttachmentManagerCapability: BuilderCapabilityDefinition = {
  name: "capability_attachment_manager",
  purpose: "Attach or detach capability assets for the active problem.",
  input_schema: {
    problem_id: "string",
    capability_sets: "capability_set[]",
    action: "load|create_custom|attach_skill|update_custom|delete_custom",
    capability_id: "string",
    skill_id: "string",
    name: "string",
    description: "string"
  },
  process_logic: [
    "load capability attachment set by problem id",
    "apply requested attachment mutation",
    "normalize attached capability set",
    "return updated capability set collection"
  ],
  output_schema: {
    capability_sets: "capability_set[]",
    capability_set: "capability_set"
  },
  state: "idle|loading|updating|ready|error",
  trigger: "called on capability library interaction or attached capability editing",
  error_handling: {
    capability_not_found: "ignore invalid mutation",
    attachment_missing: "return existing capability set",
    invalid_payload: "return existing capability set"
  }
}

export function runCapabilityAttachmentManager({
  problemId,
  capabilitySets,
  mutation
}: RunCapabilityAttachmentManagerInput): {
  capabilitySets: CapabilitySet[]
  capabilitySet: CapabilitySet
} {
  const existing =
    capabilitySets.find((set) => set.problemId === problemId) ?? {
      problemId,
      items: []
    }

  let nextCapabilitySet = existing

  switch (mutation.action) {
    case "load":
      nextCapabilitySet = existing
      break
    case "create_custom":
      nextCapabilitySet = {
        ...existing,
        items: [...existing.items, mutation.item]
      }
      break
    case "attach_skill": {
      const preset = skillDisplay[mutation.skillId as keyof typeof skillDisplay]

      if (!preset) {
        nextCapabilitySet = existing
        break
      }

      nextCapabilitySet = {
        ...existing,
        items: [
          ...existing.items,
          {
            id: mutation.itemId,
            name: preset.name,
            description: preset.description,
            source: "skill-library",
            skillId: mutation.skillId
          }
        ]
      }
      break
    }
    case "update_custom":
      nextCapabilitySet = {
        ...existing,
        items: existing.items.map((item) =>
          item.id === mutation.capabilityId ? { ...item, [mutation.field]: mutation.value } : item
        )
      }
      break
    case "delete_custom":
      nextCapabilitySet = {
        ...existing,
        items: existing.items.filter((item) => item.id !== mutation.capabilityId)
      }
      break
  }

  const rest = capabilitySets.filter((set) => set.problemId !== problemId)

  return {
    capabilitySets: [...rest, nextCapabilitySet],
    capabilitySet: nextCapabilitySet
  }
}
