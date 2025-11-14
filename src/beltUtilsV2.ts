import type { AppState, BeltEntity, EntityId, Rotation } from "./types";

export interface LaneNode {
  type: "belt-left-lane" | "belt-right-lane";
  beltId: string;
  outputs: LaneNode[];
}

export interface BeltNetwork {
  id: string;
}

export function computeBeltNetworks(state: AppState) {
  const seen = new Set<EntityId>();

  for (const entity of state.entities.values()) {
    if (!(entity.type === "belt") || seen.has(entity.id)) {
      continue;
    }

    const _leftLaneNode: LaneNode = {
      type: "belt-left-lane",
      beltId: entity.id,
      outputs: getLeftLaneOutputs(state, entity),
    };
    void _leftLaneNode; // Suppress unused variable warning
  }
}

export function getLeftLaneOutputs(
  state: AppState,
  belt: BeltEntity,
): LaneNode[] {
  const outputRotation: Rotation = belt.rotation;
  void state;
  void belt;
  void outputRotation;
  return [];
}
