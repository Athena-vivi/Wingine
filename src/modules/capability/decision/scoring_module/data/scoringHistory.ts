import type { EvaluationRecord } from "../types/scoring.ts"

export const scoringHistory: EvaluationRecord[] = [
  {
    id: "problem-001-evaluation-history-1",
    systemId: "unified-scoring-v1",
    objectId: "problem-001",
    objectType: "problem",
    profileId: "problem-profile",
    dimensions: {
      value: {
        score: 4.4,
        weight: 0.35,
        confidence: 0.8,
        ownerRole: "strategist",
        evidence: ["Repeated pain signal from search term review", "Budget loss is recurring"],
        note: "High-cost, high-frequency problem."
      },
      quality: {
        score: 3.2,
        weight: 0.2,
        confidence: 0.65,
        ownerRole: "operator",
        evidence: ["Description is stable", "Boundary still needs sharper criteria"],
        note: "Actionable, but not fully bounded."
      },
      reliability: {
        score: 3.6,
        weight: 0.2,
        confidence: 0.7,
        ownerRole: "operator",
        evidence: ["Observed in multiple reviews"],
        note: "Likely persistent, not a one-off signal."
      },
      leverage: {
        score: 4.1,
        weight: 0.25,
        confidence: 0.75,
        ownerRole: "strategist",
        evidence: ["Can produce reusable ad optimization modules"],
        note: "Strong builder upside."
      }
    },
    aggregate: {
      weightedScore: 3.9,
      dimensionAverage: 3.83,
      confidence: 0.73,
      gateResult: "pass"
    },
    execution: {
      evaluators: ["strategist", "operator", "reviewer"],
      timestamp: "2026-03-12T10:00:00.000Z",
      version: "0.9",
      roleInputs: {
        strategist: {
          role: "strategist",
          focusDimensions: ["value", "leverage"],
          status: "reviewed",
          note: "Value and leverage review completed."
        },
        operator: {
          role: "operator",
          focusDimensions: ["quality", "reliability"],
          status: "reviewed",
          note: "Operational scoring completed."
        },
        reviewer: {
          role: "reviewer",
          focusDimensions: ["value", "quality", "reliability", "leverage"],
          status: "reviewed",
          note: "Final review complete."
        }
      }
    }
  },
  {
    id: "module-001-evaluation-history-1",
    systemId: "unified-scoring-v1",
    objectId: "module-001",
    objectType: "module",
    profileId: "module-profile",
    dimensions: {
      value: {
        score: 4,
        weight: 0.25,
        confidence: 0.75,
        ownerRole: "strategist",
        evidence: ["Needed by multiple workflows"],
        note: "Core reuse candidate."
      },
      quality: {
        score: 3.4,
        weight: 0.25,
        confidence: 0.65,
        ownerRole: "operator",
        evidence: ["Input and output are mostly defined"],
        note: "Definition is usable but can be tightened."
      },
      reliability: {
        score: 3.1,
        weight: 0.25,
        confidence: 0.6,
        ownerRole: "operator",
        evidence: ["Behavior still depends on manual mapping quality"],
        note: "Usable with some drift risk."
      },
      leverage: {
        score: 4.3,
        weight: 0.25,
        confidence: 0.8,
        ownerRole: "strategist",
        evidence: ["Reusable across many builder flows"],
        note: "High library value."
      }
    },
    aggregate: {
      weightedScore: 3.7,
      dimensionAverage: 3.7,
      confidence: 0.7,
      gateResult: "pass"
    },
    execution: {
      evaluators: ["strategist", "operator", "reviewer"],
      timestamp: "2026-03-10T09:30:00.000Z",
      version: "0.8",
      roleInputs: {
        strategist: {
          role: "strategist",
          focusDimensions: ["value", "leverage"],
          status: "reviewed",
          note: "Module value confirmed."
        },
        operator: {
          role: "operator",
          focusDimensions: ["quality", "reliability"],
          status: "reviewed",
          note: "Definition reviewed."
        },
        reviewer: {
          role: "reviewer",
          focusDimensions: ["value", "quality", "reliability", "leverage"],
          status: "reviewed",
          note: "Approved for pass."
        }
      }
    }
  },
  {
    id: "output-001-evaluation-history-1",
    systemId: "unified-scoring-v1",
    objectId: "output-001",
    objectType: "output",
    profileId: "output-profile",
    dimensions: {
      value: {
        score: 4.2,
        weight: 0.3,
        confidence: 0.8,
        ownerRole: "strategist",
        evidence: ["Solves a real PPC optimization need"],
        note: "Delivery target is strong."
      },
      quality: {
        score: 3.1,
        weight: 0.3,
        confidence: 0.65,
        ownerRole: "operator",
        evidence: ["Core flow exists", "Still in testing"],
        note: "Usable but not polished."
      },
      reliability: {
        score: 2.9,
        weight: 0.25,
        confidence: 0.6,
        ownerRole: "operator",
        evidence: ["Testing status indicates remaining variance"],
        note: "Needs more stable validation."
      },
      leverage: {
        score: 3.8,
        weight: 0.15,
        confidence: 0.72,
        ownerRole: "strategist",
        evidence: ["Can seed future output templates"],
        note: "Good but not full asset maturity."
      }
    },
    aggregate: {
      weightedScore: 3.43,
      dimensionAverage: 3.5,
      confidence: 0.69,
      gateResult: "improve"
    },
    execution: {
      evaluators: ["strategist", "operator", "reviewer"],
      timestamp: "2026-03-08T08:45:00.000Z",
      version: "0.7",
      roleInputs: {
        strategist: {
          role: "strategist",
          focusDimensions: ["value", "leverage"],
          status: "reviewed",
          note: "Output still has upside."
        },
        operator: {
          role: "operator",
          focusDimensions: ["quality", "reliability"],
          status: "reviewed",
          note: "Testing gaps remain."
        },
        reviewer: {
          role: "reviewer",
          focusDimensions: ["value", "quality", "reliability", "leverage"],
          status: "reviewed",
          note: "Kept in improve state."
        }
      }
    }
  },
  {
    id: "workflow-001-evaluation-history-1",
    systemId: "unified-scoring-v1",
    objectId: "workflow-001",
    objectType: "workflow",
    profileId: "workflow-profile",
    dimensions: {
      value: {
        score: 3.9,
        weight: 0.2,
        confidence: 0.72,
        ownerRole: "strategist",
        evidence: ["Moves the PPC problem toward output"],
        note: "Useful repeatable path."
      },
      quality: {
        score: 3.3,
        weight: 0.3,
        confidence: 0.66,
        ownerRole: "operator",
        evidence: ["Sequence exists", "Some transitions still loose"],
        note: "Mostly clear path."
      },
      reliability: {
        score: 3.2,
        weight: 0.3,
        confidence: 0.65,
        ownerRole: "operator",
        evidence: ["Dependencies are partially stable"],
        note: "Repeatable with some risk."
      },
      leverage: {
        score: 4,
        weight: 0.2,
        confidence: 0.76,
        ownerRole: "strategist",
        evidence: ["Good candidate for template reuse"],
        note: "Good pattern value."
      }
    },
    aggregate: {
      weightedScore: 3.53,
      dimensionAverage: 3.6,
      confidence: 0.7,
      gateResult: "pass"
    },
    execution: {
      evaluators: ["strategist", "operator", "reviewer"],
      timestamp: "2026-03-11T11:15:00.000Z",
      version: "0.8",
      roleInputs: {
        strategist: {
          role: "strategist",
          focusDimensions: ["value", "leverage"],
          status: "reviewed",
          note: "Workflow reuse value confirmed."
        },
        operator: {
          role: "operator",
          focusDimensions: ["quality", "reliability"],
          status: "reviewed",
          note: "Execution path reviewed."
        },
        reviewer: {
          role: "reviewer",
          focusDimensions: ["value", "quality", "reliability", "leverage"],
          status: "reviewed",
          note: "Workflow approved."
        }
      }
    }
  }
]


