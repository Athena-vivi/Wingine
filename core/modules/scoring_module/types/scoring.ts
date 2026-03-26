export type ScoringObjectType = "problem" | "module" | "output" | "workflow"

export type ScoringDimension = "value" | "quality" | "reliability" | "leverage"

export type EvaluatorRole = "strategist" | "operator" | "reviewer"

export type GateResult = "reject" | "hold" | "improve" | "pass" | "prioritize"

export type RoleInputStatus = "pending" | "active" | "reviewed"

export type ScoringObject = {
  id: string
  type: ScoringObjectType
  title: string
  summary: string
  status?: string
  source?: string
  metadata?: Record<string, string | number | boolean>
}

export type DimensionProfile = {
  meaning: string
  highScoreRule: string[]
  lowScoreRule: string[]
}

export type TypeProfile = {
  id: string
  objectType: ScoringObjectType
  dimensions: Record<ScoringDimension, DimensionProfile>
}

export type DimensionScoreEntry = {
  score: number
  weight: number
  confidence: number
  ownerRole: EvaluatorRole
  evidence: string[]
  note: string
}

export type RoleInput = {
  role: EvaluatorRole
  focusDimensions: ScoringDimension[]
  status: RoleInputStatus
  note: string
}

export type EvaluationRecord = {
  id: string
  systemId: "unified-scoring-v1"
  objectId: string
  objectType: ScoringObjectType
  profileId: string
  dimensions: Record<ScoringDimension, DimensionScoreEntry>
  aggregate: {
    weightedScore: number
    dimensionAverage: number
    confidence: number
    gateResult: GateResult
  }
  execution: {
    evaluators: EvaluatorRole[]
    timestamp: string
    version: string
    roleInputs: Record<EvaluatorRole, RoleInput>
  }
}

export type WeightConfig = Record<ScoringObjectType, Record<ScoringDimension, number>>
