export const SYSTEM_KEYS = ["radar", "builder", "scoring", "betting", "console", "external"] as const

export type SystemKey = (typeof SYSTEM_KEYS)[number]
