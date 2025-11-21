import { Application, Container, Sprite } from "pixi.js";
import type { TextureManager } from "./TextureManager";
import { getCenterPixelPosition, getRotatedSize } from "./entityUtils";
import type { Build } from "./types";
import { degreesToRadians } from "./types";

export class BuildManager {
  private app: Application;
  private container: Container;
  private textureManager: TextureManager;
  private sprites: Sprite[] = [];

  constructor(app: Application, textureManager: TextureManager) {
    this.app = app;
    this.container = new Container();
    this.textureManager = textureManager;

    // Add container to stage (will be above entities but below grid)
    this.app.stage.addChild(this.container);
  }

  updateBuild(build: Build | null) {
    // Clear existing build preview
    this.destroySprites();

    // If no build, we're done
    if (build?.type !== "simple") {
      return;
    }

    for (const entity of build.entities) {
      // Render new build preview
      const texture = this.textureManager.getTexture(entity);
      const sprite = this.container.addChild(new Sprite(texture));
      this.sprites.push(sprite);

      // Set anchor to center for proper rotation
      sprite.anchor.set(0.5, 0.5);

      // Calculate rotated size and center pixel position
      const rotatedSize = getRotatedSize(entity.size, entity.rotation);
      const centerPosition = getCenterPixelPosition(
        entity.position,
        rotatedSize,
      );
      sprite.x = centerPosition.x;
      sprite.y = centerPosition.y;

      // Apply rotation (convert degrees to radians)
      sprite.rotation = degreesToRadians(entity.rotation);

      // Use green tint for valid placement, red tint for invalid
      sprite.tint = build.valid ? 0x00ff00 : 0xff0000;

      // Make it semi-transparent for preview effect
      sprite.alpha = 0.5;
    }
  }

  updatePosition(cameraX: number, cameraY: number) {
    // Center the container based on camera position
    const centerX = this.app.screen.width / 2;
    const centerY = this.app.screen.height / 2;

    this.container.position.x = centerX - cameraX;
    this.container.position.y = centerY - cameraY;
  }

  destroySprites() {
    for (const sprite of this.sprites) {
      this.container.removeChild(sprite);
      sprite.destroy();
    }
    this.sprites = [];
  }

  destroy() {
    this.destroySprites();
    this.container.destroy();
  }
}
