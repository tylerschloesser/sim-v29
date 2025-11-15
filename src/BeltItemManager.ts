import { Application, Container, Graphics } from "pixi.js";
import type {
  BeltEntity,
  BeltItem,
  BeltItemId,
  Entity,
  EntityId,
} from "./types";
import { ENTITY_CONFIGS, TILE_SIZE } from "./types";
import { getBeltLength } from "./constants";
import { hslToPixi } from "./colorUtils";

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
    const progress = item.position / getBeltLength(belt.turn, lane); // 0 to 1

    let itemX: number;
    let itemY: number;

    if (belt.turn === "none") {
      // Straight belts: linear rendering from 0 to 32 pixels
      const offset = progress * TILE_SIZE;

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
    } else {
      // Turning belts: two-phase rendering
      // Determine if this lane is the outer (longer) or inner (shorter) lane
      // Right turn: left lane = outer (96), right lane = inner (32)
      // Left turn: right lane = outer (96), left lane = inner (32)
      const isOuterLane =
        (belt.turn === "right" && lane === "left") ||
        (belt.turn === "left" && lane === "right");

      // Calculate the output rotation based on turn direction
      let outputRotation = belt.rotation;
      if (belt.turn === "left") {
        outputRotation = ((belt.rotation - 90 + 360) % 360) as
          | 0
          | 90
          | 180
          | 270;
      } else if (belt.turn === "right") {
        outputRotation = ((belt.rotation + 90) % 360) as 0 | 90 | 180 | 270;
      }

      // Lane stays the same when transitioning to outgoing direction
      const outgoingLane = lane;

      if (progress < 0.5) {
        // Phase 1: Render on incoming direction
        let offset: number;
        if (isOuterLane) {
          // Outer lane: 0-24px for progress 0-0.5
          offset = progress * 48; // Maps 0-0.5 to 0-24
        } else {
          // Inner lane: 0-8px for progress 0-0.5
          offset = progress * 16; // Maps 0-0.5 to 0-8
        }

        // Use incoming rotation
        switch (belt.rotation) {
          case 0: // Facing right
            itemX = beltPixelX + offset;
            itemY =
              lane === "left"
                ? beltPixelY + TILE_SIZE / 4
                : beltPixelY + (TILE_SIZE * 3) / 4;
            break;
          case 90: // Facing down
            itemX =
              lane === "left"
                ? beltPixelX + (TILE_SIZE * 3) / 4
                : beltPixelX + TILE_SIZE / 4;
            itemY = beltPixelY + offset;
            break;
          case 180: // Facing left
            itemX = beltPixelX + TILE_SIZE - offset;
            itemY =
              lane === "left"
                ? beltPixelY + (TILE_SIZE * 3) / 4
                : beltPixelY + TILE_SIZE / 4;
            break;
          case 270: // Facing up
            itemX =
              lane === "left"
                ? beltPixelX + TILE_SIZE / 4
                : beltPixelX + (TILE_SIZE * 3) / 4;
            itemY = beltPixelY + TILE_SIZE - offset;
            break;
          default:
            itemX = beltPixelX;
            itemY = beltPixelY;
        }
      } else {
        // Phase 2: Render on outgoing direction
        let offset: number;
        if (isOuterLane) {
          // Outer lane: 8-32px for progress 0.5-1.0 (0.25-1.0 of tile)
          offset = 8 + (progress - 0.5) * 48; // Maps 0.5-1.0 to 8-32
        } else {
          // Inner lane: 24-32px for progress 0.5-1.0 (0.75-1.0 of tile)
          offset = 24 + (progress - 0.5) * 16; // Maps 0.5-1.0 to 24-32
        }

        // Use outgoing rotation and lane
        switch (outputRotation) {
          case 0: // Facing right
            itemX = beltPixelX + offset;
            itemY =
              outgoingLane === "left"
                ? beltPixelY + TILE_SIZE / 4
                : beltPixelY + (TILE_SIZE * 3) / 4;
            break;
          case 90: // Facing down
            itemX =
              outgoingLane === "left"
                ? beltPixelX + (TILE_SIZE * 3) / 4
                : beltPixelX + TILE_SIZE / 4;
            itemY = beltPixelY + offset;
            break;
          case 180: // Facing left
            itemX = beltPixelX + TILE_SIZE - offset;
            itemY =
              outgoingLane === "left"
                ? beltPixelY + (TILE_SIZE * 3) / 4
                : beltPixelY + TILE_SIZE / 4;
            break;
          case 270: // Facing up
            itemX =
              outgoingLane === "left"
                ? beltPixelX + TILE_SIZE / 4
                : beltPixelX + (TILE_SIZE * 3) / 4;
            itemY = beltPixelY + TILE_SIZE - offset;
            break;
          default:
            itemX = beltPixelX;
            itemY = beltPixelY;
        }
      }
    }

    graphic.x = itemX;
    graphic.y = itemY;
  }

  private getItemColor(itemType: string): number {
    // Simple color mapping for different item types
    // TODO: Use proper textures/sprites for items
    const resourceColors: Record<string, number> = {
      coal: 0x000000, // black
      copper: 0xff6600, // orange
      iron: 0x4682b4, // steel blue
      stone: 0xff69b4, // hot pink
      "iron-plate": 0xaaaaaa, // light gray
    };

    // Check if it's a resource color first
    if (itemType in resourceColors) {
      return resourceColors[itemType];
    }

    // Check if it's an entity type and use HSL color from ENTITY_CONFIGS
    if (itemType in ENTITY_CONFIGS) {
      return hslToPixi(
        ENTITY_CONFIGS[itemType as keyof typeof ENTITY_CONFIGS].color,
      );
    }

    return 0xffffff; // white default
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
