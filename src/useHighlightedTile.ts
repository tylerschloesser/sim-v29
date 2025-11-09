import { useAppContext } from "./appContext";
import { getHighlightedTileCoords, getTileAtCoords } from "./tileUtils";

/**
 * Hook that returns the currently highlighted tile (the tile under the camera center)
 */
export function useHighlightedTile() {
  const { state } = useAppContext();

  const { tileX, tileY } = getHighlightedTileCoords(
    state.camera.x,
    state.camera.y,
  );

  const tile = getTileAtCoords(state, tileX, tileY);

  return {
    tileX,
    tileY,
    tile,
    resource: tile?.resource,
  };
}
