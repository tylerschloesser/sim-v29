import type { Chunk, ChunkId } from "./types";
import { CHUNK_SIZE, getChunkId, tileToChunk, worldToTile } from "./types";

export function generateChunk(): Chunk {
  const tiles: number[] = [];
  for (let i = 0; i < CHUNK_SIZE * CHUNK_SIZE; i++) {
    // Generate random hex color (0x000000 to 0xFFFFFF)
    const color = Math.floor(Math.random() * 0xffffff);
    tiles.push(color);
  }
  return { tiles };
}

export function getVisibleChunks(
  cameraX: number,
  cameraY: number,
  viewportWidth: number,
  viewportHeight: number,
  buffer = 1, // chunks to load beyond visible area
): ChunkId[] {
  // Camera is centered, so calculate viewport bounds in world space
  const halfWidth = viewportWidth / 2;
  const halfHeight = viewportHeight / 2;

  const worldLeft = cameraX - halfWidth;
  const worldRight = cameraX + halfWidth;
  const worldTop = cameraY - halfHeight;
  const worldBottom = cameraY + halfHeight;

  // Convert to tile coordinates
  const tileLeft = worldToTile(worldLeft);
  const tileRight = worldToTile(worldRight);
  const tileTop = worldToTile(worldTop);
  const tileBottom = worldToTile(worldBottom);

  // Convert to chunk coordinates (aligned to CHUNK_SIZE)
  const chunkLeft = tileToChunk(tileLeft) - CHUNK_SIZE * buffer;
  const chunkRight = tileToChunk(tileRight) + CHUNK_SIZE * buffer;
  const chunkTop = tileToChunk(tileTop) - CHUNK_SIZE * buffer;
  const chunkBottom = tileToChunk(tileBottom) + CHUNK_SIZE * buffer;

  // Generate list of visible chunk IDs
  const visibleChunks: ChunkId[] = [];
  for (let cy = chunkTop; cy <= chunkBottom; cy += CHUNK_SIZE) {
    for (let cx = chunkLeft; cx <= chunkRight; cx += CHUNK_SIZE) {
      visibleChunks.push(getChunkId(cx, cy));
    }
  }

  return visibleChunks;
}
