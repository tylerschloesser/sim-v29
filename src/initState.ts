import { invariant } from "./invariant";
import {
  addResourceToTile,
  generateChunk,
  getVisibleChunks,
} from "./chunkUtils.ts";
import { placeEntity } from "./entityUtils.ts";
import type { AppState, ChunkId, Entity, ResourceType } from "./types.ts";
import { CHUNK_SIZE, createEntity, getChunkId, getEntityId } from "./types.ts";

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
  copper: [
    { x: -8, y: 5 },
    { x: -8, y: 6 },
  ],
  iron: [
    { x: 8, y: 6 },
    { x: 9, y: 6 },
    { x: 9, y: 7 },
    { x: 10, y: 7 },
  ],
  stone: [
    { x: 3, y: -6 },
    { x: 4, y: -6 },
    { x: 5, y: -6 },
    { x: 4, y: -7 },
    { x: 5, y: -7 },
  ],
};

const INITIAL_ENTITIES: Array<Entity> = [
  createEntity("", "home-storage", -1, -1),
  createEntity("", "test-belt-input", -3, 2),
  createEntity("", "belt", -2, 2, 0, "none"),
  createEntity("", "belt", -1, 2, 0, "none"),
  createEntity("", "belt", 0, 2, 0, "right"),
  createEntity("", "belt", 0, 3, 90, "left"),
  createEntity("", "test-belt-output", 1, 3),
  createEntity("", "test-belt-input", -3, 5),
  createEntity("", "belt", -2, 5, 0, "none"),
  createEntity("", "belt", -1, 5, 0, "right"),
];

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
    entities: new Map(),
    nextEntityId: 1,
    nextBeltItemId: 1,
    action: null,
    tick: 0,
    inventory: {
      coal: 10,
      "stone-furnace": 1,
      "burner-inserter": 2,
      "burner-mining-drill": 2,
      belt: 20,
      "test-belt-input": 10,
      "test-belt-output": 10,
    },
  };

  // Generate initial 4x4 grid of chunks from -2,-2 to 1,1 (chunk coordinates)
  // This ensures a predictable starting area is always loaded
  const chunkIdsToGenerate = new Set<ChunkId>();
  for (let cy = -2; cy <= 1; cy++) {
    for (let cx = -2; cx <= 1; cx++) {
      // Convert chunk coordinates to chunk IDs (multiply by CHUNK_SIZE)
      const chunkId = getChunkId(cx * CHUNK_SIZE, cy * CHUNK_SIZE);
      chunkIdsToGenerate.add(chunkId);
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
    chunkIdsToGenerate.add(chunkId);
  }

  for (const chunkId of chunkIdsToGenerate) {
    state.chunks.set(chunkId, generateChunk(chunkId));
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

  for (const entity of INITIAL_ENTITIES) {
    invariant(
      entity.id === "",
      "Initial entities should not have predefined IDs",
    );
    const entityId = getEntityId(state.nextEntityId++);
    const entityWithId = { ...entity, id: entityId };
    placeEntity(state, entityWithId);
  }

  return { state, visibleChunkIds };
}
