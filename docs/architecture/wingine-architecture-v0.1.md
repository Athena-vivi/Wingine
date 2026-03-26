# Wingine Architecture v0.1

## 1. System Goal

Wingine is a modular system for turning real-world problems into structured product decisions, executable system specs, runtime outputs, and content expressions.

The current target is not full-system implementation. The current target is to freeze the foundational architecture so later module-by-module development can proceed on stable boundaries.

### Core Principles

1. Each module does one thing only.
2. All modules must be separable, reusable, replaceable, and callable.
3. All modules must have standard input/output interfaces.
4. Modules must not be strongly coupled to each other.
5. Sources, platforms, models, and implementations must never be hard-coded into architecture contracts.
6. Protocol comes before capability. Capability comes before flow.
7. System structure must be stabilized before incremental implementation begins.

## 2. Layer Model

Wingine is organized into three layers. These layers must not be mixed.

### 2.1 Protocol Layer

#### Responsibility
- Define how modules are called
- Define unified request/response envelopes
- Define shared object schemas and transport contracts
- Define metadata format, naming rules, versioning rules
- Define registration and replacement rules

#### Not Responsible For
- Business judgment
- Product logic
- Workflow orchestration details
- UI state

### 2.2 Capability Layer

#### Responsibility
- Hold minimal business abilities
- Expose single-purpose callable modules
- Make each module independently invokable by UI, agent, runtime, or flow

#### Not Responsible For
- Full-chain orchestration
- UI behavior
- Cross-system routing
- Hard-coded source or platform assumptions

### 2.3 Flow Layer

#### Responsibility
- Compose modules into business chains
- Define execution order, stop conditions, forward path, and feedback path
- Coordinate module collaboration through protocol-defined contracts

#### Not Responsible For
- Replacing module logic
- Defining data schema
- Embedding platform-specific implementation details

### 2.4 Layer Order

The system order is fixed:

1. Protocol Layer
2. Capability Layer
3. Flow Layer

## 3. Core System Map

### 3.1 Main Chain

Problem Radar -> Scoring -> Betting -> Builder -> Product Runtime -> Product Scoring

### 3.2 Horizontal System

Content System

## 4. Six Core Systems

### 4.1 Problem Radar

#### Responsibility
Turn external problem signals into standardized problem assets.

#### Input
- Source URL
- Raw text
- Manual notes
- Context metadata
- Any source-specific payload

#### Output
- Problem Asset
- Source Snapshot
- Radar intake result

#### Must Not Handle
- Resource allocation
- Product building
- Runtime hosting
- Product scoring
- General content distribution logic

### 4.2 Scoring

#### Responsibility
Evaluate problem assets, systems, products, or outputs using a standard scoring model.

#### Input
- Problem Asset
- System Spec
- Runtime Snapshot
- Product Metrics

#### Output
- Scoring Result

#### Must Not Handle
- Problem ingestion
- Resource allocation
- Product construction
- Runtime execution

### 4.3 Betting

#### Responsibility
Convert scoring results into investment and priority decisions.

#### Input
- Scoring Result
- Optional policy constraints
- Optional resource limits
- Optional risk preferences

#### Output
- Betting Allocation

#### Must Not Handle
- Original scoring generation
- Product design
- Runtime execution
- Content generation

### 4.4 Builder

#### Responsibility
Convert selected and funded opportunities into structured system specifications.

#### Input
- Problem Asset
- Scoring Result
- Betting Allocation

#### Output
- System Spec
- Optional build plan

#### Must Not Handle
- Runtime hosting
- Live execution
- Problem ingestion
- Allocation policy

### 4.5 Product Runtime

#### Responsibility
Run module graphs defined by a system spec through a stable hosting and invocation layer.

#### Input
- System Spec
- Module registry
- Call requests
- Runtime context

#### Output
- Runtime Snapshot
- Execution logs
- Module outputs

#### Must Not Handle
- Choosing what to build
- Business scoring
- Problem discovery
- Content strategy

### 4.6 Content System

#### Responsibility
Provide horizontal content generation, rewriting, adaptation, and packaging across systems.

#### Input
- Problem Asset
- System Spec
- Runtime Snapshot
- Content task definition

#### Output
- Content Draft
- Content Package

#### Must Not Handle
- Core chain prioritization
- Investment decision-making
- Runtime orchestration
- Replacing upstream business assets

## 5. Module-Level Split

### 5.1 Problem Radar Modules

#### source_input_resolver
- Input: raw request
- Output: normalized source input

#### source_fetcher
- Input: normalized source input
- Output: source material

#### source_normalizer
- Input: source material
- Output: normalized source snapshot

#### problem_extractor
- Input: normalized source snapshot
- Output: raw problem candidates

#### problem_structurer
- Input: raw problem candidate
- Output: Problem Asset

#### problem_deduplicator
- Input: Problem Asset
- Output: dedupe result

#### problem_store_adapter
- Input: Problem Asset
- Output: stored asset reference

#### problem_exporter
- Input: Problem Asset
- Output: transport object

### 5.2 Scoring Modules

