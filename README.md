# VisualClause Console

Unified system shell for:
- Radar
- Builder
- Scoring
- Betting

## Purpose
- unified navigation
- unified entry
- unified object viewing
- unified overview
- cross-module routing

## Boundary
- no business logic
- no workflow editing
- no scoring logic
- no betting logic
- no radar analysis

## Current MVP
- `/overview`
- `/objects`
- `/radar`
- `/builder`
- `/scoring`
- `/betting`
- `/flows`
- `/trace`
- `/activity`
- `/invoke`
- `/registry`

## Registry Connectors
- Console prefers live registry endpoints when configured
- Console falls back to local manifests when endpoints are unavailable
- Optional env vars:
  - `VISUALCLAUSE_RADAR_REGISTRY_URL`
  - `VISUALCLAUSE_BUILDER_REGISTRY_URL`
  - `VISUALCLAUSE_SCORING_REGISTRY_URL`
  - `VISUALCLAUSE_BETTING_REGISTRY_URL`
