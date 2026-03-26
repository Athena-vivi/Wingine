# Wingine Core Object Schema Freeze v0.1

## 1. Problem Asset

```ts
type ProblemAsset = {
  schema_version: string                    // required
  id: string                                // required
  type: "problem_asset"                     // required
  status: "captured" | "structured" | "scored" | "betted" | "built" | "archived" // required
  title: string                             // required
  summary: string                           // required
  description?: string                      // optional
  normalized_problem: string                // required
  hypotheses?: string[]                     // optional
  signals: {                                // required
    urgency?: number                        // optional
    frequency?: number                      // optional
    severity?: number                       // optional
    market_pull?: number                    // optional
  }
  source: {                                 // required
    provider?: string                       // optional
    channel?: string                        // optional
    url?: string                            // optional
    author_ref?: string                     // optional
    observed_at?: string                    // optional
  }
  evidence: Array<{                         // required
    kind: string                            // required
    content: string                         // required
    ref?: string                            // optional
  }>
  tags: string[]                            // required
  labels: string[]                          // required
  metadata: Record<string, unknown>         // required
  timestamps: {                             // required
    created_at: string                      // required
    updated_at: string                      // required
  }
}
```

## 2. Scoring Result

```ts
type ScoringResult = {
  schema_version: string                    // required
  id: string                                // required
  type: "scoring_result"                    // required
  target: {                                 // required
    asset_type: string                      // required
    asset_id: string                        // required
  }
  dimensions: Record<string, {              // required
    score: number                           // required
    weight?: number                         // optional
    confidence?: number                     // optional
    note?: string                           // optional
  }>
  aggregate: {                              // required
    weighted_score: number                  // required
    average_score?: number                  // optional
    confidence: number                      // required
    gate: "pass" | "hold" | "reject" | "improve" // required
  }
  rationale?: string[]                      // optional
  scorer: {                                 // required
    system: "scoring"                       // required
    profile?: string                        // optional
  }
  metadata: Record<string, unknown>         // required
  timestamps: {                             // required
    created_at: string                      // required
    updated_at: string                      // required
  }
}
```

## 3. Betting Allocation

```ts
type BettingAllocation = {
  schema_version: string                    // required
  id: string                                // required
  type: "betting_allocation"                // required
  target: {                                 // required
    asset_type: string                      // required
    asset_id: string                        // required
  }
  basis: {                                  // required
    scoring_result_id: string               // required
  }
  decision: "kill" | "hold" | "explore" | "double_down" | "scale" // required
  allocation: {                             // required
    capital?: number                        // optional
    time?: number                           // optional
    people?: number                         // optional
    priority?: number                       // optional
  }
  risk: {                                   // required
    level?: "low" | "medium" | "high"       // optional
    note?: string                           // optional
  }
  rationale?: string[]                      // optional
  metadata: Record<string, unknown>         // required
  timestamps: {                             // required
    created_at: string                      // required
    updated_at: string                      // required
  }
}
```

## 4. System Spec

```ts
type SystemSpec = {
  schema_version: string                    // required
  id: string                                // required
  type: "system_spec"                       // required
  problem_asset_id: string                  // required
  scoring_result_id?: string                // optional
  betting_allocation_id?: string            // optional
  goal: {                                   // required
    name: string                            // required
    outcome: string                         // required
  }
  modules: Array<{                          // required
    id: string                              // required
    name: string                            // required
    role: string                            // required
    input_contract: string                  // required
    output_contract: string                 // required
    replaceable: boolean                    // required
  }>
  flows: Array<{                            // required
    id: string                              // required
    from_module: string                     // required
    to_module: string                       // required
    trigger: string                         // required
  }>
  runtime: {                                // required
    entry_module?: string                   // optional
    state_policy?: string                   // optional
    logging_policy?: string                 // optional
  }
  metadata: Record<string, unknown>         // required
  timestamps: {                             // required
    created_at: string                      // required
    updated_at: string                      // required
  }
}
```

## 5. Product Metrics

```ts
type ProductMetrics = {
  schema_version: string                    // required
  id: string                                // required
  type: "product_metrics"                   // required
  target: {                                 // required
    system_spec_id?: string                 // optional
    runtime_id?: string                     // optional
    product_id?: string                     // optional
  }
  acquisition?: {                           // optional
    views?: number                          // optional
    clicks?: number                         // optional
    leads?: number                          // optional
  }
  activation?: {                            // optional
    starts?: number                         // optional
    completions?: number                    // optional
  }
  retention?: {                             // optional
    d1?: number                             // optional
    d7?: number                             // optional
    d30?: number                            // optional
  }
  monetization?: {                          // optional
    revenue?: number                        // optional
    conversion_rate?: number                // optional
  }
  quality?: {                               // optional
    satisfaction?: number                   // optional
    error_rate?: number                     // optional
  }
  metadata: Record<string, unknown>         // required
  timestamps: {                             // required
    observed_at: string                     // required
    created_at: string                      // required
  }
}
```
