# Project Architecture v0.2

## 1. Current Project Definition

Wingine is currently framed as a problem-driven, protocol-driven, goal-oriented system.

This means:

- `problem-driven`: the system begins from external problem intake and normalization
- `protocol-driven`: cross-layer interaction is shaped through explicit protocol and contract surfaces
- `goal-oriented`: Build produces structure toward an intended output goal rather than following multiple competing main chains

This document reflects the current repository state after structural convergence.

## 2. Current System Skeleton

The current invariant main chain is:

`Problem -> Build -> Output -> Feedback`

Operationally, Decision may be applied around the chain:

`Problem -> Decision(Problem) -> Build -> Decision(Build) -> Output -> Feedback`

But the main chain itself remains:

`Problem -> Build -> Output -> Feedback`

Current meanings:

- `Problem`: boundary intake and normalized problem representation
- `Build`: the single structure-generation entry
- `Output`: execution or expression of the built result
- `Feedback`: post-output outcome signal recording

## 3. Current Core Abstractions

### Decision

Decision is a horizontal capability.

It is not a workflow step and not an additional chain.

Current external form:

`Decision(target, context?) -> DecisionResult`

Decision currently covers:

- score
- bet
- strategy
- role
- confidence

Current validated runtime note:

- `Decision(Build)` now exists on the real post-to-channel path
- it is a horizontal post-build hook
- it is not part of the invariant main chain
- its current accepted position is metadata + feedback input, not gating

### Build

Build is the only external structure-generation entry.

Current external form:

`build(input) -> BuildResult`

Internally, Build may route to system-building or content-building implementations, but externally it remains one entry.

## 4. Current System Classification

The project classification is currently frozen as:

### System

- Problem
- Builder

### Capability

- Decision
- Feedback
- Execution
- Runtime
- Shared

Interpretation:

- `Problem` and `Builder` correspond to the main structural systems
- the other domains are supporting capabilities rather than independent chain systems

## 5. Current Layer-First Architecture

The repository is currently organized as:

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

Current layer meanings:

- `boundary`: request, transform, response
- `contracts`: single-source shared structures
- `protocols`: protocol-facing dispatch and shell surfaces
- `modules`: system and capability implementations
- `workflows`: order, composition, progression
- `control`: policy, mapping, state rules
- `execution`: execution and runtime persistence surface

## 6. Current Repository Reading

The current repository should be read as:

- one main chain, not multiple competing chains
- one Build entry, not separate system/content chains
- one Decision abstraction, not score/bet workflow nodes
- one layer-first structure, not feature-first top-level organization

This is the current project model that README and freeze documents should follow.

## 7. Current Accepted Reality

The current architecture is converged enough to support further development, but still has bounded debt.

Current accepted realities:

- only one boundary path is fully cleaned end-to-end
- explicit protocol shell files still exist under `src/protocols`
- scoring and betting cross-layer workspace shapes are now converged under `src/contracts`
- some remaining cross-layer shapes are still locally defined while crossing layers
- build-level decision hook is now validated on the real post-to-channel path
- build-level decision is currently metadata/feedback-only
- feedback is still more recording-oriented than adaptive
- builder internal payload/state remains domain-local

Current converged workspace contract files:

- `src/contracts/scoringWorkspace.ts`
- `src/contracts/bettingWorkspace.ts`

Current intentionally local shapes:

- builder workspace payload/state
- scoring internal detail structures
- betting internal detail structures
- protocol import/export shell payloads

## 8. Authority and Next Priority

Current authoritative references are:

- `docs/protocols/system-core-protocol-v1.md`
- `docs/meta/build-decision-hook-validation-v0.1.md`
- `docs/meta/system-architecture-freeze-v0.2.md`
- `docs/meta/structural-debt-classification-v0.2.md`

The current single next priority is:

`Freeze build-level decision as metadata/feedback-only signal and validate it across more real runs before considering any gate behavior.`
