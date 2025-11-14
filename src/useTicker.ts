import { useEffect, useRef } from "react";
import type { Updater } from "use-immer";
import type { AppState } from "./types";
import { tickAction } from "./tickAction";
import { tickAllBelts } from "./tickBelt";
import { tickBurnerInserter } from "./tickBurnerInserter";
import { tickBurnerMiningDrill } from "./tickBurnerMiningDrill";
import { tickStoneFurnace } from "./tickStoneFurnace";
import { tickAllTestBeltInputs } from "./tickTestBeltInput";
import { tickTestBeltOutput } from "./tickTestBeltOutput";
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

          // Process all belts (once per tick)
          tickAllBelts(draft);

          // Process all test-belt-inputs (once per tick)
          tickAllTestBeltInputs(draft, draft.tick);

          // Process other entities
          for (const entity of draft.entities.values()) {
            switch (entity.type) {
              case "burner-inserter":
                tickBurnerInserter(draft, entity);
                break;
              case "stone-furnace":
                tickStoneFurnace(draft, entity);
                break;
              case "burner-mining-drill":
                tickBurnerMiningDrill(draft, entity);
                break;
              case "belt":
                // Belt ticking is handled by tickAllBelts() above
                break;
              case "test-belt-input":
                // Test-belt-input ticking is handled by tickAllTestBeltInputs() above
                break;
              case "test-belt-output":
                tickTestBeltOutput(draft, entity);
                break;
              case "home-storage":
                // No tick logic for home-storage
                break;
            }
          }
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
