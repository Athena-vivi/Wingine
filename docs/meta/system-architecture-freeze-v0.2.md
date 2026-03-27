# System Architecture Freeze v0.2

## 1. Freeze Scope

This document freezes the current architecture state after the following structural convergence work:

- main chain reduction
- Decision layer extraction
- layer-first physical alignment
- Boundary / Workflow / Protocol / Control separation
- Contract single-source convergence
- Builder external interface consolidation
- Builder dispatch / state / feedback separation
- Cross-layer scoring / betting workspace shape consolidation
- Build-level decision hook validation on the real post-to-channel path

This document describes the current accepted structure.
This document does not describe future architecture.

Current project framing:

- problem-driven
- protocol-driven
- goal-oriented

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

Current validated position for `Decision(Build)` on the post-to-channel path:

- attached after `Build`
- stored as output metadata
- stored as future feedback input
- not used as output gate

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

### 3.4 Current System Classification

Current project-level classification:

- `System`: Problem, Builder
- `Capability`: Decision, Feedback, Execution, Runtime, Shared

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
- cross-layer scoring workspace state / payload shapes
- cross-layer betting workspace state / payload shapes

Current single-source workspace contract files:

- `src/contracts/scoringWorkspace.ts`
- `src/contracts/bettingWorkspace.ts`

### Protocol

Protocol files are now thin protocol-facing surfaces.

Current status:

- protocol semantics remain in module protocol files
- dispatch shells have been pushed into `src/protocols/*`
- dispatch shells are now standardized as thin dispatch-only entry files
- protocol request builders, invocation glue, and handler shells are explicit side files under `src/protocols/*`
- protocol files no longer contain workflow progression logic
- builder protocol dispatch no longer owns feedback apply or runtime state persistence directly

### Workflow

Workflow owns composition / progression for the extracted paths:

- post-to-channel main flow
- post-to-channel build-decision hook after build completion
- scoring workspace progression
- betting workspace progression
- builder workflow progression
- builder feedback progression
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

Builder feedback state interpretation is now also explicit under control/state.

### Execution

Execution is now thin at the `executionGate` entry point.

Current status:

- execution gate no longer owns branch logic
- execution result shapes are converged into contract
- builder runtime state persistence is now explicit under `src/execution/state`

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
9. Builder feedback wiring is no longer co-located with builder runtime state persistence.
10. Builder runtime state persistence is no longer co-located with protocol state wiring.
11. Cross-layer scoring workspace shapes now converge through `src/contracts/scoringWorkspace.ts`.
12. Cross-layer betting workspace shapes now converge through `src/contracts/bettingWorkspace.ts`.
13. The real post-to-channel path now invokes `Decision(Build)` after `Build`.
14. The build-level decision result is currently metadata/feedback-only, not gating.

## 6. Current Accepted Limits

The following limits are frozen as current reality:

- only one fully cleaned boundary path is established
- feedback is still recorded more than adapted
- builder internal payload/state is not yet converged
- protocol shell files still exist as explicit request / invocation / handler layers under `src/protocols`
- import/export shell payloads such as workflow/score/bet transfer payloads remain domain-local
- builder workspace payload/state remains domain-local by design in the current freeze
- scoring and betting internal detail structures remain domain-local
- build-level decision remains lightweight and should not yet be treated as output gating signal

## 7. Workspace Consolidation Note

The following cross-layer workspace shapes are now converged into contract single-source files:

- scoring:
  - `ScoringWorkspaceState`
  - `LoadWorkspacePayload`
  - `UpdateDimensionPayload`
  - `UpdateRolePayload`
  - `PersistWorkspacePayload`
- betting:
  - `BettingWorkspaceState`
  - `CandidateLoadPayload`
  - `BetEvaluatePayload`
  - `BetPersistPayload`

These now converge through:

- `src/contracts/scoringWorkspace.ts`
- `src/contracts/bettingWorkspace.ts`

Files now using the unified contract source include:

- `src/modules/capability/decision/scoring_module/types/protocol.ts`
- `src/modules/capability/decision/betting_module/types/protocol.ts`
- `src/modules/capability/decision/betting_module/protocol/bettingProtocol.ts`
- `src/workflows/scoring/scoringProtocolWorkflow.ts`
- `src/workflows/betting/bettingProtocolWorkflow.ts`
- `src/protocols/scoring/scoringProtocolDispatch.ts`
- `src/protocols/scoring/scoringProtocolInvocations.ts`
- `src/protocols/betting/bettingProtocolDispatch.ts`
- `src/protocols/betting/bettingProtocolInvocations.ts`
- `src/modules/capability/decision/betting_module/protocol/workspaceInvoker.ts`

Shapes intentionally not handled in this round:

- builder workspace payload/state
- scoring internal detail structures
- betting internal detail structures
- import/export shell payloads such as `WorkflowImportPayload`, `ScoreExportPayload`, `ScoreImportPayload`, `BetExportPayload`

These remain local because they are either builder-internal, domain-internal, or protocol-shell specific rather than shared cross-layer workspace shapes.

## 8. Builder Freeze Note

Builder cleanup is now frozen at an acceptable stopping point for this phase.

Why builder can stop here for now:

- builder external entry is already single through `build(...)`
- builder feedback apply no longer lives inside protocol dispatch
- builder runtime state persistence no longer lives inside builder protocol state helpers
- remaining builder complexity is localized to explicit protocol-facing shell wiring and internal payload/state details
- the remaining builder-local debt no longer distorts the main chain or blocks adjacent layer work

This means builder is not fully simplified, but it is structurally contained enough to stop deeper splitting in this round.

## 9. Build Decision Hook Note

The first real run confirms:

- the main chain still remains `Problem -> Build -> Output -> Feedback`
- `Decision(Build)` is not a new chain node
- `Decision(Build)` is now a validated horizontal hook after build completion
- its current accepted role is:
  - metadata: enabled
  - feedback input: enabled
  - future gate: not enabled

Reference note:

- `docs/meta/build-decision-hook-validation-v0.1.md`

## 10. Freeze Conclusion

Wingine is now frozen as:

- one main chain
- one Build entry
- one Decision interface
- one layer-first repository projection
- one contract single-source entry

The current architecture is structurally coherent enough for the next focused cleanup step, but is not yet fully debt-free. The next focused step should not enable build-level gating yet; it should first keep the build decision hook in metadata/feedback position and validate its signal quality across more real runs.
