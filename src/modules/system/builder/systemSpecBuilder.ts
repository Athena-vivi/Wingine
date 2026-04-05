import type { BuildModuleFlow, SystemSpec } from "../../../contracts/index.ts"

type SystemSpecBuilderInput = {
  modules: string[]
  contracts: BuildModuleFlow[]
}

export function buildSystemSpec(input: SystemSpecBuilderInput): SystemSpec {
  return {
    type: "system_spec",
    modules: [...input.modules],
    flows: input.contracts.map((contract) => ({
      from: contract.from,
      to: contract.to
    }))
  }
}
