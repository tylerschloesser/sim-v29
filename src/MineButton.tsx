import { faPickaxe } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useHighlightedTile } from "./useHighlightedTile";

export function MineButton() {
  const { resource } = useHighlightedTile();

  const isDisabled = !resource;

  const handleClick = () => {
    if (resource) {
      alert(`Resource: ${resource.type}\nCount: ${resource.count}`);
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