#### score_target_loader
- Input: target ref or target object
- Output: normalized scoring target

#### score_profile_resolver
- Input: target type
- Output: scoring profile

#### dimension_evaluator
- Input: target, profile, dimension input
- Output: dimension result

#### aggregate_resolver
- Input: dimension results
- Output: aggregate score

#### confidence_resolver
- Input: dimension results
- Output: confidence

#### gate_resolver
- Input: aggregate score, confidence, rules
- Output: gate result

#### score_record_builder
- Input: scoring outputs
- Output: Scoring Result

#### score_exporter
- Input: Scoring Result
- Output: transport object

### 5.3 Betting Modules

#### bet_input_resolver
- Input: Scoring Result and policy
- Output: normalized betting input

#### risk_normalizer
- Input: betting input
- Output: normalized factors

#### decision_resolver
- Input: normalized factors
- Output: decision

#### allocation_resolver
- Input: decision and resource policy
- Output: allocation

#### bet_record_builder
- Input: decision and allocation
- Output: Betting Allocation

#### bet_exporter
- Input: Betting Allocation
- Output: transport object

### 5.4 Builder Modules

#### problem_spec_loader
- Input: Problem Asset
- Output: builder-ready problem context

#### system_goal_resolver
- Input: problem, score, bet
- Output: system goals

#### module_planner
- Input: system goals
- Output: module list

#### workflow_planner
- Input: module list
- Output: execution workflow

#### io_contract_builder
- Input: module list and workflow
- Output: module IO contracts

#### system_spec_builder
- Input: builder outputs
- Output: System Spec

### 5.5 Product Runtime Modules

#### module_registry
- Input: module manifest
- Output: registry state

#### protocol_dispatcher
- Input: module call request
- Output: module call response

#### execution_context_manager
- Input: runtime session
- Output: execution context

#### state_store
- Input: state mutation
- Output: persisted state reference

#### activity_log_store
- Input: invocation event
- Output: log record

#### health_reporter
- Input: runtime state
- Output: health snapshot

#### runtime_executor
- Input: System Spec and call request
- Output: execution result

### 5.6 Content System Modules

#### content_task_resolver
- Input: content request
- Output: normalized content task

#### draft_generator
- Input: content task and source asset
- Output: content draft

#### rewrite_adapter
- Input: draft and target format
- Output: rewritten draft

#### package_builder
- Input: draft set
- Output: content package

#### channel_adapter
- Input: content package and channel config
- Output: channel-ready payload

## 6. Unified Interface Protocol

### 6.1 Module Request Envelope

```ts
type ModuleCallRequest<TInput = Record<string, unknown>> = {
  protocol_version: string
  request_id: string
  module: string
  action: string
  caller: {
    system: string
    role: "ui" | "flow" | "agent" | "runtime" | "api"
    id: string
  }
  input: TInput
  meta: MetaBlock
}
```

### 6.2 Module Response Envelope

```ts
type ModuleCallResponse<TOutput = Record<string, unknown>> = {
  protocol_version: string
  request_id: string
  module: string
  action: string
  status: "success" | "error"
  state: "ready" | "partial" | "rejected" | "error"
  output: TOutput | null
  error: {
    code: string
    message: string
    retryable?: boolean
  } | null
  meta: MetaBlock
}
```

### 6.3 Meta Block

```ts
type MetaBlock = {
  timestamp: string
  trace_id?: string
  session_id?: string
  asset_type?: string
  asset_id?: string
  source?: {
    provider?: string
    channel?: string
    ref?: string
  }
  tags?: string[]
  labels?: string[]
  custom?: Record<string, unknown>
}
```

### 6.4 Naming Rules

#### System Names
- problem_radar
- scoring
- betting
- builder
- product_runtime
- content_system

#### Module Names
- `<system>.<capability>`

#### Action Names
- Verb-first
- Examples:
  - resolve
  - load
  - build
  - export
  - evaluate

### 6.5 Call Rules

- All modules must use the unified request/response envelope
- All modules must accept explicit input objects
- All modules must return explicit output objects
- No module may depend on UI-local state
- Runtime dispatches modules through protocol contracts
- Flows can compose modules, but cannot bypass protocol definitions

### 6.6 Replacement Rules

- A module may have multiple implementations
- Replacement must preserve the same protocol contract
- Replacement must not change shared object schema
- Providers, models, and storage backends belong to implementation config, not to protocol schema

### 6.7 Version Rules

- `protocol_version` for call contract version
- `schema_version` for object schema version
- `module_version` for implementation version
- Breaking changes require version increment, not silent mutation

## 7. Core Data Structures

### 7.1 Problem Asset

```ts
type ProblemAsset = {
  schema_version: string
  id: string
  type: "problem_asset"
  status: "captured" | "structured" | "scored" | "betted" | "built" | "archived"
  title: string
  summary: string
  description?: string
  normalized_problem: string
  hypotheses?: string[]
  signals: {
    urgency?: number
    frequency?: number
    severity?: number
    market_pull?: number
  }
  source: {
    provider?: string
    channel?: string
    url?: string
    author_ref?: string
    observed_at?: string
  }
  evidence: Array<{
    kind: string
    content: string
    ref?: string
  }>
  tags: string[]
  labels: string[]
  metadata: Record<string, unknown>
  timestamps: {
    created_at: string
    updated_at: string
  }
}
```

