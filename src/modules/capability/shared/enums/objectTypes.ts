export const OBJECT_TYPES = ["problem", "module", "output", "workflow", "score", "bet"] as const

export type SharedObjectType = (typeof OBJECT_TYPES)[number]
