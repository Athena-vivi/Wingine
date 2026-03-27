# Wingine Docs Baseline

These documents are the current architecture baseline for Wingine.

## Current Authoritative Docs

- `docs/protocols/system-core-protocol-v1.md`
- `docs/meta/system-architecture-freeze-v0.2.md`
- `docs/meta/structural-debt-classification-v0.2.md`

## What They Mean

- `system-core-protocol-v1.md`
  - invariant system skeleton
  - single main chain
  - Decision and Build meaning freeze

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
- repository is organized as layer-first under `src/`
- contracts converge under `src/contracts`
- workflows converge under `src/workflows`
- control converges under `src/control`
- protocol-facing shells converge under `src/protocols`

## Historical Docs

The following files remain for historical context and should not be treated as the latest freeze:

- `docs/system-state-freeze-v0.1.md`
- `docs/architecture/implementation-status-v0.1.md`
