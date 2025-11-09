import { useImmer } from "use-immer";
import { TopBar } from "./TopBar";
import { BottomBar } from "./BottomBar";
import { useCamera } from "./useCamera";
import { isEqual } from "lodash-es";

interface AppProps {
  updateCamera: (x: number, y: number) => void;
}

export interface AppState {
  camera: {
    x: number;
    y: number;
  };
}

export function App({ updateCamera }: AppProps) {
  const [, updateState] = useImmer<AppState>({
    camera: { x: 0, y: 0 },
  });

  const setCamera = (
    updater: (state: AppState) => { x: number; y: number },
  ) => {
    updateState((draft) => {
      const newCamera = updater(draft);
      if (!isEqual(draft.camera, newCamera)) {
        draft.camera.x = newCamera.x;
        draft.camera.y = newCamera.y;
        updateCamera(draft.camera.x, draft.camera.y);
      }
    });
  };

  useCamera(setCamera);

  return (
    <>
      <TopBar />
      <BottomBar />
    </>
  );
}
