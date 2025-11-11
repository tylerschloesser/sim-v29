import type {
  AppState,
  BurnerInserterEntity,
  Entity,
  EntityType,
  ItemType,
} from "./types";
import { ENTITY_CONFIGS, TILE_SIZE } from "./types";

/**
 * Returns the rotated size of an entity (swaps dimensions for 90/270 degree rotations)
 */
export function getRotatedSize(
  size: { x: number; y: number },
  rotation: 0 | 90 | 180 | 270,
): { x: number; y: number } {
  if (rotation === 90 || rotation === 270) {
    return { x: size.y, y: size.x };
  }
  return { x: size.x, y: size.y };
}

/**
 * Returns the center pixel position for a sprite given tile position and rotated size
 */
export function getCenterPixelPosition(
  position: { x: number; y: number },
  rotatedSize: { x: number; y: number },
): { x: number; y: number } {
  return {
    x: (position.x + rotatedSize.x / 2) * TILE_SIZE,
    y: (position.y + rotatedSize.y / 2) * TILE_SIZE,
  };
}

/**
 * Returns an array of tile coordinates occupied by the entity
 */
export function getTilesForEntity(
  entity: Entity,
): Array<{ x: number; y: number }> {
  const tiles: Array<{ x: number; y: number }> = [];
  const rotatedSize = getRotatedSize(entity.size, entity.rotation);

  for (let dy = 0; dy < rotatedSize.y; dy++) {
    for (let dx = 0; dx < rotatedSize.x; dx++) {
      tiles.push({
        x: entity.position.x + dx,
        y: entity.position.y + dy,
      });
    }
  }
  return tiles;
}

/**
 * Returns the color for a given entity type
 */
export function getEntityColor(type: EntityType): number {
  return ENTITY_CONFIGS[type].color;
}

/**
 * Returns the tile coordinate for the source (left side) of a burner inserter.
 * At rotation 0 (facing right/east), source is to the west (left).
 * At rotation 90 (facing down/south), source is to the north (left relative to facing).
 * At rotation 180 (facing left/west), source is to the east (left relative to facing).
 * At rotation 270 (facing up/north), source is to the south (left relative to facing).
 */
export function getSourceTileForInserter(entity: BurnerInserterEntity): {
  x: number;
  y: number;
} {
  const { position, rotation } = entity;

  switch (rotation) {
    case 0: // Facing right/east, source is west
      return { x: position.x - 1, y: position.y };
    case 90: // Facing down/south, source is north
      return { x: position.x, y: position.y - 1 };
    case 180: // Facing left/west, source is east
      return { x: position.x + 1, y: position.y };
    case 270: // Facing up/north, source is south
      return { x: position.x, y: position.y + 1 };
  }
}

/**
 * Returns the tile coordinate for the target (right side/in front) of a burner inserter.
 * At rotation 0 (facing right/east), target is to the east (right/in front).
 * At rotation 90 (facing down/south), target is to the south (right/in front).
 * At rotation 180 (facing left/west), target is to the west (right/in front).
 * At rotation 270 (facing up/north), target is to the north (right/in front).
 */
export function getTargetTileForInserter(entity: BurnerInserterEntity): {
  x: number;
  y: number;
} {
  const { position, rotation } = entity;

  switch (rotation) {
    case 0: // Facing right/east, target is east
      return { x: position.x + 1, y: position.y };
    case 90: // Facing down/south, target is south
      return { x: position.x, y: position.y + 1 };
    case 180: // Facing left/west, target is west
      return { x: position.x - 1, y: position.y };
    case 270: // Facing up/north, target is north
      return { x: position.x, y: position.y - 1 };
  }
}

/**
 * Returns the entity at a given tile coordinate, or undefined if no entity exists there
 */
export function getEntityAtTile(
  state: AppState,
  tileX: number,
  tileY: number,
): Entity | undefined {
  // Find which chunk contains this tile
  const chunkX = Math.floor(tileX / 32) * 32;
  const chunkY = Math.floor(tileY / 32) * 32;
  const chunkId = `${chunkX},${chunkY}`;

  const chunk = state.chunks.get(chunkId);
  if (!chunk) return undefined;

  // Calculate tile index within chunk
  const localX = tileX - chunkX;
  const localY = tileY - chunkY;
  const tileIndex = localY * 32 + localX;

  const tile = chunk.tiles[tileIndex];
  if (!tile?.entityId) return undefined;

  return state.entities.get(tile.entityId);
}

const ALL_ITEM_TYPES: Set<ItemType> = new Set([
  "coal",
  "copper",
  "iron",
  "stone",
  "stone-furnace",
  "home-storage",
  "burner-inserter",
]);

const EMPTY_SET: Set<ItemType> = new Set();

/**
 * Returns the items that an entity is requesting.
 * For home-storage: accepts all item types (returns all ItemTypes).
 * For stone-furnace: returns requestedItems array.
 * TODO: Implement proper request logic based on entity type and state.
 */
export function getRequestedItems(
  state: AppState,
  entity: Entity,
): Set<ItemType> {
  void state; // May be used in future for more complex logic

  if (entity.type === "home-storage") {
    return ALL_ITEM_TYPES;
  } else if (entity.type === "stone-furnace") {
    return new Set(["iron"]);
  }
  return EMPTY_SET;
}

/**
 * Returns the items that an entity has available for pickup.
 * For home-storage: checks top-level inventory (player inventory).
 * For stone-furnace: checks entity's own inventory.
 * TODO: Implement proper availability logic based on entity type and inventory.
 */
export function getAvailableItems(
  state: AppState,
  entity: Entity,
): Set<ItemType> {
  if (entity.type === "home-storage") {
    return new Set(Object.keys(state.inventory) as ItemType[]);
  } else if (entity.type === "stone-furnace") {
    return new Set(Object.keys(entity.outputInventory) as ItemType[]);
  }
  return EMPTY_SET;
}
