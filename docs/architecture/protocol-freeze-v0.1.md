# Wingine Protocol Freeze Checklist v0.1

## 1. Request Envelope

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

## 2. Response Envelope

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

## 3. Meta Block

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

## 4. Module Naming Rules

### System Names
- problem_radar
- scoring
- betting
- builder
- product_runtime
- content_system

### Module Name Rule
- `<system>.<capability>`

### Action Name Rule
- verb-first
- examples:
  - resolve
  - load
  - build
  - export
  - evaluate

## 5. Call Rules

- All modules must be called through the unified envelope.
- All modules must accept explicit input objects.
- All modules must return explicit output objects.
- No module may rely on page-local state.
- No module may bypass the shared protocol contract.
- Flow composition must call modules through protocol-defined boundaries.
- Runtime is the dispatcher, not the business owner.

## 6. Replacement Rules

- A module may have multiple implementations.
- All implementations must preserve the same protocol contract.
- Replacement must not change shared object schema.
- Providers, models, platforms, and storage backends are implementation details.
- These implementation details must not appear in protocol schema.

## 7. Version Rules

- `protocol_version` freezes call contract version.
- `schema_version` freezes object schema version.
- `module_version` freezes implementation version.
- Breaking changes require version increment.
- Silent schema mutation is not allowed.

## 8. Freeze Scope

This checklist is the only protocol reference for the next phase.
No new module may be added unless it conforms to this checklist.
No existing module should be refactored beyond this contract freeze during the current phase.
