# Wingine Shared Protocol Convergence Plan v0.1

## 1. Objective

Unify all shared contracts, shared schemas, and shared protocol definitions into one single source of truth.

Current target:
- no business rewrite
- no UI rewrite
- no full refactor
- only convergence of shared protocol references and structure

## 2. Current Problem

The repo currently has a mixed state:
- new shared package exists at `packages/shared`
- many files still import old `SharedContracts`
- console and multiple apps still assume legacy path layout
- protocol definitions are partially duplicated across apps

This creates three risks:
1. contract drift
2. path drift
3. partial breakage during later migration

## 3. Old References That Must Eventually Migrate

### 3.1 Old import root pattern
- `../../SharedContracts`
- `../../../SharedContracts`
- `../../../../SharedContracts`

### 3.2 Current affected areas

#### Radar
- `apps/radar/types/protocol.ts`
- `apps/radar/contracts/*`
- `apps/radar/adapters/*`
- `apps/radar/protocol/radarStateStore.ts`
- `apps/radar/protocol/contractLogStore.ts`
- `apps/radar/app/api/registry/route.ts`

#### Builder
- `apps/builder/types/protocol.ts`
- `apps/builder/contracts/*`
- `apps/builder/adapters/*`
- `apps/builder/protocol/builderStateStore.ts`
- `apps/builder/protocol/contractLogStore.ts`
- `apps/builder/app/api/registry/route.ts`

#### Scoring
- `apps/scoring/types/protocol.ts`
- `apps/scoring/contracts/*`
- `apps/scoring/adapters/*`
- `apps/scoring/protocol/contractLogStore.ts`
- `apps/scoring/app/api/registry/route.ts`

#### Betting
- `apps/betting/types/protocol.ts`
- `apps/betting/contracts/*`
- `apps/betting/adapters/*`
- `apps/betting/protocol/contractLogStore.ts`
- `apps/betting/app/api/registry/route.ts`

#### Console
- `apps/console/connectors/invoke.ts`
- `apps/console/connectors/activity.ts`
- `apps/console/connectors/objects.ts`
- `apps/console/connectors/trace.ts`
- `apps/console/app/api/invoke/flow/route.ts`
- `apps/console/app/overview/page.tsx`

#### Shared package itself
- `packages/shared/types/console.ts`
- this file still imports from old `SharedContracts` path and must be corrected first

## 4. Target Directory Structure

Recommended target:

```txt
packages/
  shared/
    index.ts
    enums/
    schemas/
    contracts/
    references/
    validators/
    types/
      console.ts
      protocol.ts
      assets.ts
```

Guiding rule:
- all cross-system shared schema lives only in `packages/shared`
- all app-local protocol request payloads remain inside each app until later convergence
- no app should import from legacy `SharedContracts` after convergence is complete

## 5. Migration Strategy

### Step 1
Freeze architecture and schema definitions first.
- do not edit logic yet
- do not rename business modules yet

### Step 2
Make `packages/shared` the only allowed contract source.
- first fix `packages/shared/types/console.ts`
- ensure `packages/shared/index.ts` exports all shared pieces needed by apps

### Step 3
Replace old imports app by app, starting from lowest-risk files.
Recommended order:
1. shared package self-references
2. console read-only connectors
3. registry and contract files
4. adapters
5. app-local protocol types
6. runtime state/log files

### Step 4
After each batch, keep behavior unchanged.
- import path only
- no schema redesign during path replacement
- no naming redesign during path replacement

### Step 5
Only after all imports converge, remove old path assumptions.

## 6. Recommended Migration Order

### Phase A: Lowest-risk read layer
- `packages/shared/types/console.ts`
- `apps/console/connectors/*`
- `apps/console/app/api/*`

Reason:
- mostly read-only
- easiest to validate structurally
- least business risk

### Phase B: Contract declaration layer
- `apps/radar/contracts/*`
- `apps/builder/contracts/*`
- `apps/scoring/contracts/*`
- `apps/betting/contracts/*`

Reason:
- contracts should point to the single shared source before deeper migration starts

### Phase C: Adapter layer
- all `adapters/*` using shared object types

Reason:
- adapters are boundary translators
- they should depend on frozen shared objects

### Phase D: App-local protocol type layer
- `apps/*/types/protocol.ts`

Reason:
- these are more sensitive and may touch many files
- do this after shared contract imports are already stable

### Phase E: Runtime support layer
- `contractLogStore`
- `stateStore`
- remaining registry routes

Reason:
- these touch runtime behavior and logs
- keep them later to reduce blast radius

## 7. What Should Stay Unchanged For Now

Do not change in this phase:
- Radar business logic
- Builder workflow logic
- Scoring scoring logic
- Betting decision logic
- UI components
- Content generation behavior
- runtime architecture redesign
- object schema redesign beyond already frozen definitions

This phase is convergence only, not redesign.

## 8. How To Avoid Breaking Existing Code During Migration

### Rule 1
Only change import sources first.
- no logic edits
- no function renames
- no object field renames

### Rule 2
Migrate in small batches.
- one layer at a time
- one system slice at a time

### Rule 3
Prefer compatibility re-export if needed.
- if a transition bridge is needed, add re-export at shared entrypoint
- do not duplicate schema definitions

### Rule 4
Do not remove old assumptions until all direct imports are gone.
- eliminate usage first
- delete leftovers last

### Rule 5
Keep app-local protocol payloads local for now.
- shared convergence is for cross-system contracts first
- do not prematurely centralize every request payload

### Rule 6
Validate by static reference consistency, not by broad rewrite.
- ensure each migrated file points to `packages/shared`
- ensure exported type names remain unchanged during migration phase

## 9. Single Source Of Truth Rule

After convergence:
- all cross-system enums come from `packages/shared/enums/*`
- all cross-system schemas come from `packages/shared/schemas/*`
- all cross-system contracts come from `packages/shared/contracts/*`
- all shared references and validators come from `packages/shared/*`
- no app imports from legacy `SharedContracts`

This is the required foundation before Product Runtime consolidation and before real Problem Radar implementation begins.
