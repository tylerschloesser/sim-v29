import {
  COAL_BURN_TIME_TICKS,
  INSERTER_DELIVER_FUEL_TICKS,
  INSERTER_DELIVER_TICKS,
  INSERTER_RETURN_FUEL_TICKS,
  INSERTER_RETURN_TICKS,
} from "./constants";
import {
  getEntityAtTile,
  getRequestedItems,
  getSourceTileForInserter,
  getTargetTileForInserter,
} from "./entityUtils";
import { invariant } from "./invariant";
import {
  takeFirstAvailableRequested,
  tryPutItem,
  type AppState,
  type BurnerInserterEntity,
} from "./types";

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
    case "deliver-fuel":
      tickDeliverFuel(draft, entity);
      break;
    case "return-fuel":
      tickReturnFuel(draft, entity);
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

  if (entity.fuel === 0) {
    if (!sourceEntity) {
      return;
    }
    const itemType = takeFirstAvailableRequested(
      draft,
      sourceEntity,
      new Set(["coal"]),
    );
    if (itemType === null) {
      return;
    }
    entity.state = {
      type: "deliver-fuel",
      itemType: itemType,
      progress: 0,
    };
    return;
  }

  // Find target entity (to the right/in front)
  const targetTile = getTargetTileForInserter(entity);
  const targetEntity =
    getEntityAtTile(draft, targetTile.x, targetTile.y) ?? null;

  // Both entities must exist
  if (!sourceEntity || !targetEntity) {
    return;
  }

  // Get items that target is requesting
  const requestedItems = getRequestedItems(draft, targetEntity);

  // Find first requested item that's available
  const itemToDeliver = takeFirstAvailableRequested(
    draft,
    sourceEntity,
    requestedItems,
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
  invariant(entity.state.type === "deliver");

  entity.fuel = Math.max(entity.fuel - 1, 0);

  entity.state.progress = Math.min(
    entity.state.progress + 1 / INSERTER_DELIVER_TICKS,
    1,
  );

  // Attempt delivery when progress reaches 1
  if (entity.state.progress === 1) {
    attemptDelivery(draft, entity);
  }
}

function tickDeliverFuel(draft: AppState, entity: BurnerInserterEntity) {
  void draft;
  invariant(entity.state.type === "deliver-fuel");

  entity.fuel = Math.max(entity.fuel - 1, 0);

  entity.state.progress = Math.min(
    entity.state.progress + 1 / INSERTER_DELIVER_FUEL_TICKS,
    1,
  );

  if (entity.state.progress === 1) {
    invariant(entity.state.itemType === "coal");
    entity.fuel += COAL_BURN_TIME_TICKS;
    entity.state = {
      type: "return-fuel",
      progress: 0,
    };
  }
}

function tickReturnFuel(_draft: AppState, entity: BurnerInserterEntity) {
  invariant(entity.state.type === "return-fuel");

  entity.fuel = Math.max(entity.fuel - 1, 0);
  entity.state.progress = Math.min(
    entity.state.progress + 1 / INSERTER_RETURN_FUEL_TICKS,
    1,
  );

  if (entity.state.progress === 1) {
    entity.state = { type: "idle" };
  }
}

/**
 * Attempts to deliver the held item to the target entity.
 * For belts: places item at position 32 if positions 17-47 are free.
 * For other entities: uses inventory-based delivery.
 * If successful, transitions to RETURN. If blocked, stays in DELIVER state.
 */
function attemptDelivery(draft: AppState, entity: BurnerInserterEntity) {
  invariant(entity.state.type === "deliver");

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
  if (!requestedItems.has(itemType)) {
    // Item no longer requested, stay stuck in DELIVER state
    return;
  }

  if (tryPutItem(draft, targetEntity, itemType).success) {
    // Transition to RETURN state
    entity.state = {
      type: "return",
      progress: 0,
    };
  }
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
