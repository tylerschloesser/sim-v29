import { createNoise2D } from "simplex-noise";
import Prando from "prando";
import { invariant } from "./invariant";
import type { Chunk, ChunkId, Resource, Tile } from "./types";
import {
  CHUNK_SIZE,
  getChunkId,
  parseChunkId,
  tileToChunk,
  worldToTile,
} from "./types";
import { WORLD_SEED } from "./constants";

// Shared noise instance for consistent terrain across all chunks
const rng = new Prando(WORLD_SEED);
const noise2D = createNoise2D(() => rng.next());

export function generateChunk(id: ChunkId): Chunk {
  // Parse chunk coordinates
  const { x: chunkX, y: chunkY } = parseChunkId(id);

  const tiles: Tile[] = [];

  // Generate each tile using multi-octave simplex noise
  for (let ty = 0; ty < CHUNK_SIZE; ty++) {
    for (let tx = 0; tx < CHUNK_SIZE; tx++) {
      // Calculate world tile coordinates
      const worldTileX = chunkX + tx;
      const worldTileY = chunkY + ty;

      // Multi-octave noise generation
      let noiseValue = 0;
      let amplitude = 1.0;
      let frequency = 0.03;
      const octaves = 3;

      for (let octave = 0; octave < octaves; octave++) {
        noiseValue +=
          noise2D(worldTileX * frequency, worldTileY * frequency) * amplitude;
        amplitude *= 0.5; // Each octave contributes half as much
        frequency *= 2.0; // Each octave is twice the frequency
      }

      // Normalize the noise value (multi-octave noise can exceed [-1, 1])
      // With 3 octaves at 0.5 amplitude decay: max = 1 + 0.5 + 0.25 = 1.75
      const maxAmplitude = (1 - Math.pow(0.5, octaves)) / (1 - 0.5);
      noiseValue = noiseValue / maxAmplitude;

      // Clamp to [-1, 1] range
      noiseValue = Math.max(-1, Math.min(1, noiseValue));

      // Map from [-1, 1] to grayscale [0, 255]
      const grayValue = Math.floor(((noiseValue + 1) / 2) * 255);

      // Convert to hex color (grayscale: R=G=B)
      const color = (grayValue << 16) | (grayValue << 8) | grayValue;

      tiles.push({ color });
    }
  }

  return { tiles };
}

/**
 * Adds a resource to a tile at the specified world tile coordinates.
 * Initializes the chunk if it doesn't exist (for future-proofing).
 */
export function addResourceToTile(
  chunks: Map<ChunkId, Chunk>,
  worldTileX: number,
  worldTileY: number,
  resource: Resource,
): void {
  // Calculate which chunk contains this tile
  const chunkX = tileToChunk(worldTileX);
  const chunkY = tileToChunk(worldTileY);
  const chunkId = getChunkId(chunkX, chunkY);

  // Get or create the chunk
  const chunk = chunks.get(chunkId);
  invariant(chunk !== undefined, "Chunk should exist when adding resources");

  // Calculate tile position within chunk
  const tileXInChunk = worldTileX - chunkX;
  const tileYInChunk = worldTileY - chunkY;
  const tileIndex = tileYInChunk * CHUNK_SIZE + tileXInChunk;

  // Add resource to the tile
  chunk.tiles[tileIndex].resource = resource;
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
