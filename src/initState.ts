import type { AppState, ChunkId, ResourceType } from "./types.ts";
import {
  addResourceToTile,
  generateChunk,
  getVisibleChunks,
} from "./chunkUtils.ts";
import { CHUNK_SIZE, getChunkId } from "./types.ts";

export interface InitializedState {
  state: AppState;
  visibleChunkIds: ChunkId[];
}

// Initial resource positions in world tile coordinates
const INITIAL_RESOURCES: Record<
  ResourceType,
  Array<{ x: number; y: number }>
> = {
  coal: [
    { x: -3, y: -3 },
    { x: -4, y: -3 },
    { x: -3, y: -4 },
    { x: -4, y: -4 },
    { x: -5, y: -4 },
    { x: -4, y: -5 },
    { x: -5, y: -5 },
  ],
  copper: [{ x: -8, y: 3 }],
  iron: [{ x: 3, y: 2 }],
  stone: [{ x: 1, y: -3 }],
};

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
    inventory: {
      coal: 0,
      copper: 0,
      iron: 0,
      stone: 0,
    },
  };

  // Generate initial 4x4 grid of chunks from -2,-2 to 1,1 (chunk coordinates)
  // This ensures a predictable starting area is always loaded
  for (let cy = -2; cy <= 1; cy++) {
    for (let cx = -2; cx <= 1; cx++) {
      // Convert chunk coordinates to chunk IDs (multiply by CHUNK_SIZE)
      const chunkId = getChunkId(cx * CHUNK_SIZE, cy * CHUNK_SIZE);
      state.chunks.set(chunkId, generateChunk(chunkId));
    }
  }

  // Calculate visible chunks and generate any that are missing (safety check)
  const visibleChunkIds = getVisibleChunks(
    state.camera.x,
    state.camera.y,
    viewportWidth,
    viewportHeight,
  );

  for (const chunkId of visibleChunkIds) {
    if (!state.chunks.has(chunkId)) {
      state.chunks.set(chunkId, generateChunk(chunkId));
    }
  }

  // Add resources to specific tiles (after all chunks are generated)
  for (const [resourceType, positions] of Object.entries(INITIAL_RESOURCES)) {
    for (const { x, y } of positions) {
      addResourceToTile(state.chunks, x, y, {
        type: resourceType as ResourceType,
        count: 100,
      });
    }
  }

  return { state, visibleChunkIds };
}
