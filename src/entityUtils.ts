import { ENTITY_CONFIGS } from "./types";
import type { Entity, EntityType } from "./types";

/**
 * Returns an array of tile coordinates occupied by the entity
 */
export function getTilesForEntity(
  entity: Entity,
): Array<{ x: number; y: number }> {
  const tiles: Array<{ x: number; y: number }> = [];
  for (let dy = 0; dy < entity.size.y; dy++) {
    for (let dx = 0; dx < entity.size.x; dx++) {
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
