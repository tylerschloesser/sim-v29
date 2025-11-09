import {
  TILE_SIZE,
  CHUNK_SIZE,
  getChunkId,
  tileToChunk,
  type Tile,
  type AppState,
} from "./types";

/**
 * Calculate which tile coordinates correspond to the given camera position
 */
export function getHighlightedTileCoords(
  cameraX: number,
  cameraY: number,
): { tileX: number; tileY: number } {
  const tileX = Math.floor(cameraX / TILE_SIZE);
  const tileY = Math.floor(cameraY / TILE_SIZE);
  return { tileX, tileY };
}

/**
 * Get tile data from app state given tile coordinates
 */
export function getTileAtCoords(
  state: AppState,
  tileX: number,
  tileY: number,
): Tile | undefined {
  // Calculate chunk coordinates
  const chunkX = tileToChunk(tileX);
  const chunkY = tileToChunk(tileY);
  const chunkId = getChunkId(chunkX, chunkY);

  // Get the chunk from state
  const chunk = state.chunks.get(chunkId);
  if (!chunk) return undefined;

  // Calculate tile position within chunk
  const tileOffsetX = tileX - chunkX;
  const tileOffsetY = tileY - chunkY;
  const tileIndex = tileOffsetY * CHUNK_SIZE + tileOffsetX;

  return chunk.tiles[tileIndex];
}
