import { Application, Container, Sprite } from "pixi.js";
import type { Entity, EntityId } from "./types";
import { degreesToRadians } from "./types";
import type { TextureManager } from "./TextureManager";
import { getCenterPixelPosition, getRotatedSize } from "./entityUtils";

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
    const texture = this.textureManager.getTexture(entity);
    const sprite = new Sprite({
      texture,
      alpha: 0.7,
    });

    // Set anchor to center for proper rotation
    sprite.anchor.set(0.5, 0.5);

    // Calculate rotated size and center pixel position
    const rotatedSize = getRotatedSize(entity.size, entity.rotation);
    const centerPosition = getCenterPixelPosition(entity.position, rotatedSize);
    sprite.x = centerPosition.x;
    sprite.y = centerPosition.y;

    // Apply rotation (convert degrees to radians)
    sprite.rotation = degreesToRadians(entity.rotation);

    this.container.addChild(sprite);
    this.renderedEntities.set(id, sprite);
  }

  private updateEntitySprite(sprite: Sprite, entity: Entity) {
    // Calculate rotated size and center pixel position
    const rotatedSize = getRotatedSize(entity.size, entity.rotation);
    const centerPosition = getCenterPixelPosition(entity.position, rotatedSize);

    // Update position in case entity moved (center of entity with rotated dimensions)
    sprite.x = centerPosition.x;
    sprite.y = centerPosition.y;

    // Update texture in case entity type changed
    const texture = this.textureManager.getTexture(entity);
    sprite.texture = texture;

    // Update rotation in case entity was rotated
    sprite.rotation = degreesToRadians(entity.rotation);
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
