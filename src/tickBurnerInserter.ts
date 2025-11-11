import type { AppState, BurnerInserterEntity } from "./types";
import { INSERTER_DELIVER_TICKS, INSERTER_RETURN_TICKS } from "./constants";
import {
  getSourceTileForInserter,
  getTargetTileForInserter,
  getEntityAtTile,
  getRequestedItems,
  getAvailableItems,
  transferItem,
} from "./entityUtils";

/**
 * Process one tick for a burner inserter entity.
 * Handles item transfer logic with three states: idle, deliver, return.
 */
export function tickBurnerInserter(
  draft: AppState,
  entity: BurnerInserterEntity,
) {
  const { state } = entity;

  switch (state.type) {
    case "idle":
      tickIdle(draft, entity);
      break;
    case "deliver":
      tickDeliver(draft, entity);
      break;
    case "return":
      tickReturn(draft, entity);
      break;
  }
}

/**
 * Tick logic for IDLE state.
 * Finds source and target entities, detects requested items, and transitions to DELIVER if possible.
 */
function tickIdle(draft: AppState, entity: BurnerInserterEntity) {
  // Find source entity (to the left)
  const sourceTile = getSourceTileForInserter(entity);
  const sourceEntity = getEntityAtTile(draft, sourceTile.x, sourceTile.y);

  // Find target entity (to the right/in front)
  const targetTile = getTargetTileForInserter(entity);
  const targetEntity = getEntityAtTile(draft, targetTile.x, targetTile.y);

  // Both entities must exist
  if (!sourceEntity || !targetEntity) {
    return;
  }

  // Get items that target is requesting
  const requestedItems = getRequestedItems(draft, targetEntity);

  // Get items that source has available
  const availableItems = getAvailableItems(draft, sourceEntity);

  // Find first requested item that's available
  const itemToDeliver = requestedItems.find((item) =>
    availableItems.includes(item),
  );

  if (itemToDeliver) {
    // Transition to DELIVER state
    entity.state = {
      type: "deliver",
      itemType: itemToDeliver,
      progress: 0,
    };
  }
}

/**
 * Tick logic for DELIVER state.
 * Increments progress, attempts delivery when progress reaches 1.
 */
function tickDeliver(draft: AppState, entity: BurnerInserterEntity) {
  if (entity.state.type !== "deliver") return;

  if (entity.state.type !== "deliver") return;

  // Increment progress
  entity.state.progress += 1 / INSERTER_DELIVER_TICKS;

  // Cap at 1
  if (entity.state.progress > 1) {
    entity.state.progress = 1;
  }

  // Attempt delivery when progress reaches 1
  if (entity.state.progress >= 1) {
    attemptDelivery(draft, entity);
  }
}

/**
 * Attempts to deliver the held item to the target entity.
 * If successful, transitions to RETURN. If target no longer requests the item, stays stuck.
 */
function attemptDelivery(draft: AppState, entity: BurnerInserterEntity) {
  if (entity.state.type !== "deliver") return;

  const itemType = entity.state.itemType;

  // Re-find source and target entities
  const sourceTile = getSourceTileForInserter(entity);
  const sourceEntity = getEntityAtTile(draft, sourceTile.x, sourceTile.y);

  const targetTile = getTargetTileForInserter(entity);
  const targetEntity = getEntityAtTile(draft, targetTile.x, targetTile.y);

  // Verify both entities still exist
  if (!sourceEntity || !targetEntity) {
    // Entities disappeared, return to idle
    entity.state = { type: "idle" };
    return;
  }

  // Check if target still requests this item
  const requestedItems = getRequestedItems(draft, targetEntity);
  if (!requestedItems.includes(itemType)) {
    // Item no longer requested, stay stuck in DELIVER state
    return;
  }

  // Transfer the item (stub for now)
  transferItem(draft, sourceEntity, targetEntity, itemType);

  // Transition to RETURN state
  entity.state = {
    type: "return",
    progress: 0,
  };
}

/**
 * Tick logic for RETURN state.
 * Increments progress, transitions to IDLE when progress reaches 1.
 */
function tickReturn(_draft: AppState, entity: BurnerInserterEntity) {
  if (entity.state.type !== "return") return;

  // Increment progress
  entity.state.progress += 1 / INSERTER_RETURN_TICKS;

  // When progress reaches or exceeds 1, transition to IDLE
  if (entity.state.progress >= 1) {
    entity.state = { type: "idle" };
  }
}
