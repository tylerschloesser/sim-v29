import { Application, Container, Graphics } from "pixi.js";
import type { Chunk, ChunkId } from "./types";
import { CHUNK_SIZE, parseChunkId, TILE_SIZE } from "./types";

export class ChunkManager {
  private app: Application;
  private container: Container;
  private renderedChunks: Map<ChunkId, Graphics>;

  constructor(app: Application) {
    this.app = app;
    this.container = new Container();
    this.renderedChunks = new Map();

    // Add container to stage (will be below grid due to render order)
    this.app.stage.addChild(this.container);
  }

  updateChunks(visibleChunkIds: ChunkId[], chunkMap: Map<ChunkId, Chunk>) {
    const visibleSet = new Set(visibleChunkIds);

    // Destroy chunks that are no longer visible
    for (const [id, graphics] of this.renderedChunks) {
      if (!visibleSet.has(id)) {
        this.destroyChunk(id, graphics);
      }
    }

    // Render new visible chunks
    for (const id of visibleChunkIds) {
      if (!this.renderedChunks.has(id)) {
        const chunk = chunkMap.get(id);
        if (chunk) {
          this.renderChunk(id, chunk);
        }
      }
    }
  }

  private renderChunk(id: ChunkId, chunk: Chunk) {
    const graphics = new Graphics();
    const { x: chunkX, y: chunkY } = parseChunkId(id);

    // Render each tile in the chunk
    for (let ty = 0; ty < CHUNK_SIZE; ty++) {
      for (let tx = 0; tx < CHUNK_SIZE; tx++) {
        const tileIndex = ty * CHUNK_SIZE + tx;
        const color = chunk.tiles[tileIndex];

        // Calculate world position for this tile
        const worldX = (chunkX + tx) * TILE_SIZE;
        const worldY = (chunkY + ty) * TILE_SIZE;

        // Draw filled rectangle
        graphics.rect(worldX, worldY, TILE_SIZE, TILE_SIZE);
        graphics.fill(color);
      }
    }

    this.container.addChild(graphics);
    this.renderedChunks.set(id, graphics);
  }

  private destroyChunk(id: ChunkId, graphics: Graphics) {
    this.container.removeChild(graphics);
    graphics.destroy();
    this.renderedChunks.delete(id);
  }

  updatePosition(cameraX: number, cameraY: number) {
    // Center the container based on camera position
    const centerX = this.app.screen.width / 2;
    const centerY = this.app.screen.height / 2;

    this.container.position.x = centerX - cameraX;
    this.container.position.y = centerY - cameraY;
  }
}
