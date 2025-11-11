import { MINING_DRILL_DURATION_TICKS } from "./constants";
import { getTilesForEntity } from "./entityUtils";
import { incrementInventory } from "./inventoryUtils";
import { getTileAtCoords } from "./tileUtils";
import type { AppState, BurnerMiningDrillEntity, ResourceType } from "./types";

/**
 * Process one tick for a burner mining drill entity.
 * Handles mining resources from tiles covered by the entity.
 */
export function tickBurnerMiningDrill(
  draft: AppState,
  entity: BurnerMiningDrillEntity,
) {
  const { state } = entity;

  switch (state.type) {
    case "idle":
      tickIdle(draft, entity);
      break;
    case "mining":
      tickMining(draft, entity);
      break;
  }
}

/**
 * Tick logic for IDLE state.
 * Checks if any tile covered by the entity contains a resource.
 * If found, starts mining the first resource encountered.
 */
function tickIdle(draft: AppState, entity: BurnerMiningDrillEntity) {
  // Get all tiles covered by this entity
  const tiles = getTilesForEntity(entity);

  // Check each tile for a resource
  for (const { x, y } of tiles) {
    const tile = getTileAtCoords(draft, x, y);

    // If tile has a resource, start mining it
    if (tile?.resource && tile.resource.count > 0) {
      const resourceType: ResourceType = tile.resource.type;

      // Decrement resource count
      tile.resource.count -= 1;

      // Remove resource from tile if depleted
      if (tile.resource.count <= 0) {
        delete tile.resource;
      }

      // Transition to MINING state
      entity.state = {
        type: "mining",
        itemType: resourceType,
        progress: 0,
      };

      return; // Start mining the first resource found
    }
  }
}

/**
 * Tick logic for MINING state.
 * Increments progress and adds resource to output inventory when complete.
 */
function tickMining(_draft: AppState, entity: BurnerMiningDrillEntity) {
  if (entity.state.type !== "mining") return;

  // Increment progress
  entity.state.progress += 1 / MINING_DRILL_DURATION_TICKS;

  // Cap at 1
  if (entity.state.progress > 1) {
    entity.state.progress = 1;
  }

  // When mining is complete, produce output
  if (entity.state.progress >= 1) {
    // Add mined resource to output inventory
    incrementInventory(entity.outputInventory, entity.state.itemType);

    // Return to IDLE state
    entity.state = { type: "idle" };
  }
}
