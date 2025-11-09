import { Application, Graphics } from "pixi.js";
import { Grid } from "./Grid";

let app: Application | null = null;
let grid: Grid | null = null;
let circleGraphics: Graphics | null = null;

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

  // Create and draw grid
  grid = new Grid(app);
  grid.draw();

  // Create graphics object for center circle
  circleGraphics = new Graphics();
  circleGraphics.circle(app.screen.width / 2, app.screen.height / 2, 4);
  circleGraphics.fill({ color: 0x0000ff });
  app.stage.addChild(circleGraphics);

  // Initialize camera at (0,0) - centered
  updateCamera(0, 0);

  return app;
}

export function updateCamera(x: number, y: number) {
  if (!grid) return;

  grid.updatePosition(x, y);
}
