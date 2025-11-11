import type { AppState, BurnerMiningDrillEntity } from "./types";

/**
 * Process one tick for a burner mining drill entity.
 * Currently a no-op placeholder - mining logic to be implemented.
 */
export function tickBurnerMiningDrill(
  _draft: AppState,
  entity: BurnerMiningDrillEntity,
) {
  const { state } = entity;

  switch (state.type) {
    case "idle":
      // TODO: Implement mining logic
      // Check if positioned over a resource tile
      // Start mining if resource exists
      break;
  }
}
