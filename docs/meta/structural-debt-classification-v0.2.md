# Structural Debt Classification v0.2

## 1. Classification Rule

Residual points are classified into:

- `Must Fix Next`
- `Accept for Now`

Decision criteria:

1. Does it continue to pollute structure boundaries?
2. Does it block or distort later development?
3. Is it on a core path?

## 2. Must Fix Next

### 2.1 Protocol Dispatch Shells

Files:

- `src/protocols/builder/builderProtocolDispatch.ts`
- `src/protocols/scoring/scoringProtocolDispatch.ts`
- `src/protocols/betting/bettingProtocolDispatch.ts`

Current issue:

- still mix protocol-facing dispatch with runtime request factory wiring
- builder version also mixes adapter binding, contract binding, and feedback apply binding

Why `Must Fix Next`:

- yes, it still pollutes structure boundaries
- yes, it will keep protocol semantics and integration wiring coupled
- yes, it sits on a core path for protocol cleanup

Classification:

- `Must Fix Next`

### 2.2 Builder Runtime State Store

File:

- `src/modules/system/builder/builder/protocol/builderStateStore.ts`

Current issue:

- mixes protocol-adjacent feedback handling with runtime persistence state

Why `Must Fix Next`:

- yes, it keeps protocol and state persistence coupled
- yes, it will complicate later separation of protocol/state/runtime concerns
- yes, it touches builder feedback path, which is structural

Classification:

- `Must Fix Next`

## 3. Accept for Now

### 3.1 Domain Workspace Payload / State Shapes

Files:

- scoring workspace payload/state definitions
- betting workspace payload/state definitions
- builder workspace payload/state definitions

Current issue:

- still local to their domains

Why `Accept for Now`:

- no, they do not currently pollute cross-layer architecture in the same way
- no, they do not block current structural convergence
- partial core-path relevance only, but they are domain-internal rather than cross-layer boundary problems

Classification:

- `Accept for Now`

### 3.2 Content Draft Local Types

Files:

- `src/modules/system/builder/contentDraftGenerator.ts`
- execution-facing draft usage points

Current issue:

- local builder/execution draft shape remains internal rather than globally converged

Why `Accept for Now`:

- low structural pollution
- low blocking impact
- not the current highest-leverage core-path debt

Classification:

- `Accept for Now`

### 3.3 Local Execution Result Wrappers

Files:

- execution local wrappers around contract types

Current issue:

- thin wrapper level remains in execution path

Why `Accept for Now`:

- low structural pollution after current cleanup
- no meaningful blocker to next convergence step
- not a high-risk core-path distortion now

Classification:

- `Accept for Now`

### 3.4 Domain-Specific Adapter / Import-Export Shells

Files:

- scoring/betting/builder protocol handler files under `src/protocols/*Handlers.ts`

Current issue:

- still exist as integration shells

Why `Accept for Now`:

- these no longer pollute the protocol files themselves
- they are explicit and isolated
- they do not currently block main-chain work

Classification:

- `Accept for Now`

## 4. Summary Table

### Must Fix Next

- protocol dispatch shells
- builder runtime state store

### Accept for Now

- domain workspace payload/state definitions
- content draft local types
- thin execution result wrappers
- protocol handler integration shells

## 5. Single Next Priority

The only next priority should be:

`Separate protocol dispatch wiring from protocol integration state and binding logic, starting with builder protocol dispatch.`

Reason:

- it is the highest remaining cross-layer pollution point
- it still sits closest to protocol / workflow / state boundary confusion
- fixing it will reduce structural debt faster than domain-local type cleanup
