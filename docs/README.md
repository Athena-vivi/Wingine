# Wingine Docs Baseline

These documents are the current architecture baseline for Wingine.
They reflect the current repository state, not the older v0.1 chain model.

## Current Authoritative Docs

- `docs/protocols/system-core-protocol-v1.md`
- `docs/architecture/project-architecture-v0.2.md`
- `docs/meta/build-decision-hook-validation-v0.1.md`
- `docs/meta/system-architecture-freeze-v0.2.md`
- `docs/meta/structural-debt-classification-v0.2.md`

## What They Mean

- `system-core-protocol-v1.md`
  - invariant system skeleton
  - single main chain
  - Decision and Build meaning freeze

- `project-architecture-v0.2.md`
  - current project definition
  - current system/capability classification
  - current layer-first repository framing
  - current architectural reading of the codebase

- `build-decision-hook-validation-v0.1.md`
  - first real validation of the build-level decision hook
  - current accepted position of build decision
  - real-run conclusion before any future gate behavior

- `system-architecture-freeze-v0.2.md`
  - current repository architecture state
  - current layer-first projection
  - currently accepted structure

- `structural-debt-classification-v0.2.md`
  - residual mixed-responsibility points
  - debt classification
  - single next structural priority

## Current System Summary

- main chain: `Problem -> Build -> Output -> Feedback`
- Decision is horizontal capability
- Build is the only external structure-generation entry
- project framing: problem-driven + protocol-driven + goal-oriented
- build-level decision is validated as metadata/feedback-only signal
- system classification:
  - `System`: Problem / Builder
  - `Capability`: Decision / Feedback / Execution / Runtime / Shared
- repository is organized as layer-first under `src/`
- contracts converge under `src/contracts`
- workflows converge under `src/workflows`
- control converges under `src/control`
- protocol-facing shells converge under `src/protocols`
- current single next priority: validate build-level decision signal quality before any gate behavior

## Historical Docs

The following files remain for historical context and should not be treated as the latest freeze:

- `docs/system-state-freeze-v0.1.md`
- `docs/architecture/implementation-status-v0.1.md`
- `docs/architecture/wingine-architecture-v0.1.md`
