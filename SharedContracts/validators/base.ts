export function hasBaseFields(input: unknown): input is {
  id: string
  type: string
  source: { system: string; origin_id: string; origin_ref: string }
  status: string
  metadata: { tags: unknown[]; labels: unknown[]; custom: Record<string, unknown> }
  timestamps: { created_at: string; updated_at: string; observed_at: string | null }
} {
  if (!input || typeof input !== "object") {
    return false
  }

  const candidate = input as Record<string, unknown>

  return Boolean(
    typeof candidate.id === "string" &&
      typeof candidate.type === "string" &&
      candidate.source &&
      typeof candidate.source === "object" &&
      typeof (candidate.source as Record<string, unknown>).system === "string" &&
      typeof candidate.status === "string" &&
      candidate.metadata &&
      typeof candidate.metadata === "object" &&
      candidate.timestamps &&
      typeof candidate.timestamps === "object"
  )
}
