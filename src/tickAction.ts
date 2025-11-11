import invariant from "tiny-invariant";
import type { AppState } from "./types";
import { getTileLocation } from "./tileUtils";
import { MINE_DURATION_TICKS } from "./constants";

/**
 * Process the current action for one tick.
 * Handles action progress and completion.
 */
export function tickAction(draft: AppState) {
  if (draft.action?.type === "mine") {
    // Auto-increment progress (1/120th per tick = 2 seconds to complete)
    draft.action.progress += 1 / MINE_DURATION_TICKS;

    // Complete action when progress reaches 1
    if (draft.action.progress >= 1) {
      draft.action.progress = 1;

      // Get tile location
      const { chunkId, tileIndex } = getTileLocation(draft.action.tileId);

      const chunk = draft.chunks.get(chunkId);
      invariant(chunk, "Chunk must exist for mining action");

      const tile = chunk.tiles[tileIndex];
      invariant(tile, "Tile must exist for mining action");
      invariant(tile.resource, "Tile must have resource for mining action");
      invariant(
        tile.resource.count > 0,
        "Resource count must be greater than 0 for mining action",
      );

      // Mine 1 unit of resource
      const minedAmount = 1;
      draft.inventory[tile.resource.type] += minedAmount;

      // Decrement resource count
      tile.resource.count -= minedAmount;

      // Remove resource from tile if depleted
      if (tile.resource.count <= 0) {
        delete tile.resource;
      }

      // Clear the action
      draft.action = null;
    }
  }
}
