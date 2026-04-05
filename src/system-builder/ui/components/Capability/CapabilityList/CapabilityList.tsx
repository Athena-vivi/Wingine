import type { Capability } from "../../../../../system-builder/types.js"
import { CapabilityCard } from "../CapabilityCard/CapabilityCard.js"

type CapabilityListProps = {
  capabilities: Capability[]
}

export function CapabilityList({ capabilities }: CapabilityListProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {capabilities.map((capability) => (
        <CapabilityCard key={capability.id} capability={capability} />
      ))}
    </div>
  )
}
