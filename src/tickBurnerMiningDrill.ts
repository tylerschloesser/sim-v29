import { BELT_ITEM_SPACING, MINING_DRILL_DURATION_TICKS } from "./constants";
import {
  getEntityAtTile,
  getOutputTileForBurnerMiningDrill,
  getTilesForEntity,
} from "./entityUtils";
import { decrementInventory, incrementInventory } from "./inventoryUtils";
import { getTileAtCoords } from "./tileUtils";
import type {
  AppState,
  BurnerMiningDrillEntity,
  ItemType,
  ResourceType,
} from "./types";
import { getBeltItemId } from "./types";

/**
 * Process one tick for a burner mining drill entity.
 * Handles mining resources from tiles covered by the entity and outputs to belt if present.
 */
export function tickBurnerMiningDrill(
  draft: AppState,
  entity: BurnerMiningDrillEntity,
) {
  const { state } = entity;

  // Run state machine for mining
  switch (state.type) {
    case "idle":
      tickIdle(draft, entity);
      break;
    case "mining":
      tickMining(draft, entity);
      break;
  }

  // After state machine, always attempt to output inventory to belt
  tryOutputToBelt(draft, entity);
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
 * Increments progress and adds mined resource to output inventory when complete.
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

function getFirstAvailableItemForOutput(
  entity: BurnerMiningDrillEntity,
): ItemType | null {
  for (const [itemType, count] of Object.entries(entity.outputInventory)) {
    if (count > 0) {
      return itemType as ItemType;
    }
  }
  return null;
}

/**
 * Attempts to output one item from the drill's output inventory to a belt.
 * This runs every tick, independently of the mining state.
 */
function tryOutputToBelt(
  draft: AppState,
  entity: BurnerMiningDrillEntity,
): void {
  const itemType = getFirstAvailableItemForOutput(entity);
  if (!itemType) {
    return;
  }

  // Get output tile and check for belt
  const outputTile = getOutputTileForBurnerMiningDrill(entity);
  const outputEntity = getEntityAtTile(draft, outputTile.x, outputTile.y);

  // Check if output is a belt
  if (outputEntity?.type !== "belt") return;

  // Check if belt's leftLane has space at position 0
  const leftLane = outputEntity.leftLane;
  const firstItem = leftLane.at(0);
  if (firstItem && firstItem.position < BELT_ITEM_SPACING) {
    return;
  }

  // Transfer item from inventory to belt
  decrementInventory(entity.outputInventory, itemType);

  leftLane.unshift({
    id: getBeltItemId(draft.nextBeltItemId++),
    itemType: itemType,
    position: 0,
  });
}
