import { faHome } from "@fortawesome/pro-solid-svg-icons";
import { useAppContext } from "./appContext";
import { useSetCamera } from "./useSetCamera";
import { IconButton } from "./IconButton";

export function HomeButton() {
  const { state } = useAppContext();
  const setCamera = useSetCamera();

  const isDisabled = state.camera.x === 0 && state.camera.x === 0;

  return (
    <IconButton
      faIcon={faHome}
      disabled={isDisabled}
      onClick={() => {
        setCamera(() => ({ x: 0, y: 0 }));
      }}
    />
  );
}
