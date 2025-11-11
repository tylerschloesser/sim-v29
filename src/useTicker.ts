import { useEffect, useRef } from "react";
import type { Updater } from "use-immer";
import type { AppState } from "./types";
import { tickAction } from "./tickAction";
import { TICK_INTERVAL } from "./constants";

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
