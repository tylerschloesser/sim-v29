import { Application, Container, Graphics } from "pixi.js";
import type {
  BeltEntity,
  BeltItem,
  BeltItemId,
  Entity,
  EntityId,
} from "./types";
import { TILE_SIZE } from "./types";
import { BELT_LENGTH } from "./constants";

/**
 * Manages rendering of items on belts.
 * Items are tracked by stable IDs and rendered as colored circles.
 */
export class BeltItemManager {
  private app: Application;
  private container: Container;
  private renderedItems: Map<BeltItemId, Graphics>;

  constructor(app: Application) {
    this.app = app;
    this.container = new Container();
    this.renderedItems = new Map();

    // Add container to stage (will be above entities but below build preview)
    this.app.stage.addChild(this.container);
  }

  updateBeltItems(entities: Map<EntityId, Entity>) {
    // Collect all current belt items from all belt entities
    const currentItems = new Map<
      BeltItemId,
      { item: BeltItem; belt: BeltEntity; lane: "left" | "right" }
    >();

    for (const entity of entities.values()) {
      if (entity.type === "belt") {
        // Process left lane
        for (const item of entity.leftLane) {
          currentItems.set(item.id, { item, belt: entity, lane: "left" });
        }

        // Process right lane
        for (const item of entity.rightLane) {
          currentItems.set(item.id, { item, belt: entity, lane: "right" });
        }
      }
    }

    // Remove items that no longer exist
    for (const [id, graphic] of this.renderedItems) {
      if (!currentItems.has(id)) {
        this.destroyItem(id, graphic);
      }
    }

    // Render new or update existing items
    for (const [id, { item, belt, lane }] of currentItems) {
      if (this.renderedItems.has(id)) {
        // Update existing item position
        const graphic = this.renderedItems.get(id)!;
        this.updateItemPosition(graphic, item, belt, lane);
      } else {
        // Render new item
        this.renderItem(id, item, belt, lane);
      }
    }
  }

  private renderItem(
    id: BeltItemId,
    item: BeltItem,
    belt: BeltEntity,
    lane: "left" | "right",
  ) {
    // Create a simple colored square for the item with black border
    const graphic = new Graphics();
    graphic.rect(-4, -4, 8, 8); // 8x8 square centered at (0, 0)
    graphic.fill({ color: this.getItemColor(item.itemType), alpha: 1 });
    graphic.stroke({ color: 0x000000, width: 1 }); // Black 1px border

    // Calculate and set position
    this.updateItemPosition(graphic, item, belt, lane);

    this.container.addChild(graphic);
    this.renderedItems.set(id, graphic);
  }

  private updateItemPosition(
    graphic: Graphics,
    item: BeltItem,
    belt: BeltEntity,
    lane: "left" | "right",
  ) {
    // Get belt's world position in pixels (top-left corner of belt tile)
    const beltPixelX = belt.position.x * TILE_SIZE;
    const beltPixelY = belt.position.y * TILE_SIZE;

    // Calculate item position along belt
    // Item position ranges from 0 to BELT_LENGTH (64)
    // Belt tile is TILE_SIZE (32) pixels
    // So we need to scale: position / BELT_LENGTH * TILE_SIZE
    const progress = item.position / BELT_LENGTH; // 0 to 1
    const offset = progress * TILE_SIZE; // 0 to 32 pixels

    // Calculate final position based on belt rotation and lane
    // Left lane items are on the left side (relative to direction of travel)
    // Right lane items are on the right side (relative to direction of travel)
    let itemX: number;
    let itemY: number;

    switch (belt.rotation) {
      case 0: // Facing right
        itemX = beltPixelX + offset;
        itemY =
          lane === "left"
            ? beltPixelY + TILE_SIZE / 4 // Left lane: top (north) side
            : beltPixelY + (TILE_SIZE * 3) / 4; // Right lane: bottom (south) side
        break;
      case 90: // Facing down
        itemX =
          lane === "left"
            ? beltPixelX + (TILE_SIZE * 3) / 4 // Left lane: right (east) side
            : beltPixelX + TILE_SIZE / 4; // Right lane: left (west) side
        itemY = beltPixelY + offset;
        break;
      case 180: // Facing left
        itemX = beltPixelX + TILE_SIZE - offset; // Reverse direction
        itemY =
          lane === "left"
            ? beltPixelY + (TILE_SIZE * 3) / 4 // Left lane: bottom (south) side
            : beltPixelY + TILE_SIZE / 4; // Right lane: top (north) side
        break;
      case 270: // Facing up
        itemX =
          lane === "left"
            ? beltPixelX + TILE_SIZE / 4 // Left lane: left (west) side
            : beltPixelX + (TILE_SIZE * 3) / 4; // Right lane: right (east) side
        itemY = beltPixelY + TILE_SIZE - offset; // Reverse direction
        break;
      default:
        itemX = beltPixelX;
        itemY = beltPixelY;
    }

    graphic.x = itemX;
    graphic.y = itemY;
  }

  private getItemColor(itemType: string): number {
    // Simple color mapping for different item types
    // TODO: Use proper textures/sprites for items
    const colors: Record<string, number> = {
      coal: 0x000000, // black
      copper: 0xff6600, // orange
      iron: 0x4682b4, // steel blue
      stone: 0xff69b4, // hot pink
      "iron-plate": 0xaaaaaa, // light gray
      // Default colors for entity types
      "stone-furnace": 0xff4444,
      "home-storage": 0x4444ff,
      "burner-inserter": 0xffaa66,
      "burner-mining-drill": 0xffaa00,
      belt: 0xffff00,
    };

    return colors[itemType] ?? 0xffffff; // white default
  }

  private destroyItem(id: BeltItemId, graphic: Graphics) {
    this.container.removeChild(graphic);
    graphic.destroy();
    this.renderedItems.delete(id);
  }

  updatePosition(cameraX: number, cameraY: number) {
    // Center the container based on camera position
    const centerX = this.app.screen.width / 2;
    const centerY = this.app.screen.height / 2;

    this.container.position.x = centerX - cameraX;
    this.container.position.y = centerY - cameraY;
  }

  destroy() {
    for (const graphic of this.renderedItems.values()) {
      graphic.destroy();
    }
    this.renderedItems.clear();
    this.container.destroy();
  }
}
