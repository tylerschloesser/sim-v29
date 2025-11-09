import { Application, Graphics } from "pixi.js";
import { Grid } from "./Grid";

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

  // Create grid
  const grid = new Grid(app);

  // Create graphics object for center circle
  const circleGraphics = new Graphics();
  circleGraphics.circle(app.screen.width / 2, app.screen.height / 2, 4);
  circleGraphics.fill({ color: 0x0000ff });
  app.stage.addChild(circleGraphics);

  // Create updateCamera callback with grid in closure
  const updateCamera = (x: number, y: number) => {
    grid.updatePosition(x, y);
  };

  // Initialize camera at (0,0) - centered
  updateCamera(0, 0);

  return { app, updateCamera };
}
