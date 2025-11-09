import { Application, Graphics, Color } from "pixi.js";

const TILE_SIZE = 32;
const GRID_COLOR = new Color({ h: 0, s: 0, l: 20 });

let app: Application | null = null;
let gridGraphics: Graphics | null = null;

export async function setupPixi(canvas: HTMLCanvasElement) {
  // Create PixiJS application
  app = new Application();

  await app.init({
    canvas,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0x000000,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  });

  // Create graphics object for grid
  gridGraphics = new Graphics();
  app.stage.addChild(gridGraphics);

  // Draw grid once
  drawGrid();

  // Initialize camera at (0,0) - centered
  updateCamera(0, 0);

  return app;
}

function drawGrid() {
  if (!gridGraphics || !app) return;

  const width = app.screen.width;
  const height = app.screen.height;

  const tilesX = Math.ceil(width / TILE_SIZE) + 1;
  const tilesY = Math.ceil(height / TILE_SIZE) + 1;

  // Draw vertical lines
  for (let i = 0; i <= tilesX; i++) {
    const x = i * TILE_SIZE;
    gridGraphics
      .moveTo(x, 0)
      .lineTo(x, tilesY * TILE_SIZE)
      .stroke({ color: GRID_COLOR, pixelLine: true });
  }

  // Draw horizontal lines
  for (let j = 0; j <= tilesY; j++) {
    const y = j * TILE_SIZE;
    gridGraphics
      .moveTo(0, y)
      .lineTo(tilesX * TILE_SIZE, y)
      .stroke({ color: GRID_COLOR, pixelLine: true });
  }
}

export function updateCamera(x: number, y: number) {
  if (!gridGraphics || !app) return;

  const centerX = app.screen.width / 2;
  const centerY = app.screen.height / 2;

  gridGraphics.position.x = centerX - mod(x, TILE_SIZE);
  gridGraphics.position.y = centerY - mod(y, TILE_SIZE);
}

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}
