import { faPickaxe } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useHighlightedTile } from "./useHighlightedTile";
import { useAppContext } from "./appContext";
import { getTileId } from "./types";

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
    <button
      className="p-4 disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={isDisabled}
      onClick={handleClick}
    >
      <FontAwesomeIcon icon={faPickaxe} />
    </button>
  );
}
