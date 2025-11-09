import { Application, Graphics, Color } from "pixi.js";

export class Grid {
  private static readonly TILE_SIZE = 32;
  private static readonly GRID_COLOR = new Color({ h: 0, s: 0, l: 20 });

  private graphics: Graphics;
  private app: Application;

  constructor(app: Application) {
    this.app = app;
    this.graphics = new Graphics();
    this.app.stage.addChild(this.graphics);

    // Draw initial grid
    const width = this.app.screen.width;
    const height = this.app.screen.height;

    const tilesX = Math.ceil(width / Grid.TILE_SIZE) + 1;
    const tilesY = Math.ceil(height / Grid.TILE_SIZE) + 1;

    // Draw vertical lines
    for (let i = 0; i <= tilesX; i++) {
      const x = i * Grid.TILE_SIZE;
      this.graphics
        .moveTo(x, 0)
        .lineTo(x, tilesY * Grid.TILE_SIZE)
        .stroke({ color: Grid.GRID_COLOR, pixelLine: true });
    }

    // Draw horizontal lines
    for (let j = 0; j <= tilesY; j++) {
      const y = j * Grid.TILE_SIZE;
      this.graphics
        .moveTo(0, y)
        .lineTo(tilesX * Grid.TILE_SIZE, y)
        .stroke({ color: Grid.GRID_COLOR, pixelLine: true });
    }
  }

  updatePosition(x: number, y: number): void {
    const centerX = this.app.screen.width / 2;
    const centerY = this.app.screen.height / 2;

    this.graphics.position.x =
      this.mod(centerX - x, Grid.TILE_SIZE) - Grid.TILE_SIZE;
    this.graphics.position.y =
      this.mod(centerY - y, Grid.TILE_SIZE) - Grid.TILE_SIZE;
  }

  private mod(n: number, m: number): number {
    return ((n % m) + m) % m;
  }
}
