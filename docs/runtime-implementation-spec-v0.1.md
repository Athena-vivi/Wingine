# Wingine Runtime Implementation Spec v0.1

## Runtime Role

Runtime is the protocol hosting layer of Wingine, not the business layer.

It is responsible for:
- accepting standardized module call requests
- interpreting requests through protocol
- selecting the appropriate invocation method
- recording invocation facts
- providing minimal runtime support state
- exposing a minimal health surface

It is not responsible for:
- defining business semantics
- deciding flow logic
- owning business truth
- owning shared object meaning
- replacing Radar, Scoring, Betting, Builder, or Content

Runtime and system relationship:
- for business systems, Runtime is the invocation host, not the business authority
- for `packages/shared`, Runtime is a consumer, not the schema owner
- for future agent, UI, or API callers, Runtime is the unified protocol-driven invocation layer

Core principles:
- protocol-driven
- implementation-agnostic
- state-minimal
- semantics-externalized

## Module Definitions

### 1. `module_registry`

Role:
- describe which modules are callable
- describe how those modules are invoked
- avoid direct binding to concrete implementations

It stores two categories of information:
- module identity
- execution method

#### Module identity

It answers:
- what the module is
- which system it belongs to
- which actions it accepts
- which input and output contracts it follows

#### Execution method

It answers:
- how the module is invoked
- whether invocation is local, protocol-based, HTTP-based, or another supported method

Minimal structure:

```ts
type RuntimeModuleDescriptor = {
  module_id: string
  system: "problem_radar" | "scoring" | "betting" | "builder" | "content_system"
  actions: string[]
  input_contract?: string
  output_contract?: string
  module_version?: string
  status: "active" | "disabled"
}

type RuntimeExecutionMethod = {
  mode: "local" | "http" | "protocol"
  target: string
}

type RegistryRecord = {
  module: RuntimeModuleDescriptor
  execution: RuntimeExecutionMethod
}
```

#### minimal responsibility

- store minimal module descriptors
- resolve one module by `module_id`
- list active modules
- expose execution method without exposing implementation internals

#### required input/output

Input:
- module descriptor
- execution method
- module lookup query by `module_id`

Output:
- registry record
- registry lookup result
- active module list

#### minimal implementation shape

```ts
type ModuleRegistry = {
  register(record: RegistryRecord): void
  get(moduleId: string): RegistryRecord | null
  list(): RegistryRecord[]
}
```

#### what is explicitly NOT implemented

- dynamic module loading
- plugin installation
- version negotiation
- capability inference
- registry persistence

### 2. `protocol_dispatcher`

Role:
- not a function router
- a protocol interpreter

Its input is always:
- `ModuleCallRequest`

Its responsibilities are:
1. interpret protocol fields in the request
2. identify the target module
3. retrieve execution method from registry
4. invoke the module through that method
5. normalize the result into `ModuleCallResponse`

It depends only on:
- request protocol
- registry descriptor
- execution method

It does not depend on:
- page context
- business implementation details
- internal module structure

Minimal interpretation flow:
- read `module`
- validate `action`
- read `protocol_version`
- parse `meta`
- query registry
- select execution method
- invoke module
- normalize response

#### minimal responsibility

- accept one `ModuleCallRequest`
- resolve one target module
- invoke one module once
- normalize one `ModuleCallResponse`
- emit invocation-side effects to log and state

#### required input/output

Input:
- `ModuleCallRequest`
- module registry lookup result
- execution method

Output:
- `ModuleCallResponse`
- one `InvocationRecord`
- log write request
- optional state write request

#### minimal implementation shape

```ts
type ProtocolDispatcher = {
  dispatch(request: ModuleCallRequest): Promise<ModuleCallResponse>
}
```

#### what is explicitly NOT implemented

- flow orchestration
- multi-step dispatch
- retry
- queueing
- async job execution
- module chaining

### 3. `activity_log_store`

Role:
- record runtime-visible invocation facts
- provide the base observation layer for activity, trace, and health

It records:
- request received
- module resolved
- module invoked
- response returned
- error raised

Minimal structure:

```ts
type ActivityLogRecord = {
  activity_id: string
  invocation_id: string
  trace_id?: string
  request_id: string
  module_id: string
  action: string
  status: "success" | "error"
  state: string
  timestamp: string
  error_code?: string
}
```

#### minimal responsibility

- append runtime activity records
- list recent runtime activity
- support runtime health inspection with activity counts

#### required input/output

Input:
- `ActivityLogRecord`

Output:
- append acknowledgement
- activity record list
- activity count

#### minimal implementation shape

```ts
type ActivityLogStore = {
  append(record: ActivityLogRecord): void
  list(): ActivityLogRecord[]
  count(): number
}
```

#### what is explicitly NOT implemented

- external log transport
- analytics pipeline
- retention policy
- distributed trace backend
- log query language

### 4. `state_store`

Role:
- runtime support state container
- not business truth container

It must remain clear that:
- runtime state should be reconstructible whenever possible
- if it is not reconstructible, it must still remain minimal and runtime-supporting only
- it must not evolve into the primary store for business truth

It may store:
- session context
- invocation-related transient state
- module last-known runtime state
- asset-runtime relation cache

It must not store:
- problem business truth
- scoring business truth
- betting business truth
- builder business truth
- content business truth

Minimal structure:

