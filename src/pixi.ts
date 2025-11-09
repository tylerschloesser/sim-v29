import { Application, Graphics } from "pixi.js";

const TILE_SIZE = 32;
const GRID_COLOR = 0x333333;
const GRID_ALPHA = 0.5;

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

  // Draw grid centered around origin (0,0) so camera (0,0) is at screen center
  const halfWidth = width / 2;
  const halfHeight = height / 2;

  // Calculate offset to center tiles (equal partial tiles on both sides)
  const offsetX = (width % TILE_SIZE) / 2;
  const offsetY = (height % TILE_SIZE) / 2;

  // Calculate how many tiles are visible (plus extra for panning)
  const tilesX = Math.ceil(width / TILE_SIZE) + 1;
  const tilesY = Math.ceil(height / TILE_SIZE) + 1;

  gridGraphics.setStrokeStyle({
    width: 1,
    color: GRID_COLOR,
    alpha: GRID_ALPHA,
  });

  // Draw vertical lines centered around origin
  for (let i = 0; i <= tilesX; i++) {
    const x = i * TILE_SIZE - halfWidth + offsetX;
    gridGraphics.moveTo(x, -halfHeight);
    gridGraphics.lineTo(x, halfHeight);
  }

  // Draw horizontal lines centered around origin
  for (let i = 0; i <= tilesY; i++) {
    const y = i * TILE_SIZE - halfHeight + offsetY;
    gridGraphics.moveTo(-halfWidth, y);
    gridGraphics.lineTo(halfWidth, y);
  }

  gridGraphics.stroke();
}

export function updateCamera(x: number, y: number) {
  if (!gridGraphics || !app) return;

  // Center the camera: (0,0) is at the center of the screen
  const centerX = app.screen.width / 2;
  const centerY = app.screen.height / 2;

  // Use modulo to create infinite scrolling effect
  gridGraphics.position.x = centerX - (x % TILE_SIZE);
  gridGraphics.position.y = centerY - (y % TILE_SIZE);
}
