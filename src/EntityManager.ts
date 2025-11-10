import { Application, Container, Sprite } from "pixi.js";
import type { Entity, EntityId } from "./types";
import { TILE_SIZE } from "./types";
import type { TextureManager } from "./TextureManager";

export class EntityManager {
  private app: Application;
  private container: Container;
  private renderedEntities: Map<EntityId, Sprite>;
  private textureManager: TextureManager;

  constructor(app: Application, textureManager: TextureManager) {
    this.app = app;
    this.container = new Container();
    this.renderedEntities = new Map();
    this.textureManager = textureManager;

    // Add container to stage (will be above chunks but below grid)
    this.app.stage.addChild(this.container);
  }

  updateEntities(entities: Map<EntityId, Entity>) {
    // Remove entities that no longer exist
    for (const [id, sprite] of this.renderedEntities) {
      if (!entities.has(id)) {
        this.destroyEntity(id, sprite);
      }
    }

    // Render new or updated entities
    for (const [id, entity] of entities) {
      if (this.renderedEntities.has(id)) {
        // Update existing entity (in case it moved or changed)
        const sprite = this.renderedEntities.get(id)!;
        this.updateEntitySprite(sprite, entity);
      } else {
        // Render new entity
        this.renderEntity(id, entity);
      }
    }
  }

  private renderEntity(id: EntityId, entity: Entity) {
    const texture = this.textureManager.getTexture(entity.type);
    const sprite = new Sprite({
      texture,
      alpha: 0.7,
    });
    sprite.x = entity.position.x * TILE_SIZE;
    sprite.y = entity.position.y * TILE_SIZE;

    this.container.addChild(sprite);
    this.renderedEntities.set(id, sprite);
  }

  private updateEntitySprite(sprite: Sprite, entity: Entity) {
    // Update position in case entity moved
    sprite.x = entity.position.x * TILE_SIZE;
    sprite.y = entity.position.y * TILE_SIZE;

    // Update texture in case entity type changed
    const texture = this.textureManager.getTexture(entity.type);
    sprite.texture = texture;
  }

  private destroyEntity(id: EntityId, sprite: Sprite) {
    this.container.removeChild(sprite);
    sprite.destroy();
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
    for (const sprite of this.renderedEntities.values()) {
      sprite.destroy();
    }
    this.renderedEntities.clear();
    this.container.destroy();
  }
}
