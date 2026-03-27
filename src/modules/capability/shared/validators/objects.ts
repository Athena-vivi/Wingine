import { hasBaseFields } from "./base.ts"

export function isProblemObject(input: unknown): boolean {
  return hasBaseFields(input) && (input as Record<string, unknown>).type === "problem"
}

export function isModuleObject(input: unknown): boolean {
  return hasBaseFields(input) && (input as Record<string, unknown>).type === "module"
}

export function isOutputObject(input: unknown): boolean {
  return hasBaseFields(input) && (input as Record<string, unknown>).type === "output"
}

export function isWorkflowObject(input: unknown): boolean {
  return hasBaseFields(input) && (input as Record<string, unknown>).type === "workflow"
}

export function isScoreObject(input: unknown): boolean {
  return hasBaseFields(input) && (input as Record<string, unknown>).type === "score"
}

export function isBetObject(input: unknown): boolean {
  return hasBaseFields(input) && (input as Record<string, unknown>).type === "bet"
}

