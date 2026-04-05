import type { ProductStatusCard } from "../types.js"

export const mockPortfolioProducts: ProductStatusCard[] = [
  {
    id: "wingine-core",
    name: "System Builder",
    category: "Core System",
    stage: "control",
    health: "partial",
    currentFocus: "Consolidating workspace shell, control surfaces, and project-level visibility.",
    nextStep: "Validate the control model before any real module or runtime integration.",
    lastNote: "Builder and problem spaces now share one mother shell."
  },
  {
    id: "faceless-video",
    name: "FacelessVideo",
    category: "Content System",
    stage: "mapping",
    health: "partial",
    currentFocus: "Clarifying the problem field and narrowing publish pipeline assumptions.",
    nextStep: "Lock a first protocol boundary for content input and output.",
    lastNote: "Scheduling still needs a cleaner boundary."
  },
  {
    id: "ai-scriptmaker",
    name: "AIScriptmaker",
    category: "Creator Tool",
    stage: "module",
    health: "clear",
    currentFocus: "Comparing candidate modules for script planning and formatting.",
    nextStep: "Choose one adapter path for controlled module intake."
  },
  {
    id: "narrative-os",
    name: "NarrativeOS",
    category: "Narrative Engine",
    stage: "protocol",
    health: "drifting",
    currentFocus: "Stabilizing narrative protocol language before structure expands.",
    nextStep: "Reduce protocol ambiguity and split narrative roles more clearly.",
    lastNote: "Concept is promising, but framing still drifts."
  },
  {
    id: "module-expansion",
    name: "Module Expansion",
    category: "Infrastructure Track",
    stage: "module",
    health: "blocked",
    currentFocus: "Reviewing external capability candidates and module ownership boundaries.",
    nextStep: "Define one stable intake gate and reject the rest for now."
  },
  {
    id: "signal-lab",
    name: "SignalLab",
    category: "Exploration",
    stage: "idea",
    health: "partial",
    currentFocus: "Testing whether clustered problem sensing deserves a dedicated shell path.",
    nextStep: "Move from loose notes into a sharper mapping pass.",
    lastNote: "Still intentionally lightweight."
  }
]
