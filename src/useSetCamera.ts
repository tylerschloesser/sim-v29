import { useCallback } from "react";
import { isEqual } from "lodash-es";
import type { Updater } from "use-immer";
import type { AppState, Chunk, ChunkId } from "./types";
import { generateChunk, getVisibleChunks } from "./chunkUtils";

export function useSetCamera(
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
              draft.chunks.set(chunkId, generateChunk(chunkId));
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
