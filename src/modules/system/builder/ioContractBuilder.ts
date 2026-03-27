import type { BuildModuleFlow } from "../../../contracts/index.ts"

type StructuralModuleList = {
  modules: string[]
}

type ModuleIOContractList = {
  contracts: BuildModuleFlow[]
}

export function buildModuleIOContracts(input: StructuralModuleList): ModuleIOContractList {
  const contracts: BuildModuleFlow[] = []

  for (let index = 0; index < input.modules.length - 1; index += 1) {
    contracts.push({
      from: input.modules[index],
      to: input.modules[index + 1]
    })
  }

  return { contracts }
}
