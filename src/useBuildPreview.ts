import { useEffect } from "react";
import { getTilesForEntity } from "./entityUtils";
import type { PixiController } from "./PixiController";
import {
  CHUNK_SIZE,
  createEntity,
  ENTITY_CONFIGS,
  getChunkId,
  TILE_SIZE,
  tileToChunk,
} from "./types";
import type { AppState, EntityType } from "./types";

/**
 * Hook that manages the build preview based on camera position and selected entity type.
 * Calculates entity position, checks validity, and updates the PixiJS build preview.
 */
export function useBuildPreview(
  selectedEntityType: EntityType | undefined,
  state: AppState,
  pixiController: PixiController,
) {
  // Update build preview based on camera and selected entity type
  useEffect(() => {
    if (!selectedEntityType) {
      // Clear build preview when no entity type selected
      pixiController.updateBuild(null);
      return;
    }

    // Create entity with empty ID at camera position
    // Entity position is top-left, so offset by half the entity size to center it
    const entitySize = ENTITY_CONFIGS[selectedEntityType].size;
    const entityX = Math.round(state.camera.x / TILE_SIZE - entitySize.x / 2);
    const entityY = Math.round(state.camera.y / TILE_SIZE - entitySize.y / 2);

    const entity = createEntity("", selectedEntityType, entityX, entityY);

    // Check validity: entity is valid if all tiles it covers don't have an entityId
    const entityTiles = getTilesForEntity(entity);
    const valid = entityTiles.every((tile) => {
      // Convert tile coordinates to chunk coordinates
      const chunkX = tileToChunk(tile.x);
      const chunkY = tileToChunk(tile.y);
      const chunkId = getChunkId(chunkX, chunkY);

      // Get the chunk
      const chunk = state.chunks.get(chunkId);
      if (!chunk) {
        // If chunk doesn't exist yet, tile is valid
        return true;
      }

      // Get tile index within chunk (0-1023 for 32x32 chunk)
      const localTileX = tile.x - chunkX;
      const localTileY = tile.y - chunkY;
      const tileIndex = localTileY * CHUNK_SIZE + localTileX;

      // Check if tile already has an entity
      const tileData = chunk.tiles[tileIndex];
      return !tileData.entityId;
    });

    pixiController.updateBuild({ entity, valid });
  }, [state.camera, state.chunks, selectedEntityType, pixiController]);

  // Clean up build preview when component unmounts
  useEffect(() => {
    return () => {
      pixiController.updateBuild(null);
    };
  }, [pixiController]);
}
