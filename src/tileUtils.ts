import {
  TILE_SIZE,
  CHUNK_SIZE,
  getChunkId,
  tileToChunk,
  parseTileId,
  type Tile,
  type TileId,
  type ChunkId,
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

/**
 * Get the location information (chunkId and tileIndex) for a tile by its TileId.
 * Useful for accessing/mutating tiles in Immer drafts.
 */
export function getTileLocation(tileId: TileId): {
  chunkId: ChunkId;
  tileIndex: number;
} {
  // Parse tile coordinates
  const { x: tileX, y: tileY } = parseTileId(tileId);

  // Calculate chunk coordinates
  const chunkX = tileToChunk(tileX);
  const chunkY = tileToChunk(tileY);
  const chunkId = getChunkId(chunkX, chunkY);

  // Calculate tile position within chunk
  const tileOffsetX = tileX - chunkX;
  const tileOffsetY = tileY - chunkY;
  const tileIndex = tileOffsetY * CHUNK_SIZE + tileOffsetX;

  return { chunkId, tileIndex };
}

/**
 * Get tile data from app state given a TileId
 */
export function getTileById(state: AppState, tileId: TileId): Tile | undefined {
  const { chunkId, tileIndex } = getTileLocation(tileId);
  const chunk = state.chunks.get(chunkId);
  return chunk?.tiles[tileIndex];
}
