import { faArrowLeft } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  createFileRoute,
  Link,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import clsx from "clsx";
import { useEffect } from "react";
import { useAppContext } from "../appContext";
import { getTilesForEntity } from "../entityUtils";
import { Panel } from "../Panel";
import { SelectEntityPanel } from "../SelectEntityPanel";
import {
  CHUNK_SIZE,
  createEntity,
  ENTITY_CONFIGS,
  getChunkId,
  TILE_SIZE,
  tileToChunk,
} from "../types";
import type { EntityType } from "../types";

interface BuildSearch {
  selectedEntityType?: EntityType;
}

const VALID_ENTITY_TYPES: EntityType[] = ["stone-furnace", "home-storage"];

function isEntityType(value: unknown): value is EntityType {
  return (
    typeof value === "string" &&
    VALID_ENTITY_TYPES.includes(value as EntityType)
  );
}

export const Route = createFileRoute("/build")({
  component: BuildComponent,
  validateSearch: (search: Record<string, unknown>): BuildSearch => {
    const selectedEntityType = search.selectedEntityType;
    return {
      selectedEntityType: isEntityType(selectedEntityType)
        ? selectedEntityType
        : undefined,
    };
  },
});

function BuildComponent() {
  const { state, pixiController } = useAppContext();
  const { selectedEntityType } = useSearch({ from: "/build" }) as BuildSearch;
  const navigate = useNavigate({ from: "/build" });

  // Monitor inventory and clear selection if count drops to 0
  useEffect(() => {
    if (
      selectedEntityType !== undefined &&
      state.inventory[selectedEntityType] === 0
    ) {
      navigate({ search: { selectedEntityType: undefined } });
    }
  }, [selectedEntityType, state.inventory, navigate]);

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

  const handleSelectEntity = (entityType: EntityType) => {
    navigate({ search: { selectedEntityType: entityType } });
  };

  return (
    <>
      <div
        className={clsx("fixed inset-0", "p-4 flex flex-col justify-end gap-4")}
      >
        {!selectedEntityType && (
          <SelectEntityPanel
            inventory={state.inventory}
            onSelectEntity={handleSelectEntity}
          />
        )}
        <div className="flex justify-end">
          <Panel>
            <Link to="/" className="block p-4">
              <FontAwesomeIcon icon={faArrowLeft} />
            </Link>
          </Panel>
        </div>
      </div>
    </>
  );
}
