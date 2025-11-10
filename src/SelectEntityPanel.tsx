import { Panel } from "./Panel";
import { ENTITY_TYPES, type EntityType } from "./types";

interface SelectEntityPanelProps {
  inventory: Record<EntityType, number>;
  onSelectEntity: (entityType: EntityType) => void;
}

export function SelectEntityPanel({
  inventory,
  onSelectEntity,
}: SelectEntityPanelProps) {
  return (
    <Panel className="p-4">
      <div className="flex flex-col gap-2">
        {ENTITY_TYPES.map((entityType) => (
          <button
            key={entityType}
            disabled={inventory[entityType] === 0}
            onClick={() => onSelectEntity(entityType)}
            className="px-4 py-2 bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {entityType}
          </button>
        ))}
      </div>
    </Panel>
  );
}
