import { useEffect, useMemo } from "react";
import type { BuildRouteSearch } from "./build-types";
import { getRotatedSize, getTilesForEntity } from "./entityUtils";
import type { PixiController } from "./PixiController";
import { getTileAtCoords } from "./tileUtils";
import type { AppState, Build, Entity } from "./types";
import {
  createBeltEntity,
  createEntity,
  ENTITY_CONFIGS,
  entityTypeSchema,
  TILE_SIZE,
} from "./types";

/**
 * Hook that manages the build preview based on camera position and selected entity type.
 * Calculates entity position, checks validity, and updates the PixiJS build preview.
 */
export function useBuildPreview(
  search: BuildRouteSearch,
  state: AppState,
  pixiController: PixiController,
): Build | null {
  // Update build preview based on camera and selected entity type
  const build = useMemo<Build | null>(() => {
    if (!search.selectedEntityType) {
      return null;
    }

    // Create entity with empty ID at camera position
    // Entity position is top-left, so offset by half the entity size to center it
    // Account for rotation: swap dimensions for 90/270 degrees
    const entitySize = ENTITY_CONFIGS[search.selectedEntityType].size;
    const rotatedSize = getRotatedSize(entitySize, search.rotation);
    const entityX = Math.round(state.camera.x / TILE_SIZE - rotatedSize.x / 2);
    const entityY = Math.round(state.camera.y / TILE_SIZE - rotatedSize.y / 2);

    let entity: Entity;
    if (search.selectedEntityType === entityTypeSchema.enum.belt) {
      entity = createBeltEntity(
        "",
        search.selectedEntityType,
        entityX,
        entityY,
        search.rotation,
        search.turn,
      );
    } else {
      entity = createEntity(
        "",
        search.selectedEntityType,
        entityX,
        entityY,
        search.rotation,
      );
    }

    // Check validity: entity is valid if all tiles it covers don't have an entityId
    const entityTiles = getTilesForEntity(entity).map(({ x, y }) =>
      getTileAtCoords(state, x, y),
    );
    const valid = entityTiles.every((tile) => !tile?.entityId);

    return { entity, valid };
  }, [state, search]);

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
