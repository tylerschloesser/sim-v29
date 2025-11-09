import type { AppState, ChunkId } from "./types.ts";
import { generateChunk, getVisibleChunks } from "./chunkUtils.ts";

export interface InitializedState {
  state: AppState;
  visibleChunkIds: ChunkId[];
}

/**
 * Initialize the app state with camera position and visible chunks
 */
export function initializeState(
  viewportWidth: number,
  viewportHeight: number,
): InitializedState {
  // Initialize app state with camera at origin
  const state: AppState = {
    camera: { x: 0, y: 0 },
    chunks: new Map(),
    action: null,
    tick: 0,
  };

  // Calculate and generate initial visible chunks
  const visibleChunkIds = getVisibleChunks(
    state.camera.x,
    state.camera.y,
    viewportWidth,
    viewportHeight,
  );

  for (const chunkId of visibleChunkIds) {
    state.chunks.set(chunkId, generateChunk(chunkId));
  }

  return { state, visibleChunkIds };
}
