import { createFileRoute } from "@tanstack/react-router";
import { useCallback } from "react";
import { useImmer, type Updater } from "use-immer";
import { TopBar } from "../TopBar";
import { BottomBar } from "../BottomBar";
import { useCamera } from "../useCamera";
import { isEqual } from "lodash-es";

export const Route = createFileRoute("/")({
  component: IndexComponent,
});

interface AppState {
  camera: {
    x: number;
    y: number;
  };
}

function useSetCamera(
  updateState: Updater<AppState>,
  updateCamera: (x: number, y: number) => void,
) {
  return useCallback(
    (updater: (state: AppState) => { x: number; y: number }) => {
      updateState((draft) => {
        const newCamera = updater(draft);
        if (!isEqual(draft.camera, newCamera)) {
          draft.camera.x = newCamera.x;
          draft.camera.y = newCamera.y;
          updateCamera(draft.camera.x, draft.camera.y);
        }
      });
    },
    [updateState, updateCamera],
  );
}

function IndexComponent() {
  const { updateCamera } = Route.useRouteContext();

  const [, updateState] = useImmer<AppState>({
    camera: { x: 0, y: 0 },
  });

  const setCamera = useSetCamera(updateState, updateCamera);

  useCamera(setCamera);

  return (
    <>
      <TopBar />
      <BottomBar />
    </>
  );
}
