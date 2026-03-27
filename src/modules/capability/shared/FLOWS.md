# Flow Contracts

## Main Chain
- `radar_to_builder`
- `builder_to_scoring`
- `scoring_to_betting`

## Feedback Chain
- `scoring_to_builder_feedback`
- `scoring_to_radar_feedback`
- `betting_to_builder_feedback`
- `betting_to_radar_feedback`

## Source Of Truth
- `contracts/names.ts`
- `contracts/registry.ts`
- `contracts/envelope.ts`
- `references/rules.ts`

## Rules
- contracts are reference-based
- producer emits shared object only
- consumer owns local mutation
- all contract evaluation returns explicit gate result
- mvp chain is main chain only
