# Expert Layer Design v0.1

## 1. Core Concept

Expert Layer = 一组独立的角色型评审模块  
用于审查 Problem / SystemSpec 的质量  
不参与业务执行，不改变 Runtime 行为

## 2. Relationship with Wingine

Wingine 决定：
- 做什么（Problem）
- 怎么做（Builder）
- 要不要投（Scoring / Betting）

Expert Layer 只负责：
- 审查这些决策是否合理

## 3. Initial Expert Roles

### 3.1 CEO Review

位置： Problem Score -> CEO Review -> Problem Decision

职责：
- 判断问题是否伪需求
- 是否值得投入
- 是否存在更高价值版本

输出：
- verdict（strong / weak / unclear）
- reason（文本）

### 3.2 Engineering Review

位置： SystemSpec -> Eng Review -> System Score

职责：
- 检查结构完整性
- 检查模块关系
- 检查潜在风险

输出：
- design_quality（0~1）
- issues（数组）
- suggestion（文本）

### 3.3 QA / Reality Check（占位）

位置： System Decision -> QA Review -> Feedback

职责：
- 检查是否可执行
- 检查现实合理性

当前只定义，不实现

## 4. Strict Boundaries

- Expert Layer 不进入 Runtime
- 不参与 dispatch
- 不修改 shared object
- 不替代 scoring / betting
- 不成为 decision source

## 5. Future Integration Strategy

- Expert Layer 未来可影响：
  - scoring 权重
  - decision 阈值
- 但当前阶段只做“观察与记录”

## 6. Summary

Wingine = decision system  
Expert Layer = judgment auditing layer
