export const CHUNK_SIZE = 32; // tiles per chunk
export const TILE_SIZE = 32; // pixels per tile

export type ChunkId = string; // format: "x,y" in tile coordinates

export interface Chunk {
  tiles: number[]; // array of hex colors (32 * 32 = 1024 colors)
}

export interface AppState {
  camera: {
    x: number;
    y: number;
  };
  chunks: Map<ChunkId, Chunk>;
}

export function getChunkId(tileX: number, tileY: number): ChunkId {
  return `${tileX},${tileY}`;
}

export function parseChunkId(id: ChunkId): { x: number; y: number } {
  const [x, y] = id.split(",").map(Number);
  return { x, y };
}

export function worldToTile(worldCoord: number): number {
  return Math.floor(worldCoord / TILE_SIZE);
}

export function tileToChunk(tileCoord: number): number {
  return Math.floor(tileCoord / CHUNK_SIZE) * CHUNK_SIZE;
}
