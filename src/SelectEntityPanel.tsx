import { inventoryHas } from "./inventoryUtils";
import { Panel } from "./Panel";
import { ENTITY_TYPES, type EntityType, type Inventory } from "./types";

interface SelectEntityPanelProps {
  inventory: Inventory;
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
            disabled={!inventoryHas(inventory, entityType)}
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
