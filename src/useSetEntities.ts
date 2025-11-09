import { useEffect } from "react";
import { useAppContext } from "./appContext";

/**
 * Syncs entity state changes to PixiJS rendering layer
 */
export function useSetEntities() {
  const { state, updateEntities } = useAppContext();

  useEffect(() => {
    updateEntities(state.entities);
  }, [state.entities, updateEntities]);
}
