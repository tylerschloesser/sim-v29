import { Application, Container, Graphics } from "pixi.js";
import type { Chunk, ChunkId } from "./types";
import { CHUNK_SIZE, parseChunkId, RESOURCE_COLORS, TILE_SIZE } from "./types";

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

    // Pass 1: Render terrain colors for all tiles
    for (let ty = 0; ty < CHUNK_SIZE; ty++) {
      for (let tx = 0; tx < CHUNK_SIZE; tx++) {
        const tileIndex = ty * CHUNK_SIZE + tx;
        const tile = chunk.tiles[tileIndex];

        // Calculate world position for this tile
        const worldX = (chunkX + tx) * TILE_SIZE;
        const worldY = (chunkY + ty) * TILE_SIZE;

        // Draw terrain tile
        graphics.rect(worldX, worldY, TILE_SIZE, TILE_SIZE);
        graphics.fill(tile.color);
      }
    }

    // Pass 2: Render resources with checkerboard pattern
    for (let ty = 0; ty < CHUNK_SIZE; ty++) {
      for (let tx = 0; tx < CHUNK_SIZE; tx++) {
        const tileIndex = ty * CHUNK_SIZE + tx;
        const tile = chunk.tiles[tileIndex];

        if (tile.resource) {
          // Calculate world position for this tile
          const worldX = (chunkX + tx) * TILE_SIZE;
          const worldY = (chunkY + ty) * TILE_SIZE;

          // Draw checkerboard pattern for resource
          const resourceColor = RESOURCE_COLORS[tile.resource.type];
          this.drawCheckerboard(graphics, worldX, worldY, resourceColor);
        }
      }
    }

    // Rect on top left for debugging
    graphics.rect(chunkX * TILE_SIZE - 4, chunkY * TILE_SIZE - 4, 8, 8);
    graphics.fill({ color: "white" });

    this.container.addChild(graphics);
    this.renderedChunks.set(id, graphics);
  }

  /**
   * Draw a checkerboard pattern on a tile (4×4 grid of 8×8 pixel squares)
   */
  private drawCheckerboard(
    graphics: Graphics,
    tileX: number,
    tileY: number,
    color: number,
  ) {
    const squareSize = 8; // Each square is 8×8 pixels
    const gridSize = 4; // 4×4 grid of squares

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        // Standard checkerboard pattern: alternate based on row + col parity
        const isFilledSquare = (row + col) % 2 === 0;

        if (isFilledSquare) {
          const x = tileX + col * squareSize;
          const y = tileY + row * squareSize;

          graphics.rect(x, y, squareSize, squareSize);
          graphics.fill(color);
        }
      }
    }
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
