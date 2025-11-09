export const CHUNK_SIZE = 32; // tiles per chunk
export const TILE_SIZE = 32; // pixels per tile

export type ChunkId = string; // format: "x,y" in tile coordinates
export type TileId = string; // format: "x,y" in global tile coordinates
export type EntityId = string; // format: "entity-N" where N is sequential number

export type ResourceType = "coal" | "copper" | "iron" | "stone";

export interface Resource {
  type: ResourceType;
  count: number;
}

export type EntityType = "stone-furnace" | "home-storage";

export interface BaseEntity {
  id: EntityId;
  position: { x: number; y: number }; // top-left tile coordinates
  size: { x: number; y: number }; // size in tiles
}

export interface StoneFurnaceEntity extends BaseEntity {
  type: "stone-furnace";
}

export interface HomeStorageEntity extends BaseEntity {
  type: "home-storage";
}

export type Entity = StoneFurnaceEntity | HomeStorageEntity;

export interface Tile {
  color: number; // hex color
  resource?: Resource;
  entityId?: EntityId;
}

export interface Chunk {
  tiles: Tile[]; // array of tiles (32 * 32 = 1024 tiles)
}

// Resource color constants (vibrant game colors)
export const RESOURCE_COLORS: Record<ResourceType, number> = {
  coal: 0x000000, // black
  copper: 0xff6600, // bright orange
  iron: 0x4682b4, // steel blue
  stone: 0xff69b4, // hot pink
};

export interface MineAction {
  type: "mine";
  tileId: TileId;
  progress: number; // 0 to 1
}

export type Action = MineAction;

export interface AppState {
  camera: {
    x: number;
    y: number;
  };
  chunks: Map<ChunkId, Chunk>;
  entities: Map<EntityId, Entity>;
  nextEntityId: number;
  action: Action | null;
  tick: number;
  inventory: Record<ResourceType, number>;
}

export function getChunkId(tileX: number, tileY: number): ChunkId {
  return `${tileX},${tileY}`;
}

export function parseChunkId(id: ChunkId): { x: number; y: number } {
  const [x, y] = id.split(",").map(Number);
  return { x, y };
}

export function getTileId(tileX: number, tileY: number): TileId {
  return `${tileX},${tileY}`;
}

export function parseTileId(id: TileId): { x: number; y: number } {
  const [x, y] = id.split(",").map(Number);
  return { x, y };
}

export function worldToTile(worldCoord: number): number {
  return Math.floor(worldCoord / TILE_SIZE);
}

export function tileToChunk(tileCoord: number): number {
  return Math.floor(tileCoord / CHUNK_SIZE) * CHUNK_SIZE;
}

export function getEntityId(entityNumber: number): EntityId {
  return `entity-${entityNumber}`;
}

export function createEntity(
  id: EntityId,
  type: EntityType,
  x: number,
  y: number,
): Entity {
  const size = { x: 2, y: 2 }; // both entity types are 2x2
  const position = { x, y };

  if (type === "stone-furnace") {
    return { id, type, position, size };
  } else {
    return { id, type, position, size };
  }
}
