# System Core Protocol v1

This protocol defines the invariant system structure of Wingine.

This document does not describe implementation details.
This document does not redefine the current codebase.
This document defines the single system skeleton that all later work must follow.

## 1. Main Chain Definition

### Main Chain

`Problem -> Build -> Output -> Feedback`

This is the only main chain.

No second main chain is allowed.

### 1.1 Problem

Meaning:
- Problem is the normalized target that the system chooses to respond to.
- Problem is the starting point of the main chain.

Input:
- external signal
- raw text
- source context
- normalized problem object

Output:
- Problem

### 1.2 Build

Meaning:
- Build is the single structure-generation step of the system.
- Build transforms a Problem into a usable result structure.
- Build is the only place where structure is generated.

Input:
- Problem
- optional Decision(Problem)

Output:
- BuildResult

### 1.3 Output

Meaning:
- Output converts a BuildResult into externally usable expression or delivery form.
- Output does not redefine the structure. It expresses the built result.

Input:
- BuildResult

Output:
- Output

### 1.4 Feedback

Meaning:
- Feedback records what happened after Output.
- Feedback closes the main chain.

Input:
- Output
- outcome signal
- usage signal
- review signal

Output:
- Feedback

## 2. Builder Definition

### Builder

Builder is the only structure-generation capability in the system.

Input:
- Problem
- optional Decision(Problem)
- optional Decision(BuildResult) when refinement is required before Output

Output:
- System
- Content

### 2.1 Unified Builder Principle

- System and Content are same-origin build results.
- Both are outputs of Builder.
- Their difference is not category difference.
- Their difference is dynamic degree.

### 2.2 Dynamic Degree Rule

- System = dynamic structure
- Content = static or weak-dynamic structure

### 2.3 Builder Invariant

- Builder is the only capability allowed to generate structure.
- Content must not be defined as an independent chain.
- Content must not become a main-chain node.

## 3. Decision Definition

### Decision(target)

Decision is a horizontal capability.

Decision is not a chain step.

Decision may include:
- Score
- Bet
- Strategy
- Role Perspective

### 3.1 Decision Target

`Decision(target)` must support:
- Problem
- BuildResult

### 3.2 Decision Meaning

- Decision evaluates a target.
- Decision influences build behavior or post-build judgment.
- Decision does not create a new chain.
- Decision does not replace Build.

### 3.3 Decision Forms

- `Decision(Problem)` is allowed after Problem.
- `Decision(BuildResult)` is allowed after Build.

## 4. Capability Rules

### Capability Insertion Rules

`Decision(target)` may be inserted:
- after Problem
- after Build

But:
- it must not change the main chain
- it must not change chain order
- it must not create a new workflow step in the main chain

### 4.1 Horizontal Capability Rule

- Decision belongs to capability space
- Decision does not belong to chain space
- Decision is reusable across multiple targets

### 4.2 Chain Stability Rule

The main chain remains:

`Problem -> Build -> Output -> Feedback`

even when Decision is present.

Valid form:

`Problem -> Decision(Problem) -> Build -> Decision(BuildResult) -> Output -> Feedback`

Interpretation:
- the main chain is unchanged
- Decision is attached capability, not chain node

## 5. System Function Model

### Unified Model

`System = f(target)`

```text
f(target):
    decision = Decision(target)
    result = Build(target, decision)
    output = Output(result)
    feedback = Feedback(output)
```

### 5.1 Model Interpretation

- target is the object currently being judged or acted on
- Decision is optional as a capability call, but always horizontal in meaning
- Build is the unique structure-generation operation
- Output is the unique expression operation
- Feedback is the unique closure operation

### 5.2 Target Rule

- if target is Problem, the system is building from demand
- if target is BuildResult, the system is judging built structure

This changes target scope, not chain structure.

## 6. Forbidden Rules

### Forbidden Rules

- Do not add a second main chain.
- Do not define Score as a workflow step.
- Do not define Bet as a workflow step.
- Do not define Content as an independent chain.
- Do not write Decision into Build internal meaning.
- Do not convert horizontal capabilities into chain nodes.
- Do not split System and Content into different primary chains.
- Do not treat Strategy or Role Perspective as chain steps.

## 7. Naming Freeze

The following names are frozen by this protocol:

- Main Chain
- Problem
- Build
- BuildResult
- Output
- Feedback
- Builder
- Decision(target)
- System
- Content

## 8. Protocol Summary

- The system has one and only one main chain.
- The main chain is `Problem -> Build -> Output -> Feedback`.
- Builder is the only structure-generation capability.
- System and Content are same-origin build results.
- Decision is a horizontal capability, not a chain step.
- Decision may be inserted after Problem or after Build.
- Decision must never change the main chain.

This task is NOT about refactoring code.
This task is about defining the invariant system structure.

The output must REDUCE complexity, not introduce new concepts.
