# Betting

## Product
- Callable resource allocation system
- Input only:
  - `score`
  - `confidence`
  - `trend`
  - `cost`
- Output only:
  - `decision`
  - `resource_allocation`
  - `reason`

## Goal
- Decide how much to invest under uncertainty
- Support:
  - Human UI
  - Agent invocation
  - API invocation

## Core Architecture
- `Capability Layer`
- `Protocol Layer`
- `Interface Layer`

## Decision Set
- `kill`
- `hold`
- `explore`
- `double_down`
- `scale`

## Current Status
- Project scaffold created
- Core types created
- Candidate pool and rule config created
- Capability and protocol implementation next
