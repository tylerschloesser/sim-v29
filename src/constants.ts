/**
 * Shared game configuration constants
 */

import type { BeltTurn } from "./types";

// === Game Loop Constants ===
/** Ticks per second for the game loop */
export const TICK_RATE = 60;

/** Milliseconds per tick (~16.67ms) */
export const TICK_INTERVAL = 1000 / TICK_RATE;

// === Action Duration Constants ===
/** Duration of mining action in ticks (2 seconds) */
export const MINE_DURATION_TICKS = 2 * TICK_RATE;

/** Duration of burner inserter deliver action in ticks (1 second) */
export const INSERTER_DELIVER_TICKS = 1 * TICK_RATE;

/** Duration of burner inserter return action in ticks (1 second) */
export const INSERTER_RETURN_TICKS = 1 * TICK_RATE;

/** Duration of stone furnace smelting action in ticks (1 second) */
export const SMELT_DURATION_TICKS = 1 * TICK_RATE;

/** Duration of burner mining drill mining action in ticks (2 seconds) */
export const MINING_DRILL_DURATION_TICKS = 2 * TICK_RATE;

// === Camera Constants ===
/** Pixels per frame for WASD camera movement */
export const CAMERA_SPEED = 5;

// === World Generation Constants ===
/** Seed for procedural world generation */
export const WORLD_SEED = "sim-v29-world";

// === Belt Constants ===
/** Belt movement speed in positions per tick */
export const BELT_SPEED = 1;

/** Minimum spacing between items on a belt (in positions) */
export const BELT_ITEM_SPACING = 16;

/**
 * Get the total length of a belt in positions based on turn direction and lane.
 *
 * Straight belts: 64 positions (both lanes)
 * Right turns: left lane (outer) = 96, right lane (inner) = 32
 * Left turns: left lane (inner) = 32, right lane (outer) = 96
 */
export function getBeltLength(
  turn: BeltTurn,
  laneType: "left" | "right",
): number {
  if (turn === "none") {
    return 64; // Straight belts always 64
  } else if (turn === "right") {
    // Right turn: left lane is outer (longer), right lane is inner (shorter)
    return laneType === "left" ? 96 : 32;
  } else {
    // Left turn: left lane is inner (shorter), right lane is outer (longer)
    return laneType === "left" ? 32 : 96;
  }
}