### 7.2 Scoring Result

```ts
type ScoringResult = {
  schema_version: string
  id: string
  type: "scoring_result"
  target: {
    asset_type: string
    asset_id: string
  }
  dimensions: Record<string, {
    score: number
    weight?: number
    confidence?: number
    note?: string
  }>
  aggregate: {
    weighted_score: number
    average_score?: number
    confidence: number
    gate: "pass" | "hold" | "reject" | "improve"
  }
  rationale?: string[]
  scorer: {
    system: "scoring"
    profile?: string
  }
  metadata: Record<string, unknown>
  timestamps: {
    created_at: string
    updated_at: string
  }
}
```

### 7.3 Betting Allocation

```ts
type BettingAllocation = {
  schema_version: string
  id: string
  type: "betting_allocation"
  target: {
    asset_type: string
    asset_id: string
  }
  basis: {
    scoring_result_id: string
  }
  decision: "kill" | "hold" | "explore" | "double_down" | "scale"
  allocation: {
    capital?: number
    time?: number
    people?: number
    priority?: number
  }
  risk: {
    level?: "low" | "medium" | "high"
    note?: string
  }
  rationale?: string[]
  metadata: Record<string, unknown>
  timestamps: {
    created_at: string
    updated_at: string
  }
}
```

### 7.4 System Spec

```ts
type SystemSpec = {
  schema_version: string
  id: string
  type: "system_spec"
  problem_asset_id: string
  scoring_result_id?: string
  betting_allocation_id?: string
  goal: {
    name: string
    outcome: string
  }
  modules: Array<{
    id: string
    name: string
    role: string
    input_contract: string
    output_contract: string
    replaceable: boolean
  }>
  flows: Array<{
    id: string
    from_module: string
    to_module: string
    trigger: string
  }>
  runtime: {
    entry_module?: string
    state_policy?: string
    logging_policy?: string
  }
  metadata: Record<string, unknown>
  timestamps: {
    created_at: string
    updated_at: string
  }
}
```

### 7.5 Product Metrics

```ts
type ProductMetrics = {
  schema_version: string
  id: string
  type: "product_metrics"
  target: {
    system_spec_id?: string
    runtime_id?: string
    product_id?: string
  }
  acquisition?: {
    views?: number
    clicks?: number
    leads?: number
  }
  activation?: {
    starts?: number
    completions?: number
  }
  retention?: {
    d1?: number
    d7?: number
    d30?: number
  }
  monetization?: {
    revenue?: number
    conversion_rate?: number
  }
  quality?: {
    satisfaction?: number
    error_rate?: number
  }
  metadata: Record<string, unknown>
  timestamps: {
    observed_at: string
    created_at: string
  }
}
```

## 8. Problem Radar Phase 1 Development Spec

### 8.1 Goal

Build the first real Wingine sample module that converts real inputs into a standard Problem Asset.

### 8.2 Minimal Module Chain

1. source_input_resolver
2. source_fetcher
3. source_normalizer
4. problem_extractor
5. problem_structurer
6. problem_store_adapter
7. problem_exporter

### 8.3 Input Object

```ts
type RadarCaptureRequest = {
  source: {
    provider?: string
    channel?: string
    url?: string
  }
  raw_text?: string
  context?: Record<string, unknown>
  notes?: string
}
```

### 8.4 Output Object

```ts
type RadarCaptureResult = {
  asset: ProblemAsset
  storage_ref?: string
  dedupe?: {
    matched: boolean
    existing_asset_id?: string
  }
}
```

### 8.5 Excluded From Phase 1

- Content generation
- Content rewriting
- Builder workflow editing
- Scoring UI
- Betting logic
- Multi-channel publishing

### 8.6 Relation To Runtime And Shared Protocol Layer

- Radar must expose callable modules through the unified protocol
- Shared protocol layer defines Problem Asset schema and call envelope only
- Runtime is responsible for dispatch, trace, log, and registry
- Radar is responsible only for problem asset creation and export

### 8.7 Why Radar Is First

- It has the best existing foundation in the current repo
- It is closest to real external input
- It produces the upstream asset needed by later systems
- It is the best place to validate protocol-first architecture in practice

## 9. Next Development Order

### Step 1
Freeze the architecture document and system boundaries.

### Step 2
Freeze unified protocol definitions.

### Step 3
Freeze cross-module core object schemas.

### Step 4
Unify shared protocol definitions into one source of truth.

### Step 5
Build the minimal Product Runtime foundation:
- registry
- dispatcher
- log
- state
- health

### Step 6
Implement Problem Radar Phase 1 as the first real module.

### Step 7
Make Scoring consume real Problem Asset objects.

### Step 8
Make Betting consume real Scoring Result objects.

### Step 9
Refactor Builder to consume Problem Asset, Scoring Result, and Betting Allocation.

### Step 10
Extract Content System horizontally after the main chain is stable.
