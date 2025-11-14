import invariant from "tiny-invariant";
import { getTileAtCoords } from "./tileUtils";
import {
  type AppState,
  type BeltEntity,
  type Entity,
  type EntityId,
  type Rotation,
  type Tile,
} from "./types";

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

function getBeltOutput(
  state: AppState,
  belt: BeltEntity,
): { rotation: Rotation; tile: Tile | null; entity: Entity | null } {
  let outputRotation: Rotation = belt.rotation;
  if (belt.turn === "left") {
    switch (belt.rotation) {
      case 0:
        outputRotation = 270;
        break;
      case 90:
        outputRotation = 0;
        break;
      case 180:
        outputRotation = 90;
        break;
      case 270:
        outputRotation = 180;
        break;
    }
  } else if (belt.turn === "right") {
    switch (belt.rotation) {
      case 0:
        outputRotation = 90;
        break;
      case 90:
        outputRotation = 180;
        break;
      case 180:
        outputRotation = 270;
        break;
      case 270:
        outputRotation = 0;
        break;
    }
  }
  let tileX = belt.position.x;
  let tileY = belt.position.y;
  switch (outputRotation) {
    case 0:
      tileX += 1;
      break;
    case 90:
      tileY += 1;
      break;
    case 180:
      tileX -= 1;
      break;
    case 270:
      tileY -= 1;
      break;
  }
  const tile = getTileAtCoords(state, tileX, tileY);
  invariant(tile, `Tile at (${tileX}, ${tileY}) not found`);
  let entity: Entity | null = null;
  if (tile?.entityId) {
    entity = state.entities.get(tile.entityId) ?? null;
    invariant(entity, `Entity with ID ${tile.entityId} not found`);
  }

  return {
    rotation: outputRotation,
    tile,
    entity,
  };
}

export function getLeftLaneOutputs(
  state: AppState,
  belt: BeltEntity,
): LaneNode[] {
  const output = getBeltOutput(state, belt);
  void output;

  return [];
}
