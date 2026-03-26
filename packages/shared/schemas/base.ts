import type { SystemKey } from "../enums/systems"

export type SourceRef = {
  system: SystemKey
  origin_id: string
  origin_ref: string
}

export type ObjectMetadata = {
  tags: string[]
  labels: string[]
  custom: Record<string, unknown>
}

export type ObjectTimestamps = {
  created_at: string
  updated_at: string
  observed_at: string | null
}

export type SharedObjectBase<TType extends string, TStatus extends string> = {
  id: string
  type: TType
  source: SourceRef
  status: TStatus
  metadata: ObjectMetadata
  timestamps: ObjectTimestamps
}
