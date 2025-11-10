import { Application, Container, Graphics } from "pixi.js";
import type { Build } from "./types";
import { TILE_SIZE } from "./types";

export class BuildManager {
  private app: Application;
  private container: Container;
  private buildGraphics: Graphics | null = null;

  constructor(app: Application) {
    this.app = app;
    this.container = new Container();

    // Add container to stage (will be above entities but below grid)
    this.app.stage.addChild(this.container);
  }

  updateBuild(build: Build | null) {
    // Clear existing build preview
    if (this.buildGraphics) {
      this.container.removeChild(this.buildGraphics);
      this.buildGraphics.destroy();
      this.buildGraphics = null;
    }

    // If no build, we're done
    if (!build) {
      return;
    }

    // Render new build preview
    this.buildGraphics = new Graphics();
    this.drawBuildPreview(this.buildGraphics, build);
    this.container.addChild(this.buildGraphics);
  }

  private drawBuildPreview(graphics: Graphics, build: Build) {
    const { entity, valid } = build;
    const worldX = entity.position.x * TILE_SIZE;
    const worldY = entity.position.y * TILE_SIZE;
    const width = entity.size.x * TILE_SIZE;
    const height = entity.size.y * TILE_SIZE;

    // Use green for valid placement, red for invalid
    const tintColor = valid ? 0x00ff00 : 0xff0000;

    // Draw filled rectangle with transparency (more transparent than real entities)
    graphics.rect(worldX, worldY, width, height);
    graphics.fill({ color: tintColor, alpha: 0.5 });

    // Draw border
    graphics.rect(worldX, worldY, width, height);
    graphics.stroke({ color: 0x000000, width: 2 });
  }

  updatePosition(cameraX: number, cameraY: number) {
    // Center the container based on camera position
    const centerX = this.app.screen.width / 2;
    const centerY = this.app.screen.height / 2;

    this.container.position.x = centerX - cameraX;
    this.container.position.y = centerY - cameraY;
  }

  destroy() {
    if (this.buildGraphics) {
      this.buildGraphics.destroy();
      this.buildGraphics = null;
    }
    this.container.destroy();
  }
}
