import type { AppState, BeltEntity, ChunkId } from "./types";
import { CHUNK_SIZE, getChunkId, tileToChunk } from "./types";

export interface AdjacentTile {
  tile: { x: number; y: number };
  belt: BeltEntity | null;
}

export interface AdjacentBelts {
  top: AdjacentTile;
  right: AdjacentTile;
  bottom: AdjacentTile;
  left: AdjacentTile;
}

/**
 * Gets all 4 adjacent tiles and their belt entities for a given belt.
 *
 * Returns tiles in clockwise order starting from top:
 * - top: (x, y - 1)
 * - right: (x + 1, y)
 * - bottom: (x, y + 1)
 * - left: (x - 1, y)
 */
export function getAdjacentBelts(
  entity: BeltEntity,
  state: AppState,
): AdjacentBelts {
  const { position } = entity;

  // Define all 4 adjacent tiles (top, right, bottom, left)
  const topTile = { x: position.x, y: position.y - 1 };
  const rightTile = { x: position.x + 1, y: position.y };
  const bottomTile = { x: position.x, y: position.y + 1 };
  const leftTile = { x: position.x - 1, y: position.y };

  // Get belt entities at each adjacent tile
  const topBelt = getBeltAtTile(topTile, state);
  const rightBelt = getBeltAtTile(rightTile, state);
  const bottomBelt = getBeltAtTile(bottomTile, state);
  const leftBelt = getBeltAtTile(leftTile, state);

  return {
    top: { tile: topTile, belt: topBelt },
    right: { tile: rightTile, belt: rightBelt },
    bottom: { tile: bottomTile, belt: bottomBelt },
    left: { tile: leftTile, belt: leftBelt },
  };
}

/**
 * Helper function to get a belt entity at a specific tile position, or null if none exists.
 */
function getBeltAtTile(
  tile: { x: number; y: number },
  state: AppState,
): BeltEntity | null {
  // Calculate which chunk contains this tile
  const chunkX = tileToChunk(tile.x);
  const chunkY = tileToChunk(tile.y);
  const chunkId: ChunkId = getChunkId(chunkX, chunkY);

  const chunk = state.chunks.get(chunkId);

  if (!chunk) {
    return null;
  }

  // Calculate tile position within chunk
  const tileXInChunk = tile.x - chunkX;
  const tileYInChunk = tile.y - chunkY;
  const tileIndex = tileYInChunk * CHUNK_SIZE + tileXInChunk;

  // Get the tile
  const tileData = chunk.tiles[tileIndex];

  if (!tileData || !tileData.entityId) {
    return null;
  }

  // Get the entity
  const entity = state.entities.get(tileData.entityId);

  // Return the entity if it's a belt, otherwise null
  if (entity && entity.type === "belt") {
    return entity;
  }

  return null;
}
