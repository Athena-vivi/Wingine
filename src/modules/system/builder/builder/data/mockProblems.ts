import type { Problem } from "../types/builder.ts"

export const mockProblems: Problem[] = [
  {
    id: "p_001",
    title: "Search terms wasting ad spend",
    description: "Seller cannot quickly identify high-spend, non-converting search terms.",
    source: "Reddit",
    tag: "ads",
    context: "Amazon PPC search term report review",
    frequency: "high",
    cost: "Wasted budget and slow optimization"
  },
  {
    id: "p_002",
    title: "Too many manual steps to review listing changes",
    description: "Seller spends too much time checking competitor listing changes manually.",
    source: "Seller Forum",
    tag: "listing",
    context: "Competitor monitoring",
    frequency: "medium",
    cost: "Time cost and missed changes"
  },
  {
    id: "p_003",
    title: "Support replies take too long to standardize",
    description: "Operators rewrite similar customer support answers from scratch every day.",
    source: "Internal Notes",
    tag: "ops",
    context: "Post-purchase customer support",
    frequency: "high",
    cost: "Slow response time and inconsistent messaging"
  }
]


