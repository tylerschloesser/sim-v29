/**
 * Shared game configuration constants
 */

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

// === Camera Constants ===
/** Pixels per frame for WASD camera movement */
export const CAMERA_SPEED = 5;

// === World Generation Constants ===
/** Seed for procedural world generation */
export const WORLD_SEED = "sim-v29-world";
