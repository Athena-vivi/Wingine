import { scoringObjects } from "@/data/scoringObjects"
import { scoringProfiles } from "@/data/scoringProfiles"
import { scoringWeights } from "@/data/scoringWeights"
import type {
  CapabilityDefinition,
  PersistWorkspacePayload,
  ProtocolRequest,
  ProtocolResponse
} from "@/types/protocol"
import type { DimensionScoreEntry, EvaluationRecord, EvaluatorRole, RoleInput, ScoringDimension, ScoringObject } from "@/types/scoring"

const STORAGE_KEY = "scoring-console-state-v1"

type LoadPayload = {
  action?: "load" | "persist"
  selected_object_id: string
  evaluations?: Record<string, EvaluationRecord>
}

type PersistData = {
  saved: boolean
}

type LoadData = {
  evaluations: Record<string, EvaluationRecord>
  selected_object_id: string
}

const defaultOwner: Record<ScoringDimension, EvaluatorRole> = {
  value: "strategist",
  quality: "operator",
  reliability: "operator",
  leverage: "strategist"
}

const defaultRoleInputs: Record<EvaluatorRole, RoleInput> = {
  strategist: {
    role: "strategist",
    focusDimensions: ["value", "leverage"],
    status: "active",
    note: "Own value and leverage judgment."
  },
  operator: {
    role: "operator",
    focusDimensions: ["quality", "reliability"],
    status: "active",
    note: "Own quality and reliability judgment."
  },
  reviewer: {
    role: "reviewer",
    focusDimensions: ["value", "quality", "reliability", "leverage"],
    status: "pending",
    note: "Review all dimensions before final decision."
  }
}

export const evaluationRecordManagerCapability: CapabilityDefinition = {
  name: "evaluation_record_manager",
  purpose: "Create, update, normalize, and persist the active evaluation record.",
  input_schema: {
    action: "create|update|load|persist",
    evaluation_record: "evaluation_record",
    object_id: "string"
  },
  process_logic: [
    "create default record for requested object",
    "merge capability outputs into evaluation record",
    "normalize aggregate fields",
    "persist active record to storage when requested"
  ],
  output_schema: {
    evaluation_record: "evaluation_record"
  },
  state: "idle|creating|updating|persisting|ready|error",
  trigger: "called on object load, score update, role update, or save request",
  error_handling: {
    record_missing: "create default record",
    persist_failure: "return unsaved state with error",
    invalid_record: "reject write"
  }
}

function createDefaultEvaluationRecord(object: ScoringObject): EvaluationRecord {
  const profile = scoringProfiles.find((item) => item.objectType === object.type)!
  const weights = scoringWeights[object.type]

  const dimensions = (["value", "quality", "reliability", "leverage"] as ScoringDimension[]).reduce<
    Record<ScoringDimension, DimensionScoreEntry>
  >((acc, dimension) => {
    acc[dimension] = {
      score: 3,
      weight: weights[dimension],
      confidence: 0.7,
      ownerRole: defaultOwner[dimension],
      evidence: [],
      note: profile.dimensions[dimension].meaning
    }

    return acc
  }, {} as Record<ScoringDimension, DimensionScoreEntry>)

  return {
    id: `${object.type}-${object.id}-evaluation`,
    systemId: "unified-scoring-v1",
    objectId: object.id,
    objectType: object.type,
    profileId: profile.id,
    dimensions,
    aggregate: {
      weightedScore: 3,
      dimensionAverage: 3,
      confidence: 0.7,
      gateResult: "improve"
    },
    execution: {
      evaluators: ["strategist", "operator", "reviewer"],
      timestamp: new Date().toISOString(),
      version: "1.0",
      roleInputs: {
        strategist: { ...defaultRoleInputs.strategist, focusDimensions: [...defaultRoleInputs.strategist.focusDimensions] },
        operator: { ...defaultRoleInputs.operator, focusDimensions: [...defaultRoleInputs.operator.focusDimensions] },
        reviewer: { ...defaultRoleInputs.reviewer, focusDimensions: [...defaultRoleInputs.reviewer.focusDimensions] }
      }
    }
  }
}

export function invokeEvaluationRecordLoad(
  request: ProtocolRequest<LoadPayload>
): ProtocolResponse<LoadData> {
  const seeded = Object.fromEntries(scoringObjects.map((object) => [object.id, createDefaultEvaluationRecord(object)]))
  const selectedObjectId = request.payload.selected_object_id

  return {
    request_id: request.request_id,
    capability: evaluationRecordManagerCapability.name,
    status: "success",
    state: "ready",
    data: {
      evaluations: {
        ...seeded,
        ...(request.payload.evaluations ?? {})
      },
      selected_object_id: selectedObjectId
    },
    error: null
  }
}

export function invokeEvaluationRecordPersist(
  request: ProtocolRequest<PersistWorkspacePayload>
): ProtocolResponse<PersistData> {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        selectedObjectId: request.payload.selectedObjectId,
        evaluations: request.payload.evaluations
      })
    )

    return {
      request_id: request.request_id,
      capability: evaluationRecordManagerCapability.name,
      status: "success",
      state: "ready",
      data: {
        saved: true
      },
      error: null
    }
  } catch {
    return {
      request_id: request.request_id,
      capability: evaluationRecordManagerCapability.name,
      status: "error",
      state: "error",
      data: null,
      error: {
        code: "persist_failure",
        message: "failed to persist evaluation state"
      }
    }
  }
}

export function invokeEvaluationRecordManager(
  request: ProtocolRequest<
    | LoadPayload
    | (PersistWorkspacePayload & {
        action?: "persist"
      })
  >
): ProtocolResponse<LoadData | PersistData> {
  const action = "action" in request.payload ? request.payload.action : undefined

  if (action === "persist") {
    return invokeEvaluationRecordPersist(request as ProtocolRequest<PersistWorkspacePayload>)
  }

  return invokeEvaluationRecordLoad(request as ProtocolRequest<LoadPayload>)
}

export function loadPersistedEvaluationRecordState(): {
  selectedObjectId?: string
  evaluations?: Record<string, EvaluationRecord>
} | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)

    if (!stored) {
      return null
    }

    return JSON.parse(stored) as {
      selectedObjectId?: string
      evaluations?: Record<string, EvaluationRecord>
    }
  } catch {
    window.localStorage.removeItem(STORAGE_KEY)
    return null
  }
}
