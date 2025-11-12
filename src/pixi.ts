import { Application, Graphics } from "pixi.js";
import { BeltItemManager } from "./BeltItemManager";
import { BuildManager } from "./BuildManager";
import { ChunkManager } from "./ChunkManager";
import { EntityManager } from "./EntityManager";
import { Grid } from "./Grid";
import type { PixiController } from "./PixiController";
import { ProgressBarManager } from "./ProgressBarManager";
import { TextureManager } from "./TextureManager";
import { TileHighlight } from "./TileHighlight";
import type { Build, Chunk, ChunkId, Entity, EntityId } from "./types";

export async function setupPixi(
  canvas: HTMLCanvasElement,
  textureManager: TextureManager,
) {
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

  // Initialize TextureManager after PixiJS is initialized

  // Create chunk manager (must be first, renders below grid)
  const chunkManager = new ChunkManager(app);

  // Create entity manager (renders above chunks, below grid)
  const entityManager = new EntityManager(app, textureManager);

  // Create belt item manager (renders above entities, below build preview)
  const beltItemManager = new BeltItemManager(app);

  // Create build manager (renders above entities, below grid)
  const buildManager = new BuildManager(app, textureManager);

  // Create progress bar manager (renders above entities, below grid)
  const progressBarManager = new ProgressBarManager(app);

  // Create grid
  const grid = new Grid(app);

  // Create tile highlight (renders above grid)
  const tileHighlight = new TileHighlight(app);

  // Create graphics object for center circle
  const circleGraphics = new Graphics();
  circleGraphics.circle(app.screen.width / 2, app.screen.height / 2, 4);
  circleGraphics.fill({ color: 0x0000ff });
  app.stage.addChild(circleGraphics);

  // Create updateCamera callback with grid, chunkManager, entityManager, beltItemManager, buildManager, progressBarManager, and tileHighlight in closure
  const updateCamera = (x: number, y: number) => {
    grid.updatePosition(x, y);
    chunkManager.updatePosition(x, y);
    entityManager.updatePosition(x, y);
    beltItemManager.updatePosition(x, y);
    buildManager.updatePosition(x, y);
    progressBarManager.updatePosition(x, y);
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

  // Create updateBeltItems callback
  const updateBeltItems = (entities: Map<EntityId, Entity>) => {
    beltItemManager.updateBeltItems(entities);
  };

  // Create updateBuild callback
  const updateBuild = (build: Build | null) => {
    buildManager.updateBuild(build);
  };

  // Create updateProgressBars callback
  const updateProgressBars = (entities: Map<EntityId, Entity>) => {
    progressBarManager.updateProgressBars(entities);
  };

  // Initialize camera at (0,0) - centered
  updateCamera(0, 0);

  const controller: PixiController = {
    updateCamera,
    updateChunks,
    updateEntities,
    updateBeltItems,
    updateBuild,
    updateProgressBars,
  };

  return { app, controller, textureManager };
}
