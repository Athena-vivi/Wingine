# Shared Contracts

Shared object schemas and flow contracts for:
- Radar
- Builder
- Scoring
- Betting

## Scope
- object schemas
- status enums
- contract names
- flow contract registry
- reference rules
- minimal validators

## Rule
- shared contracts are the only cross-project transport contract
- project-local view models stay inside each project

## Main Chain
- `radar_to_builder`
- `builder_to_scoring`
- `scoring_to_betting`

## Feedback Chain
- `scoring_to_builder_feedback`
- `scoring_to_radar_feedback`
- `betting_to_builder_feedback`
- `betting_to_radar_feedback`
