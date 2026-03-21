import type { ScoringObject } from "@/types/scoring"

type ObjectSelectorProps = {
  objects: ScoringObject[]
  selectedObjectId: string
  onSelect: (objectId: string) => void
}

export function ObjectSelector({ objects, selectedObjectId, onSelect }: ObjectSelectorProps) {
  return (
    <div>
      <label className="field-label" htmlFor="object-selector">
        Object Selector
      </label>
      <select
        id="object-selector"
        className="field-input"
        value={selectedObjectId}
        onChange={(event) => onSelect(event.target.value)}
      >
        {objects.map((object) => (
          <option key={object.id} value={object.id}>
            {object.type} / {object.title}
          </option>
        ))}
      </select>
    </div>
  )
}