```ts
type RuntimeStateRecord = {
  key: string
  scope: "session" | "module" | "asset"
  ref_id: string
  value: Record<string, unknown>
  updated_at: string
  reconstructible: boolean
}
```

#### minimal responsibility

- save minimal runtime support state
- read state by key
- list state records for runtime inspection

#### required input/output

Input:
- `RuntimeStateRecord`
- state lookup key

Output:
- save acknowledgement
- one state record or null
- state record list

#### minimal implementation shape

```ts
type StateStore = {
  set(record: RuntimeStateRecord): void
  get(key: string): RuntimeStateRecord | null
  list(): RuntimeStateRecord[]
}
```

#### what is explicitly NOT implemented

- business persistence
- event sourcing
- cache invalidation policy
- distributed state coordination
- recovery workflow

### 5. `health_surface`

Role:
- expose whether Runtime is currently healthy
- summarize only runtime-facing status, not business quality

It is based on:
- registry
- activity log
- state store

Minimal health snapshot:

```ts
type RuntimeHealthSnapshot = {
  ok: boolean
  runtime_status: "ready" | "degraded" | "error"
  module_count: number
  active_module_count: number
  activity_count: number
  state_record_count: number
  last_activity_at?: string
}
```

#### minimal responsibility

- summarize minimal runtime health
- expose counts and latest activity signal
- report whether runtime is operational

#### required input/output

Input:
- module registry state
- activity log state
- runtime state store state

Output:
- `RuntimeHealthSnapshot`

#### minimal implementation shape

```ts
type HealthSurface = {
  snapshot(): RuntimeHealthSnapshot
}
```

#### what is explicitly NOT implemented

- infra monitoring
- latency metrics
- autoscaling signals
- SLA reporting
- business KPI exposure

## Invocation Model

Core concept: `InvocationRecord`

It represents:
- the minimal unit of one module invocation

It sits between:
- request and response
- activity log and trace
- state and runtime observation

Relationship:
- `request_id` identifies an external call request
- `trace_id` links multiple related invocations
- `invocation_id` identifies one actual Runtime-level module invocation

One `request_id` may correspond to one or more `invocation_id` values.
Multiple `invocation_id` values may share the same `trace_id`.

Minimal structure:

```ts
type InvocationRecord = {
  invocation_id: string
  request_id: string
  trace_id?: string
  module_id: string
  action: string
  protocol_version: string
  started_at: string
  finished_at?: string
  status: "started" | "success" | "error"
}
```

Relationship to adjacent records:
- `InvocationRecord` is the primary record of one invocation
- `ActivityLogRecord` is the observable event stream around that invocation
- `trace_id` is the chain identifier across invocations
- `request_id` is the stable identifier of the inbound request

#### minimal responsibility

- represent one invocation as a first-class runtime unit
- connect request, log, and response across one module call

#### required input/output

Input:
- request identity
- trace identity when present
- target module and action
- invocation timing

Output:
- one normalized `InvocationRecord`

#### minimal implementation shape

```ts
type InvocationFactory = {
  start(request: ModuleCallRequest): InvocationRecord
  finish(record: InvocationRecord, status: "success" | "error"): InvocationRecord
}
```

#### what is explicitly NOT implemented

- invocation graph
- nested invocation tree
- multi-step workflow trace model
- distributed correlation model

## Data Flow

Minimal closed loop:

1. caller submits `ModuleCallRequest`
2. `protocol_dispatcher` interprets the request
3. dispatcher creates `InvocationRecord`
4. dispatcher queries `module_registry`
5. registry returns module descriptor and execution method
6. dispatcher invokes the module through that execution method
7. module returns result
8. dispatcher normalizes it into `ModuleCallResponse`
9. dispatcher writes to `activity_log_store`
10. dispatcher writes to `state_store` when needed
11. `health_surface` summarizes runtime status from registry, activity, and state

Compressed expression:

- `ModuleCallRequest -> protocol_dispatcher -> InvocationRecord -> module_registry -> execution method -> module -> ModuleCallResponse -> activity_log_store / state_store -> health_surface`

## Boundaries

Runtime boundaries must remain strict:

- Runtime does not define shared object schema
- Runtime does not define business flow
- Runtime does not own business truth
- Runtime does not interpret business success
- Runtime only hosts protocol-driven invocation

`packages/shared` is responsible for:
- shared object schema
- flow contracts
- shared transport definitions

Business systems are responsible for:
- business capabilities
- business judgment
- business state transition meaning

Runtime is responsible for:
- invocation
- recording
- support state
- health observation

## Runtime Invariants

1. Runtime MUST NOT mutate or redefine any shared object schema.
2. Runtime MUST NOT introduce or interpret business semantics.
3. Runtime MUST NOT bypass protocol-based module invocation.
4. Runtime MUST NOT persist business truth as runtime state.
5. Runtime MUST NOT directly bind to module implementations.
6. Runtime MUST treat shared definitions as the single source of truth.
7. Runtime MUST remain execution-oriented, not decision-oriented.

## Non-goals

The current stage explicitly does not include:

- execution engine
- flow orchestration redesign
- persistence architecture
- scaling or infrastructure design
- business logic changes
- Builder and Runtime fusion
- Content System expansion
- UI integration design
- complex trace system
- distributed execution model

## Minimal Runtime Execution Loop

- register module
- receive request
- dispatch to one module
- return response
- write log

- does not support flow orchestration
- does not support multi-step chain
- does not support retry, queue, or async
