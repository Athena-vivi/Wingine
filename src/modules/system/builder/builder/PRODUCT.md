# Builder

## Goal
- Turn one problem into a structured build path.
- Keep one fixed chain:
  - `Problem -> Workflow -> Capabilities -> Output`
- Support:
  - human workspace use
  - agent invocation
  - api invocation

## Current System Shape
- `Problem` provides source context.
- `Workflow` defines the orchestration path.
- `Capabilities` provide attached reusable assets.
- `Output` tracks current delivery state.
- `UI Template` is a reusable prompt asset.

## Core Rules
- One builder system only.
- Business logic lives in capability modules.
- UI only collects input, shows state, and triggers calls.
- All mutations must be callable through protocol.

## Current Architecture
- `Capability Layer`
- `Protocol Layer`
- `Interface Layer`

## Current Status
- workspace state composition extracted
- workflow mutations extracted
- capability attachment and detail extracted
- output and template management extracted
- protocol registry and invokers added
- api routes added
- builder ui switched to protocol-only calls

## Next Useful Extensions
- local persistence for builder records
- builder history manager and history panel
- registry page for capability and protocol discovery
