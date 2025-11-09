import { createFileRoute } from "@tanstack/react-router";
import { useCallback } from "react";
import { useImmer, type Updater } from "use-immer";
import { TopBar } from "../TopBar";
import { BottomBar } from "../BottomBar";
import { useCamera } from "../useCamera";
import { isEqual } from "lodash-es";
import type { AppState } from "../App";
import type { Chunk, ChunkId } from "../types";
import { generateChunk, getVisibleChunks } from "../chunkUtils";

export const Route = createFileRoute("/")({
  component: IndexComponent,
});

function useSetCamera(
  updateState: Updater<AppState>,
  updateCamera: (x: number, y: number) => void,
  updateChunks: (
    visibleChunkIds: ChunkId[],
    chunkMap: Map<ChunkId, Chunk>,
  ) => void,
) {
  return useCallback(
    (updater: (state: AppState) => { x: number; y: number }) => {
      updateState((draft) => {
        const newCamera = updater(draft);
        if (!isEqual(draft.camera, newCamera)) {
          draft.camera.x = newCamera.x;
          draft.camera.y = newCamera.y;
          updateCamera(draft.camera.x, draft.camera.y);

          // Calculate visible chunks based on camera position and viewport
          const visibleChunkIds = getVisibleChunks(
            draft.camera.x,
            draft.camera.y,
            window.innerWidth,
            window.innerHeight,
          );

          // Generate any missing chunks
          for (const chunkId of visibleChunkIds) {
            if (!draft.chunks.has(chunkId)) {
              draft.chunks.set(chunkId, generateChunk());
            }
          }

          // Update PixiJS with visible chunks
          updateChunks(visibleChunkIds, draft.chunks);
        }
      });
    },
    [updateState, updateCamera, updateChunks],
  );
}

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
