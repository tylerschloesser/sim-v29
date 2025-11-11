import { faPickaxe } from "@fortawesome/pro-solid-svg-icons";
import { useHighlightedTile } from "./useHighlightedTile";
import { useAppContext } from "./appContext";
import { getTileId } from "./types";
import { IconButton } from "./IconButton";

export function MineButton() {
  const { tileX, tileY, resource } = useHighlightedTile();
  const { updateState } = useAppContext();

  const isDisabled = !resource;

  const handleClick = () => {
    if (resource) {
      // Create mine action for this tile
      updateState((draft) => {
        draft.action = {
          type: "mine",
          tileId: getTileId(tileX, tileY),
          progress: 0,
        };
      });
    }
  };

  return (
    <IconButton
      faIcon={faPickaxe}
      disabled={isDisabled}
      onClick={handleClick}
    />
  );
}
