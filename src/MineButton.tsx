import { faPickaxe } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export function MineButton() {
  return (
    <button className="p-4">
      <FontAwesomeIcon icon={faPickaxe} />
    </button>
  );
}
