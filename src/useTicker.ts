import { useEffect, useRef } from "react";
import type { Updater } from "use-immer";
import invariant from "tiny-invariant";
import type { AppState } from "./types";
import { getTileLocation } from "./tileUtils";

const TICK_RATE = 60; // ticks per second
const TICK_INTERVAL = 1000 / TICK_RATE; // ms per tick (~16.67ms)

/**
 * Process the current action for one tick.
 * Handles action progress and completion.
 */
function tickAction(draft: AppState) {
  if (draft.action?.type === "mine") {
    // Auto-increment progress (1/60th per tick = 1 second to complete)
    draft.action.progress += 1 / TICK_RATE;

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

/**
 * Hook that initializes a fixed timestep ticker for the world simulation.
 * Runs at 60 ticks/second, decoupled from the display framerate.
 * Uses requestAnimationFrame with an accumulator pattern.
 */
export function useTicker(updateState: Updater<AppState>) {
  const lastFrameTimeRef = useRef<number>(performance.now());
  const accumulatorRef = useRef<number>(0);

  useEffect(() => {
    let animationFrameId: number;

    const tick = (currentTime: number) => {
      // Calculate delta time since last frame
      const deltaTime = currentTime - lastFrameTimeRef.current;
      lastFrameTimeRef.current = currentTime;

      // Add to accumulator
      accumulatorRef.current += deltaTime;

      // Process ticks while we have enough accumulated time
      while (accumulatorRef.current >= TICK_INTERVAL) {
        // Perform one tick
        updateState((draft) => {
          // Increment tick counter
          draft.tick++;

          // Process action
          tickAction(draft);
        });

        // Subtract one tick interval from accumulator
        accumulatorRef.current -= TICK_INTERVAL;
      }

      // Request next frame
      animationFrameId = requestAnimationFrame(tick);
    };

    // Start the loop
    animationFrameId = requestAnimationFrame(tick);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [updateState]);
}
