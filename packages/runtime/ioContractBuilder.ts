type StructuralModuleList = {
  modules: string[]
}

type ModuleIOContract = {
  from: string
  to: string
}

type ModuleIOContractList = {
  contracts: ModuleIOContract[]
}

export function buildModuleIOContracts(input: StructuralModuleList): ModuleIOContractList {
  const contracts: ModuleIOContract[] = []

  for (let index = 0; index < input.modules.length - 1; index += 1) {
    contracts.push({
      from: input.modules[index],
      to: input.modules[index + 1]
    })
  }

  return { contracts }
}
