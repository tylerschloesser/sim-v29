import { Application, Graphics, Color } from "pixi.js";
import { TILE_SIZE } from "./types";
import { getHighlightedTileCoords } from "./tileUtils";

export class TileHighlight {
  private graphics: Graphics;
  private app: Application;

  constructor(app: Application) {
    this.app = app;
    this.graphics = new Graphics();

    // Draw the border once
    this.graphics.rect(0, 0, TILE_SIZE, TILE_SIZE);
    this.graphics.stroke({
      color: new Color({ r: 0, g: 0, b: 255 }), // Blue
      width: 2,
      alpha: 0.5, // Semi-transparent
    });

    this.app.stage.addChild(this.graphics);
  }

  updatePosition(cameraX: number, cameraY: number): void {
    // Calculate which tile the camera is currently on
    const { tileX, tileY } = getHighlightedTileCoords(cameraX, cameraY);

    // Calculate the world position of the tile's top-left corner
    const tileWorldX = tileX * TILE_SIZE;
    const tileWorldY = tileY * TILE_SIZE;

    // Calculate screen position
    // The camera position is at the center of the screen
    const centerX = this.app.screen.width / 2;
    const centerY = this.app.screen.height / 2;

    // Offset from camera to tile's top-left corner
    const offsetX = cameraX - tileWorldX;
    const offsetY = cameraY - tileWorldY;

    // Just move the graphics to the new position
    this.graphics.position.x = centerX - offsetX;
    this.graphics.position.y = centerY - offsetY;
  }
}
