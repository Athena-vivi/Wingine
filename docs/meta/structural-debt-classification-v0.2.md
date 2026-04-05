# Structural Debt Classification v0.2

## 1. Classification Rule

Residual points are classified into:

- `Must Fix Next`
- `Accept for Now`

Decision criteria:

1. Does it continue to pollute structure boundaries?
2. Does it block or distort later development?
3. Is it on a core path?

This classification follows the current project framing:

- one main chain
- `System`: Problem / Builder
- `Capability`: Decision / Feedback / Execution / Runtime / Shared

## 2. Must Fix Next

### 2.1 Build-Level Decision Signal Validation Before Gating

Files:

- `src/workflows/postToChannelContent/postToChannelContentWorkflow.ts`
- `src/contracts/usecases/postToChannelContent.ts`
- real-run validation notes for the build decision hook

Current issue:

- `Decision(Build)` now exists on the real post-to-channel path
- it has validated value as metadata and feedback input
- it is not yet strong enough to be treated as gate signal
- the immediate risk is enabling too much control authority before enough real-run evidence exists

Why `Must Fix Next`:

- yes, it now sits directly on the real main runtime path
- yes, its future role must be clarified before more behavior is attached to it
- yes, validating signal quality is now a higher-leverage next step than restarting structural cleanup

Classification:

- `Must Fix Next`

## 3. Accept for Now

### 3.1 Local-Only Domain Workspace Payload / State Shapes

Files:

- builder workspace payload/state definitions

Current issue:

- still local to their domains when they are used only inside those domains

Why `Accept for Now`:

- no, local-only shapes do not currently pollute cross-layer architecture in the same way
- no, they do not block current structural convergence
- partial core-path relevance only, but they are domain-internal rather than cross-layer boundary problems

Classification:

- `Accept for Now`

### 3.2 Remaining Cross-Layer Workspace Shapes

Files:

- remaining builder-adjacent shared shapes
- protocol import/export transfer shapes where they are reused across layers

Current issue:

- still not fully converged

Why `Accept for Now`:

- no, they are no longer the most urgent issue after build decision hook validation
- no, they do not immediately threaten the current real runtime path
- yes, they remain structural debt, but can pause for one freeze cycle

Classification:

- `Accept for Now`

### 3.3 Converged Scoring / Betting Workspace Shapes

Files:

- `src/contracts/scoringWorkspace.ts`
- `src/contracts/bettingWorkspace.ts`
- scoring/betting protocol, workflow, and protocol facade references now pointing to these files

Current issue:

- no longer a primary debt point; this round moved these shapes to a contract single source

Why `Accept for Now`:

- no, these are no longer unresolved cross-layer definitions
- no, they now reduce structural ambiguity rather than create it
- yes, they should remain frozen as the current pattern for future contract convergence

Classification:

- `Accept for Now`

### 3.4 Content Draft Local Types

Files:

- `src/modules/system/builder/contentDraftGenerator.ts`
- execution-facing draft usage points

Current issue:

- local builder/execution draft shape remains internal rather than globally converged

Why `Accept for Now`:

- low structural pollution
- low blocking impact
- not the current highest-leverage core-path debt

Classification:

- `Accept for Now`

### 3.5 Local Execution Result Wrappers

Files:

- execution local wrappers around contract types

Current issue:

- thin wrapper level remains in execution path

Why `Accept for Now`:

- low structural pollution after current cleanup
- no meaningful blocker to next convergence step
- not a high-risk core-path distortion now

Classification:

- `Accept for Now`

### 3.6 Domain-Specific Adapter / Import-Export Shells

Files:

- scoring/betting/builder protocol handler files under `src/protocols/*Handlers.ts`

Current issue:

- still exist as integration shells

Why `Accept for Now`:

- these no longer pollute the protocol files themselves
- they are explicit and isolated
- they do not currently block main-chain work

Classification:

- `Accept for Now`

### 3.7 Protocol Invocation Shells

Files:

- `src/protocols/scoring/scoringProtocolInvocations.ts`
- `src/protocols/betting/bettingProtocolInvocations.ts`
- `src/protocols/builder/builderProtocolInvocations.ts`

Current issue:

- these files still hold explicit request-builder usage and workflow/handler wiring

Why `Accept for Now`:

- no, they no longer pollute the dispatch files themselves
- no, they are now explicit, local, and readable protocol-side shells
- no, they do not currently distort the main chain or unified interfaces
- yes, they are still integration glue, but that is now an acceptable explicit layer rather than hidden cross-layer mixing

Classification:

- `Accept for Now`

### 3.8 Protocol Handler Shells

Files:

- `src/protocols/scoring/scoringProtocolHandlers.ts`
- `src/protocols/betting/bettingProtocolHandlers.ts`
- `src/protocols/builder/builderProtocolHandlers.ts`

Current issue:

- these files still hold adapter-facing import/export and contract-facing shell behavior

Why `Accept for Now`:

- no, they are already isolated from the protocol files and dispatch files
- no, they are explicit protocol-shell files rather than hidden structural leakage
- no, they do not currently block workflow, control, or contract convergence

Classification:

- `Accept for Now`

### 3.9 Builder Runtime State and Feedback Split Residuals

Files:

- `src/modules/system/builder/builder/protocol/builderStateStore.ts`
- `src/execution/state/builderRuntimeStateStore.ts`
- `src/workflows/builder/builderFeedbackWorkflow.ts`
- `src/control/state/builderFeedbackState.ts`

Current issue:

- builder state, feedback patching, and protocol dispatch are now separated, but the builder protocol dispatch shell still references adapter and gate wiring around that split

Why `Accept for Now`:

- no, state persistence itself no longer pollutes protocol/state boundaries in the same way
- no, builder feedback apply is no longer buried inside the builder state store
- no, it does not currently block further main-chain or contract-layer work
- yes, builder still has local debt, but it is now explicit and localized rather than structurally spread

Classification:

- `Accept for Now`

## 4. Summary Table

### Must Fix Next

- build-level decision signal validation before gating

### Accept for Now

- domain workspace payload/state definitions
- remaining cross-layer workspace shapes
- converged scoring/betting workspace shapes
- content draft local types
- thin execution result wrappers
- protocol handler integration shells
- protocol invocation shells
- explicit protocol handler shells
- builder runtime state and feedback split residuals

## 5. Single Next Priority

The only next priority should be:

`Freeze build-level decision as metadata/feedback-only signal and validate it across more real runs before considering any gate behavior.`

Reason:

- the real post-to-channel path now contains a validated build decision hook
- metadata and feedback-input positioning are already working
- future gate behavior is the next real product decision, not a structural assumption
- remaining structural debt can pause while signal quality is validated first
