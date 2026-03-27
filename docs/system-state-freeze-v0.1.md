# System State Freeze v0.1

## Status Note

This file is retained as a historical checkpoint only.

It no longer represents the latest architecture state.

The current authoritative freeze documents are:

- `docs/protocols/system-core-protocol-v1.md`
- `docs/meta/system-architecture-freeze-v0.2.md`
- `docs/meta/structural-debt-classification-v0.2.md`

## Historical Snapshot

The v0.1 chain that was originally frozen here was:

`Problem -> Type -> Problem Score -> Problem Decision -> Builder -> SystemSpec -> System Score -> System Decision -> Decision Feedback`

This is no longer the accepted system skeleton.

## Current Accepted Skeleton

The current frozen main chain is:

`Problem -> Build -> Output -> Feedback`

Decision is now treated as horizontal capability:

- `Decision(Problem)`
- `Decision(Build)`

Build is now treated as the single external structure-generation entry:

- `build(...)`

## Why This File Still Exists

This file preserves the earlier architecture state for comparison.

It should not be used as the active implementation baseline.
