import { ENTITY_CONFIGS, TILE_SIZE } from "./types";
import type { Entity, EntityType } from "./types";

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
