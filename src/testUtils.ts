/**
 * Test utilities for creating mock state and entities for unit tests.
 */

import type {
  AppState,
  BeltEntity,
  BeltTurn,
  Chunk,
  ChunkId,
  Entity,
  EntityId,
  Tile,
} from "./types";
import { CHUNK_SIZE, createEntity, getChunkId, tileToChunk } from "./types";

/**
 * Creates a mock chunk with empty tiles.
 */
export function createMockChunk(): Chunk {
  const tiles: Tile[] = [];
  for (let i = 0; i < CHUNK_SIZE * CHUNK_SIZE; i++) {
    tiles.push({
      color: 0x888888, // gray
    });
  }
  return { tiles };
}

/**
 * Creates a mock belt entity with specified properties.
 */
export function createMockBelt(
  id: EntityId,
  x: number,
  y: number,
  rotation: 0 | 90 | 180 | 270,
  turn: BeltTurn = "none",
): BeltEntity {
  const entity = createEntity(id, "belt", x, y, rotation, turn);
  if (entity.type !== "belt") {
    throw new Error("Expected belt entity");
  }
  return entity;
}

/**
 * Creates a minimal AppState for testing with empty chunks and entities.
 */
export function createMockAppState(): AppState {
  return {
    camera: { x: 0, y: 0 },
    chunks: new Map<ChunkId, Chunk>(),
    entities: new Map<EntityId, Entity>(),
    nextEntityId: 1,
    nextBeltItemId: 1,
    action: null,
    tick: 0,
    inventory: {},
  };
}

/**
 * Adds a belt entity to the state at the specified tile coordinates.
 * Automatically creates the necessary chunk if it doesn't exist.
 * Updates the tile to reference the belt entity.
 */
export function addBeltToState(state: AppState, belt: BeltEntity): AppState {
  // Add entity to state
  state.entities.set(belt.id, belt);

  // Calculate which chunk contains this tile
  const chunkX = tileToChunk(belt.position.x);
  const chunkY = tileToChunk(belt.position.y);
  const chunkId: ChunkId = getChunkId(chunkX, chunkY);

  // Create chunk if it doesn't exist
  if (!state.chunks.has(chunkId)) {
    state.chunks.set(chunkId, createMockChunk());
  }

  // Get the chunk
  const chunk = state.chunks.get(chunkId)!;

  // Calculate tile position within chunk
  const tileXInChunk = belt.position.x - chunkX;
  const tileYInChunk = belt.position.y - chunkY;
  const tileIndex = tileYInChunk * CHUNK_SIZE + tileXInChunk;

  // Update tile to reference the belt entity
  chunk.tiles[tileIndex].entityId = belt.id;

  return state;
}

/**
 * Helper to create multiple belts in a chain.
 * Creates belts at consecutive positions in a straight line.
 */
export function createBeltChain(
  startId: number,
  startX: number,
  startY: number,
  length: number,
  direction: "right" | "down" | "left" | "up",
): BeltEntity[] {
  const belts: BeltEntity[] = [];

  const rotationMap = {
    right: 0 as const,
    down: 90 as const,
    left: 180 as const,
    up: 270 as const,
  };

  const offsetMap = {
    right: { x: 1, y: 0 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    up: { x: 0, y: -1 },
  };

  const rotation = rotationMap[direction];
  const offset = offsetMap[direction];

  for (let i = 0; i < length; i++) {
    const belt = createMockBelt(
      `entity-${startId + i}`,
      startX + offset.x * i,
      startY + offset.y * i,
      rotation,
      "none",
    );
    belts.push(belt);
  }

  return belts;
}
