import { faHome } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAppContext } from "./appContext";
import { useSetCamera } from "./useSetCamera";

export function HomeButton() {
  const { state } = useAppContext();
  const setCamera = useSetCamera();

  const isDisabled = state.camera.x === 0 && state.camera.x === 0;

  return (
    <button
      className="p-4 disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={isDisabled}
      onClick={() => {
        setCamera(() => ({ x: 0, y: 0 }));
      }}
    >
      <FontAwesomeIcon icon={faHome} />
    </button>
  );
}
