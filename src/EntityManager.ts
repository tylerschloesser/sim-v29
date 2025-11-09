import { Application, Container, Graphics } from "pixi.js";
import type { Entity, EntityId } from "./types";
import { TILE_SIZE } from "./types";
import { getEntityColor } from "./entityUtils";

export class EntityManager {
  private app: Application;
  private container: Container;
  private renderedEntities: Map<EntityId, Graphics>;

  constructor(app: Application) {
    this.app = app;
    this.container = new Container();
    this.renderedEntities = new Map();

    // Add container to stage (will be above chunks but below grid)
    this.app.stage.addChild(this.container);
  }

  updateEntities(entities: Map<EntityId, Entity>) {
    // Remove entities that no longer exist
    for (const [id, graphics] of this.renderedEntities) {
      if (!entities.has(id)) {
        this.destroyEntity(id, graphics);
      }
    }

    // Render new or updated entities
    for (const [id, entity] of entities) {
      if (this.renderedEntities.has(id)) {
        // Update existing entity (in case it moved or changed)
        const graphics = this.renderedEntities.get(id)!;
        this.updateEntityGraphics(graphics, entity);
      } else {
        // Render new entity
        this.renderEntity(id, entity);
      }
    }
  }

  private renderEntity(id: EntityId, entity: Entity) {
    const graphics = new Graphics();
    this.drawEntity(graphics, entity);
    this.container.addChild(graphics);
    this.renderedEntities.set(id, graphics);
  }

  private updateEntityGraphics(graphics: Graphics, entity: Entity) {
    graphics.clear();
    this.drawEntity(graphics, entity);
  }

  private drawEntity(graphics: Graphics, entity: Entity) {
    const worldX = entity.position.x * TILE_SIZE;
    const worldY = entity.position.y * TILE_SIZE;
    const width = entity.size.x * TILE_SIZE;
    const height = entity.size.y * TILE_SIZE;

    const color = getEntityColor(entity.type);

    // Draw filled rectangle with transparency
    graphics.rect(worldX, worldY, width, height);
    graphics.fill({ color, alpha: 0.7 });

    // Draw border
    graphics.rect(worldX, worldY, width, height);
    graphics.stroke({ color: 0x000000, width: 2 });
  }

  private destroyEntity(id: EntityId, graphics: Graphics) {
    this.container.removeChild(graphics);
    graphics.destroy();
    this.renderedEntities.delete(id);
  }

  updatePosition(cameraX: number, cameraY: number) {
    // Center the container based on camera position
    const centerX = this.app.screen.width / 2;
    const centerY = this.app.screen.height / 2;

    this.container.position.x = centerX - cameraX;
    this.container.position.y = centerY - cameraY;
  }

  destroy() {
    for (const graphics of this.renderedEntities.values()) {
      graphics.destroy();
    }
    this.renderedEntities.clear();
    this.container.destroy();
  }
}
