import { useEffect, useMemo } from "react";
import { isBelt, type BuildRouteSearch } from "./build-types";
import { getRotatedSize, getTilesForEntity } from "./entityUtils";
import { invariant } from "./invariant";
import type { PixiController } from "./PixiController";
import { getTileAtCoords } from "./tileUtils";
import type {
  AppState,
  BeltEntity,
  Build,
  Entity,
  Rotation,
  SimpleBuild,
  StartBeltBuild,
} from "./types";
import {
  createBeltEntity,
  createEntity,
  ENTITY_CONFIGS,
  getEntityId,
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
    const rotation = getEffectiveSearchRotation(search);
    const entitySize = ENTITY_CONFIGS[search.selectedEntityType].size;
    const rotatedSize = getRotatedSize(entitySize, rotation);
    const entityX = Math.round(state.camera.x / TILE_SIZE - rotatedSize.x / 2);
    const entityY = Math.round(state.camera.y / TILE_SIZE - rotatedSize.y / 2);

    const entities: Entity[] = [];
    if (isBelt(search)) {
      if (search.sourceId === null) {
        const entityId = getEntityId(state.nextEntityId);
        entities.push(
          createBeltEntity(
            entityId,
            search.selectedEntityType,
            entityX,
            entityY,
            rotation,
            search.turn,
          ),
        );
      } else {
        const sourceEntity = state.entities.get(search.sourceId);
        invariant(sourceEntity?.type === "belt");

        const path = getPathFromSource(sourceEntity, {
          position: { x: entityX, y: entityY },
          rotation,
          turn: search.turn,
        });

        for (let i = 0; i < path.length; i++) {
          const partial = path.at(i);
          invariant(partial);
          const entityId = getEntityId(state.nextEntityId + i);
          entities.push(
            createBeltEntity(
              entityId,
              search.selectedEntityType,
              entityX,
              entityY,
              rotation,
              search.turn,
            ),
          );
        }
      }
    } else {
      const entityId = getEntityId(state.nextEntityId);
      entities.push(
        createEntity(
          entityId,
          search.selectedEntityType,
          entityX,
          entityY,
          search.rotation,
        ),
      );
    }

    if (search.selectedEntityType === "belt" && search.sourceId === null) {
      // check if placing the belt here would connect to any existing belts
      invariant(entities.length === 1);
      const entity = entities.at(0);
      invariant(entity);
      const entityTiles = getTilesForEntity(entity).map(({ x, y }) =>
        getTileAtCoords(state, x, y),
      );
      invariant(entityTiles.length === 1);
      const tile = entityTiles.at(0);
      if (tile?.entityId) {
        const existingEntity = state.entities.get(tile.entityId);
        invariant(existingEntity);
        if (existingEntity.type === "belt") {
          return {
            type: "start-belt",
            entities: [existingEntity],
          } satisfies StartBeltBuild;
        }
      }
    }

    const valid =
      entities.length > 0 &&
      entities.every((entity) => {
        const entityTiles = getTilesForEntity(entity).map(({ x, y }) =>
          getTileAtCoords(state, x, y),
        );
        return entityTiles.every((tile) => !tile?.entityId);
      });

    return { type: "simple", entities, valid } satisfies SimpleBuild;
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

function getEffectiveSearchRotation(search: BuildRouteSearch): Rotation {
  if (!("rotation" in search)) {
    return 0;
  }
  return search.rotation;
}

function getPathFromSource(
  source: BeltEntity,
  target: Pick<BeltEntity, "position" | "rotation" | "turn">,
): Pick<BeltEntity, "position" | "rotation" | "turn">[] {
  void source;
  return [target];
}
