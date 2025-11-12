import { useEffect } from "react";
import { useAppContext } from "./appContext";

/**
 * Syncs entity state changes to PixiJS rendering layer
 */
export function useSetEntities() {
  const { state, pixiController } = useAppContext();

  useEffect(() => {
    pixiController.updateEntities(state.entities);
    pixiController.updateBeltItems(state.entities);
    pixiController.updateProgressBars(state.entities);
  }, [state.entities, pixiController]);
}
