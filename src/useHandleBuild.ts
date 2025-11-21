import { useCallback } from "react";
import { useAppContext } from "./appContext";
import { getTilesForEntity } from "./entityUtils";
import { invariant } from "./invariant";
import { decrementInventory } from "./inventoryUtils";
import type { Entity } from "./types";
import { CHUNK_SIZE, getChunkId, getEntityId, tileToChunk } from "./types";

/**
 * Hook that provides a function to add an entity to the app state.
 * Validates that the entity ID is empty, generates a new ID, and updates
 * all tiles occupied by the entity.
 */
export function useHandleBuild(): (entities: Entity[]) => void {
  const { updateState } = useAppContext();

  return useCallback(
    (entities: Entity[]) => {
      updateState((draft) => {
        for (const entity of entities) {
          invariant(entity.id === getEntityId(draft.nextEntityId));
          draft.nextEntityId += 1;

          // Add entity to entities Map
          draft.entities.set(entity.id, entity);

          // Update all tiles occupied by entity to reference it
          for (const { x, y } of getTilesForEntity(entity)) {
            // Convert tile coordinates to chunk coordinates
            const chunkX = tileToChunk(x);
            const chunkY = tileToChunk(y);
            const chunkId = getChunkId(chunkX, chunkY);

            // Get chunk from state
            const chunk = draft.chunks.get(chunkId);
            invariant(chunk, `Chunk ${chunkId} must exist to place entity`);

            // Calculate local tile position within chunk
            const localTileX = x - chunkX;
            const localTileY = y - chunkY;
            const tileIndex = localTileY * CHUNK_SIZE + localTileX;

            // Validate and update tile
            const tile = chunk.tiles[tileIndex];
            invariant(
              !tile.entityId,
              `Tile at (${x}, ${y}) must not already have an entity`,
            );

            tile.entityId = entity.id;
          }
          decrementInventory(draft.inventory, entity.type, 1);
          console.debug("Built entity:", entity);
        }
      });
    },
    [updateState],
  );
}
