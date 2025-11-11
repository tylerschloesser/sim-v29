import type { AppState, BeltEntity } from "./types";

/**
 * Process one tick for a belt entity.
 * Currently a no-op placeholder for future belt logic.
 */
export function tickBelt(_draft: AppState, _entity: BeltEntity) {
  // No-op for now
  void _draft;
  void _entity;
}
