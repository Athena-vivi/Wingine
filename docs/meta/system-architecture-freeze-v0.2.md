# System Architecture Freeze v0.2

## 1. Freeze Scope

This document freezes the current architecture state after the following structural convergence work:

- main chain reduction
- Decision layer extraction
- layer-first physical alignment
- Boundary / Workflow / Protocol / Control separation
- Contract single-source convergence
- Builder external interface consolidation

This document describes the current accepted structure.
This document does not describe future architecture.

## 2. Current Main Chain

The current frozen main chain is:

`Problem -> Build -> Output -> Feedback`

Interpretation:

- `Problem` is normalized at boundary/transform
- `Build` is the only structure-generation entry
- `Output` is execution/expression of built result
- `Feedback` records post-output outcome signal

Decision is not a chain step.

Allowed operational form:

`Problem -> Decision(Problem) -> Build -> Decision(Build) -> Output -> Feedback`

But the invariant main chain remains:

`Problem -> Build -> Output -> Feedback`

## 3. Current Established Structure

### 3.1 Decision as Horizontal Capability

Decision is now treated as horizontal capability, not workflow step.

Current frozen decision entry points:

- `decideProblem(...)`
- `decideBuild(...)`

Current contract source:

- `src/contracts/decision.ts`

Current meaning:

- `Decision(target, context?) -> DecisionResult`

### 3.2 Build as Single Entry

Build is frozen as the only external structure-generation entry.

Current frozen entry:

- `src/modules/system/builder/build.ts`

Current contract source:

- `src/contracts/builder.ts`

Current external interface:

- `BuildMode`
- `BuildInput`
- `BuildResult`

Internal builder implementations remain separated, but external entry is single:

- content build path
- system build path

Both are reached only through `build(...)`.

### 3.3 Layer-First Structure

Current repository structure is frozen as layer-first:

```text
src/
- boundary/
- contracts/
- protocols/
- modules/
  - system/
  - capability/
- workflows/
- control/
- execution/
```

Interpretation:

- `boundary` owns request / transform / response concerns
- `contracts` is the single-source entry for shared structure definitions
- `protocols` owns protocol-facing dispatch / wrapper shells
- `modules` owns system and capability implementations
- `workflows` owns step order / composition / progression
- `control` owns policy / mapping / state rules
- `execution` owns run-time execution surface

## 4. Current Layer Status

### Boundary

Boundary is established for the post-to-channel entry path:

- entry
- transform
- response

Current status:

- boundary owns request intake and response assembly for the main exposed usecase
- handler is now a thin boundary entry file

### Contract

Contract is established as a single-source entry under `src/contracts`.

Current converged areas:

- flow envelope
- protocol request / response base shapes
- runtime request / response base shapes
- execution request / response shapes
- boundary/usecase input / output shapes
- builder external interface
- decision external interface

### Protocol

Protocol files are now thin protocol-facing surfaces.

Current status:

- protocol semantics remain in module protocol files
- dispatch shells have been pushed into `src/protocols/*`
- protocol files no longer contain workflow progression logic

### Workflow

Workflow owns composition / progression for the extracted paths:

- post-to-channel main flow
- scoring workspace progression
- betting workspace progression
- builder workflow progression
- execution gate progression

### Control

Control has been extracted into:

- policy
- mapping
- state

Current status:

- threshold
- decision mapping
- score to action mapping
- role / strategy / mode policy

are no longer embedded in main workflow files.

### Execution

Execution is now thin at the `executionGate` entry point.

Current status:

- execution gate no longer owns branch logic
- execution result shapes are converged into contract

## 5. Current Confirmed Structural Facts

The following facts are frozen as true:

1. There is only one main chain.
2. Decision is horizontal capability, not chain node.
3. Build is the only external structure-generation entry.
4. Boundary and Workflow are separated for the main post-to-channel path.
5. Control logic has been extracted from the key workflow/protocol files.
6. Protocol files are now thin semantic entry surfaces.
7. Contract has a single-source entry under `src/contracts`.
8. Builder and Decision both have unified external interfaces.

## 6. Current Accepted Limits

The following limits are frozen as current reality:

- only one fully cleaned boundary path is established
- protocol dispatch shells still exist as separate thin files under `src/protocols`
- domain-specific workspace payload/state definitions are still local
- feedback is still recorded more than adapted
- builder internal payload/state is not yet converged
- some persistence / runtime state helpers still mix protocol and storage concerns

## 7. Freeze Conclusion

Wingine is now frozen as:

- one main chain
- one Build entry
- one Decision interface
- one layer-first repository projection
- one contract single-source entry

The current architecture is structurally coherent enough for the next focused cleanup step, but is not yet fully debt-free.
