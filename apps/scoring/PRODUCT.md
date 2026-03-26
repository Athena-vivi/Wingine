# Scoring

## Product
- Unified evaluation system for `Problem`, `Module`, `Output`, and `Workflow`
- One scoring system only
- Four fixed dimensions only:
  - `Value`
  - `Quality`
  - `Reliability`
  - `Leverage`

## Goal
- Turn scoring into a callable system, not a page-only tool
- Support:
  - Human UI
  - Agent invocation
  - API invocation

## Core Architecture

### 1. Capability Layer
- Holds all business logic
- Includes:
  - object loading
  - type profile resolving
  - dimension update
  - score aggregation
  - confidence resolving
  - gate resolving
  - role input update
  - evaluation record management
  - evaluation history loading

### 2. Protocol Layer
- Provides unified invocation contracts
- Includes:
  - capability invoker
  - workspace protocol invoker
  - request / response envelope
  - composite protocol registry

### 3. Interface Layer
- UI only collects input, shows state, and triggers protocol calls
- No business logic in UI

## Current Call Model

### Capability Calls
- `object_context_loader`
- `type_profile_resolver`
- `dimension_score_manager`
- `score_aggregator`
- `confidence_resolver`
- `gate_resolver`
- `role_input_manager`
- `evaluation_record_manager`
- `evaluation_history_manager`

### Composite Protocol Calls
- `workspace_load`
- `workspace_select`
- `dimension_update`
- `role_update`
- `workspace_persist`

## Interface Shape
- Left: object context + type profile
- Center: dimension scoring workspace
- Right: aggregate result + gate + role inputs + history

## Rules
- Business logic stays in Capability Layer
- Protocol Layer is the only invocation path
- Interface Layer cannot calculate, judge, or generate
- Same capability must work for UI, Agent, and API

## Current Status
- Three-layer structure is in place
- UI already calls protocol instead of direct logic
- API routes exist for:
  - `/api/capabilities/[name]`
  - `/api/protocol/[name]`

## Next Best Step
- Add `/api/registry`
- Expose capability registry and protocol registry for agent discovery
