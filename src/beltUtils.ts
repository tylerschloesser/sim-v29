import type { AppState, BeltEntity, ChunkId } from "./types";
import { CHUNK_SIZE, getChunkId, tileToChunk } from "./types";

export interface BeltConnections {
  incomingTile: { x: number; y: number };
  outgoingTile: { x: number; y: number };
  incomingBelt: BeltEntity | null;
  outgoingBelt: BeltEntity | null;
}

/**
 * Computes incoming and outgoing tile connections for a belt based on rotation and turn.
 *
 * Incoming tile is always to the left of the belt (adjusted for rotation):
 * - 0°: left (-1, 0)
 * - 90°: top (0, -1)
 * - 180°: right (+1, 0)
 * - 270°: bottom (0, +1)
 *
 * Outgoing tile depends on turn (adjusted for rotation):
 * - turn "none": straight ahead (0°→right, 90°→down, 180°→left, 270°→up)
 * - turn "left": left turn (0°→up, 90°→right, 180°→down, 270°→left)
 * - turn "right": right turn (0°→down, 90°→left, 180°→up, 270°→right)
 */
export function getBeltConnections(
  entity: BeltEntity,
  state: AppState,
): BeltConnections {
  const { position, rotation, turn } = entity;

  // Compute incoming tile (left of belt, adjusted for rotation)
  let incomingOffset: { x: number; y: number };
  switch (rotation) {
    case 0:
      incomingOffset = { x: -1, y: 0 }; // left
      break;
    case 90:
      incomingOffset = { x: 0, y: -1 }; // top
      break;
    case 180:
      incomingOffset = { x: 1, y: 0 }; // right
      break;
    case 270:
      incomingOffset = { x: 0, y: 1 }; // bottom
      break;
  }

  // Compute outgoing tile (depends on turn, adjusted for rotation)
  let outgoingOffset: { x: number; y: number };

  if (turn === "none") {
    // Straight ahead
    switch (rotation) {
      case 0:
        outgoingOffset = { x: 1, y: 0 }; // right
        break;
      case 90:
        outgoingOffset = { x: 0, y: 1 }; // down
        break;
      case 180:
        outgoingOffset = { x: -1, y: 0 }; // left
        break;
      case 270:
        outgoingOffset = { x: 0, y: -1 }; // up
        break;
    }
  } else if (turn === "left") {
    // Left turn
    switch (rotation) {
      case 0:
        outgoingOffset = { x: 0, y: -1 }; // up
        break;
      case 90:
        outgoingOffset = { x: 1, y: 0 }; // right
        break;
      case 180:
        outgoingOffset = { x: 0, y: 1 }; // down
        break;
      case 270:
        outgoingOffset = { x: -1, y: 0 }; // left
        break;
    }
  } else {
    // turn === "right" - Right turn
    switch (rotation) {
      case 0:
        outgoingOffset = { x: 0, y: 1 }; // down
        break;
      case 90:
        outgoingOffset = { x: -1, y: 0 }; // left
        break;
      case 180:
        outgoingOffset = { x: 0, y: -1 }; // up
        break;
      case 270:
        outgoingOffset = { x: 1, y: 0 }; // right
        break;
    }
  }

  const incomingTile = {
    x: position.x + incomingOffset.x,
    y: position.y + incomingOffset.y,
  };

  const outgoingTile = {
    x: position.x + outgoingOffset.x,
    y: position.y + outgoingOffset.y,
  };

  // Check if there are belt entities at these tiles
  const incomingBelt = getBeltAtTile(incomingTile, state);
  const outgoingBelt = getBeltAtTile(outgoingTile, state);

  return {
    incomingTile,
    outgoingTile,
    incomingBelt,
    outgoingBelt,
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
