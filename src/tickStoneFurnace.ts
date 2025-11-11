import { SMELT_DURATION_TICKS } from "./constants";
import {
  decrementInventory,
  incrementInventory,
  inventoryHas,
} from "./inventoryUtils";
import type { AppState, StoneFurnaceEntity } from "./types";

/**
 * Process one tick for a stone furnace entity.
 * Handles smelting logic with two states: idle and smelting.
 */
export function tickStoneFurnace(draft: AppState, entity: StoneFurnaceEntity) {
  const { state } = entity;

  switch (state.type) {
    case "idle":
      tickIdle(draft, entity);
      break;
    case "smelting":
      tickSmelting(draft, entity);
      break;
  }
}

/**
 * Tick logic for IDLE state.
 * Checks if there's iron in the input inventory and starts smelting if available.
 */
function tickIdle(_draft: AppState, entity: StoneFurnaceEntity) {
  const { inputInventory } = entity;

  // Check if we have iron to smelt
  if (inventoryHas(inputInventory, "iron")) {
    // Consume one iron from input
    decrementInventory(inputInventory, "iron");

    // Transition to SMELTING state
    entity.state = {
      type: "smelting",
      itemType: "iron",
      progress: 0,
    };
  }
}

/**
 * Tick logic for SMELTING state.
 * Increments progress and produces iron-plate when complete.
 */
function tickSmelting(_draft: AppState, entity: StoneFurnaceEntity) {
  if (entity.state.type !== "smelting") return;

  // Increment progress
  entity.state.progress += 1 / SMELT_DURATION_TICKS;

  // Cap at 1
  if (entity.state.progress > 1) {
    entity.state.progress = 1;
  }

  // When smelting is complete, produce output
  if (entity.state.progress >= 1) {
    // Add iron-plate to output inventory
    incrementInventory(entity.outputInventory, "iron-plate");

    // Return to IDLE state
    entity.state = { type: "idle" };
  }
}
