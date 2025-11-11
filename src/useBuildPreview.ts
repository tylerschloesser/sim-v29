import { useEffect, useMemo } from "react";
import { getRotatedSize, getTilesForEntity } from "./entityUtils";
import type { PixiController } from "./PixiController";
import type { AppState, BeltTurn, Build, EntityType } from "./types";
import {
  CHUNK_SIZE,
  createEntity,
  ENTITY_CONFIGS,
  getChunkId,
  TILE_SIZE,
  tileToChunk,
} from "./types";

/**
 * Hook that manages the build preview based on camera position and selected entity type.
 * Calculates entity position, checks validity, and updates the PixiJS build preview.
 */
export function useBuildPreview(
  selectedEntityType: EntityType | undefined,
  rotation: 0 | 90 | 180 | 270,
  turn: BeltTurn,
  state: AppState,
  pixiController: PixiController,
): Build | null {
  // Update build preview based on camera and selected entity type
  const build = useMemo<Build | null>(() => {
    if (!selectedEntityType) {
      return null;
    }

    // Create entity with empty ID at camera position
    // Entity position is top-left, so offset by half the entity size to center it
    // Account for rotation: swap dimensions for 90/270 degrees
    const entitySize = ENTITY_CONFIGS[selectedEntityType].size;
    const rotatedSize = getRotatedSize(entitySize, rotation);
    const entityX = Math.round(state.camera.x / TILE_SIZE - rotatedSize.x / 2);
    const entityY = Math.round(state.camera.y / TILE_SIZE - rotatedSize.y / 2);

    const entity = createEntity(
      "",
      selectedEntityType,
      entityX,
      entityY,
      rotation,
      turn,
    );

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

    return { entity, valid };
  }, [state.camera, state.chunks, selectedEntityType, rotation, turn]);

  useEffect(() => {
    pixiController.updateBuild(build);
  }, [build, pixiController]);

  // Clean up build preview when component unmounts
  useEffect(() => {
    return () => {
      pixiController.updateBuild(null);
    };
  }, [pixiController]);

  return build;
}
