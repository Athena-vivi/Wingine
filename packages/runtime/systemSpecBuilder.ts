type SystemSpecBuilderInput = {
  modules: string[]
  contracts: Array<{
    from: string
    to: string
  }>
}

type SystemSpec = {
  type: "system_spec"
  modules: string[]
  flows: Array<{
    from: string
    to: string
  }>
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
