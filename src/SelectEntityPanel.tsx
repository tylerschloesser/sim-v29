import { Panel } from "./Panel";
import type { EntityType } from "./types";

const ENTITY_TYPES: EntityType[] = ["stone-furnace", "home-storage"];

interface SelectEntityPanelProps {
  inventory: Record<EntityType, number>;
}

export function SelectEntityPanel({ inventory }: SelectEntityPanelProps) {
  return (
    <Panel className="p-4">
      <div className="flex flex-col gap-2">
        {ENTITY_TYPES.map((entityType) => (
          <button
            key={entityType}
            disabled={inventory[entityType] === 0}
            className="px-4 py-2 bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {entityType}
          </button>
        ))}
      </div>
    </Panel>
  );
}
