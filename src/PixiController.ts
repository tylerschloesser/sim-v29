import type { Build, Chunk, ChunkId, Entity, EntityId } from "./types";

export interface PixiController {
  updateCamera: (x: number, y: number) => void;
  updateChunks: (
    visibleChunkIds: ChunkId[],
    chunkMap: Map<ChunkId, Chunk>,
  ) => void;
  updateEntities: (entities: Map<EntityId, Entity>) => void;
  updateBeltItems: (entities: Map<EntityId, Entity>) => void;
  updateBuild: (build: Build | null) => void;
  updateProgressBars: (entities: Map<EntityId, Entity>) => void;
}
