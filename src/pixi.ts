import { Application, Graphics } from "pixi.js";
import { Grid } from "./Grid";
import { ChunkManager } from "./ChunkManager";
import type { Chunk, ChunkId } from "./types";

export async function setupPixi(canvas: HTMLCanvasElement) {
  // Create PixiJS application
  const app = new Application();

  await app.init({
    canvas,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0x000000,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  });

  // Create chunk manager (must be first, renders below grid)
  const chunkManager = new ChunkManager(app);

  // Create grid
  const grid = new Grid(app);

  // Create graphics object for center circle
  const circleGraphics = new Graphics();
  circleGraphics.circle(app.screen.width / 2, app.screen.height / 2, 4);
  circleGraphics.fill({ color: 0x0000ff });
  app.stage.addChild(circleGraphics);

  // Create updateCamera callback with grid and chunkManager in closure
  const updateCamera = (x: number, y: number) => {
    grid.updatePosition(x, y);
    chunkManager.updatePosition(x, y);
  };

  // Create updateChunks callback
  const updateChunks = (
    visibleChunkIds: ChunkId[],
    chunkMap: Map<ChunkId, Chunk>,
  ) => {
    chunkManager.updateChunks(visibleChunkIds, chunkMap);
  };

  // Initialize camera at (0,0) - centered
  updateCamera(0, 0);

  return { app, updateCamera, updateChunks };
}
