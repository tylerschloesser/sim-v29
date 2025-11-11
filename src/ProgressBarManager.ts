import { Application, Container, Graphics } from "pixi.js";
import type {
  Entity,
  EntityId,
  BurnerInserterEntity,
  StoneFurnaceEntity,
} from "./types";
import { TILE_SIZE } from "./types";
import { getRotatedSize } from "./entityUtils";

export class ProgressBarManager {
  private app: Application;
  private container: Container;
  private progressBars: Map<EntityId, Graphics>;

  constructor(app: Application) {
    this.app = app;
    this.container = new Container();
    this.progressBars = new Map();

    // Add container to stage (will be above entities)
    this.app.stage.addChild(this.container);
  }

  updateProgressBars(entities: Map<EntityId, Entity>) {
    // Clear existing progress bars
    for (const graphics of this.progressBars.values()) {
      this.container.removeChild(graphics);
      graphics.destroy();
    }
    this.progressBars.clear();

    // Render progress bars for burner inserters and stone furnaces
    for (const [id, entity] of entities) {
      if (entity.type === "burner-inserter") {
        this.renderBurnerInserterProgressBar(id, entity);
      } else if (entity.type === "stone-furnace") {
        this.renderStoneFurnaceProgressBar(id, entity);
      }
    }
  }

  private renderBurnerInserterProgressBar(
    id: EntityId,
    entity: BurnerInserterEntity,
  ) {
    const { state, position, size, rotation } = entity;

    // Calculate entity center X in world pixels
    const rotatedSize = getRotatedSize(size, rotation);
    const centerX = (position.x + rotatedSize.x / 2) * TILE_SIZE;

    // Progress bar dimensions
    const barWidth = TILE_SIZE * 0.8; // 80% of tile size
    const barHeight = 4; // 4 pixels tall

    // Position bar at visual top (north) of entity, unaffected by rotation
    const barX = centerX;
    const barY = position.y * TILE_SIZE - barHeight - 2; // 2 pixels above entity

    // Create graphics object
    const graphics = new Graphics();

    // Determine color and fill amount based on state
    let fillColor: number;
    let progress: number;

    switch (state.type) {
      case "idle":
        // Gray, no fill
        fillColor = 0x808080; // gray
        progress = 0;
        break;
      case "deliver":
        if (state.progress >= 1) {
          // Stuck - red
          fillColor = 0xff0000; // red
          progress = state.progress;
        } else {
          // Delivering - green
          fillColor = 0x00ff00; // green
          progress = state.progress;
        }
        break;
      case "return":
        // Returning - blue
        fillColor = 0x0000ff; // blue
        progress = state.progress;
        break;
    }

    // Draw background (dark gray)
    graphics.rect(barX - barWidth / 2, barY, barWidth, barHeight);
    graphics.fill(0x333333);

    // Draw filled portion if progress > 0
    if (progress > 0) {
      const fillWidth = barWidth * Math.min(progress, 1);
      graphics.rect(barX - barWidth / 2, barY, fillWidth, barHeight);
      graphics.fill(fillColor);
    }

    this.container.addChild(graphics);
    this.progressBars.set(id, graphics);
  }

  private renderStoneFurnaceProgressBar(
    id: EntityId,
    entity: StoneFurnaceEntity,
  ) {
    const { state, position, size } = entity;

    // Calculate entity center X in world pixels
    const centerX = (position.x + size.x / 2) * TILE_SIZE;

    // Progress bar dimensions
    const barWidth = TILE_SIZE * 0.8; // 80% of tile size
    const barHeight = 4; // 4 pixels tall

    // Position bar at visual top (north) of entity
    const barX = centerX;
    const barY = position.y * TILE_SIZE - barHeight - 2; // 2 pixels above entity

    // Create graphics object
    const graphics = new Graphics();

    // Determine color and fill amount based on state
    let fillColor: number;
    let progress: number;

    switch (state.type) {
      case "idle":
        // Gray, no fill
        fillColor = 0x808080; // gray
        progress = 0;
        break;
      case "smelting":
        // Green progress bar during smelting
        fillColor = 0x00ff00; // green
        progress = state.progress;
        break;
    }

    // Draw background (dark gray)
    graphics.rect(barX - barWidth / 2, barY, barWidth, barHeight);
    graphics.fill(0x333333);

    // Draw filled portion if progress > 0
    if (progress > 0) {
      const fillWidth = barWidth * Math.min(progress, 1);
      graphics.rect(barX - barWidth / 2, barY, fillWidth, barHeight);
      graphics.fill(fillColor);
    }

    this.container.addChild(graphics);
    this.progressBars.set(id, graphics);
  }

  updatePosition(cameraX: number, cameraY: number) {
    // Center the container based on camera position
    const centerX = this.app.screen.width / 2;
    const centerY = this.app.screen.height / 2;

    this.container.position.x = centerX - cameraX;
    this.container.position.y = centerY - cameraY;
  }

  destroy() {
    for (const graphics of this.progressBars.values()) {
      graphics.destroy();
    }
    this.progressBars.clear();
    this.container.destroy();
  }
}
