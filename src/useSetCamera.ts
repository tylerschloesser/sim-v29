import { useCallback } from "react";
import { isEqual } from "lodash-es";
import type { AppState } from "./types";
import { generateChunk, getVisibleChunks } from "./chunkUtils";
import { useAppContext } from "./appContext";

export function useSetCamera() {
  const { updateState, pixiController } = useAppContext();

  return useCallback(
    (updater: (state: AppState) => { x: number; y: number }) => {
      updateState((draft) => {
        const newCamera = updater(draft);
        if (!isEqual(draft.camera, newCamera)) {
          draft.camera.x = newCamera.x;
          draft.camera.y = newCamera.y;
          pixiController.updateCamera(draft.camera.x, draft.camera.y);

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
              draft.chunks.set(chunkId, generateChunk(chunkId));
            }
          }

          // Update PixiJS with visible chunks
          pixiController.updateChunks(visibleChunkIds, draft.chunks);
        }
      });
    },
    [updateState, pixiController],
  );
}
