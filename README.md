Wingine

Wingine is a problem-driven, protocol-driven, goal-oriented system.

Current main chain:

`Problem -> Build -> Output -> Feedback`

Current model:

- `Decision(target, context?)` is a horizontal capability, not a chain node
- `build(...)` is the only external structure-generation entry
- the repository is organized as a layer-first `src/` architecture
- the system classification is now:
  - `System`: Problem, Builder
  - `Capability`: Decision, Feedback, Execution, Runtime, Shared

Current architectural framing:

- `Problem-driven`: the system starts from problem intake and normalization
- `Protocol-driven`: cross-layer collaboration is shaped through protocol and contract surfaces
- `Goal-oriented`: Build chooses and produces structure toward an intended output goal

Current authoritative docs:

- [System Core Protocol v1](docs/protocols/system-core-protocol-v1.md)
- [Project Architecture v0.2](docs/architecture/project-architecture-v0.2.md)
- [Build Decision Hook Validation v0.1](docs/meta/build-decision-hook-validation-v0.1.md)
- [System Architecture Freeze v0.2](docs/meta/system-architecture-freeze-v0.2.md)
- [Structural Debt Classification v0.2](docs/meta/structural-debt-classification-v0.2.md)

Current status:

- main chain and system skeleton are frozen
- Decision and Build external interfaces are unified
- layer-first structure is established
- build-level decision is now validated as metadata/feedback-only signal
- the current single next priority is validating build-level decision signal quality before any gate behavior
