import { Application, Graphics } from "pixi.js";
import { Grid } from "./Grid";
import { ChunkManager } from "./ChunkManager";
import { EntityManager } from "./EntityManager";
import { TileHighlight } from "./TileHighlight";
import type { Chunk, ChunkId, Entity, EntityId } from "./types";
import type { PixiController } from "./PixiController";

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

  // Create entity manager (renders above chunks, below grid)
  const entityManager = new EntityManager(app);

  // Create grid
  const grid = new Grid(app);

  // Create tile highlight (renders above grid)
  const tileHighlight = new TileHighlight(app);

  // Create graphics object for center circle
  const circleGraphics = new Graphics();
  circleGraphics.circle(app.screen.width / 2, app.screen.height / 2, 4);
  circleGraphics.fill({ color: 0x0000ff });
  app.stage.addChild(circleGraphics);

  // Create updateCamera callback with grid, chunkManager, entityManager, and tileHighlight in closure
  const updateCamera = (x: number, y: number) => {
    grid.updatePosition(x, y);
    chunkManager.updatePosition(x, y);
    entityManager.updatePosition(x, y);
    tileHighlight.updatePosition(x, y);
  };

  // Create updateChunks callback
  const updateChunks = (
    visibleChunkIds: ChunkId[],
    chunkMap: Map<ChunkId, Chunk>,
  ) => {
    chunkManager.updateChunks(visibleChunkIds, chunkMap);
  };

  // Create updateEntities callback
  const updateEntities = (entities: Map<EntityId, Entity>) => {
    entityManager.updateEntities(entities);
  };

  // Initialize camera at (0,0) - centered
  updateCamera(0, 0);

  const controller: PixiController = {
    updateCamera,
    updateChunks,
    updateEntities,
  };

  return { app, controller };
}
