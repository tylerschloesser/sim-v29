import { Application, Container, Sprite } from "pixi.js";
import type { Build } from "./types";
import { degreesToRadians } from "./types";
import type { TextureManager } from "./TextureManager";
import { getCenterPixelPosition, getRotatedSize } from "./entityUtils";

export class BuildManager {
  private app: Application;
  private container: Container;
  private buildSprite: Sprite | null = null;
  private textureManager: TextureManager;

  constructor(app: Application, textureManager: TextureManager) {
    this.app = app;
    this.container = new Container();
    this.textureManager = textureManager;

    // Add container to stage (will be above entities but below grid)
    this.app.stage.addChild(this.container);
  }

  updateBuild(build: Build | null) {
    // Clear existing build preview
    if (this.buildSprite) {
      this.container.removeChild(this.buildSprite);
      this.buildSprite.destroy();
      this.buildSprite = null;
    }

    // If no build, we're done
    if (!build) {
      return;
    }

    // Render new build preview
    const texture = this.textureManager.getTexture(build.entity);
    this.buildSprite = new Sprite(texture);

    // Set anchor to center for proper rotation
    this.buildSprite.anchor.set(0.5, 0.5);

    // Calculate rotated size and center pixel position
    const rotatedSize = getRotatedSize(
      build.entity.size,
      build.entity.rotation,
    );
    const centerPosition = getCenterPixelPosition(
      build.entity.position,
      rotatedSize,
    );
    this.buildSprite.x = centerPosition.x;
    this.buildSprite.y = centerPosition.y;

    // Apply rotation (convert degrees to radians)
    this.buildSprite.rotation = degreesToRadians(build.entity.rotation);

    // Use green tint for valid placement, red tint for invalid
    this.buildSprite.tint = build.valid ? 0x00ff00 : 0xff0000;

    // Make it semi-transparent for preview effect
    this.buildSprite.alpha = 0.5;

    this.container.addChild(this.buildSprite);
  }

  updatePosition(cameraX: number, cameraY: number) {
    // Center the container based on camera position
    const centerX = this.app.screen.width / 2;
    const centerY = this.app.screen.height / 2;

    this.container.position.x = centerX - cameraX;
    this.container.position.y = centerY - cameraY;
  }

  destroy() {
    if (this.buildSprite) {
      this.buildSprite.destroy();
      this.buildSprite = null;
    }
    this.container.destroy();
  }
}
