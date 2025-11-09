import { createFileRoute } from "@tanstack/react-router";
import { useImmer } from "use-immer";
import { TopBar } from "../TopBar";
import { BottomBar } from "../BottomBar";
import { useCamera } from "../useCamera";
import { useSetCamera } from "../useSetCamera";
import type { AppState } from "../types";

export const Route = createFileRoute("/")({
  component: IndexComponent,
});

function IndexComponent() {
  const { initialState, updateCamera, updateChunks } = Route.useRouteContext();

  const [, updateState] = useImmer<AppState>(initialState);

  const setCamera = useSetCamera(updateState, updateCamera, updateChunks);

  useCamera(setCamera);

  return (
    <>
      <TopBar />
      <BottomBar />
    </>
  );
}
