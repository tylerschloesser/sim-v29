import { useCallback } from "react";
import { useImmer, type Updater } from "use-immer";
import { TopBar } from "./TopBar";
import { BottomBar } from "./BottomBar";
import { useCamera } from "./useCamera";
import { isEqual } from "lodash-es";
import type { Chunk, ChunkId } from "./types";
import { generateChunk, getVisibleChunks } from "./chunkUtils";

interface AppProps {
  initialState: AppState;
  updateCamera: (x: number, y: number) => void;
  updateChunks: (
    visibleChunkIds: ChunkId[],
    chunkMap: Map<ChunkId, Chunk>,
  ) => void;
}

export interface AppState {
  camera: {
    x: number;
    y: number;
  };
  chunks: Map<ChunkId, Chunk>;
}

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

export function App({ initialState, updateCamera, updateChunks }: AppProps) {
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
