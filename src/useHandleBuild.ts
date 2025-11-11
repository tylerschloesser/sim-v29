import invariant from "tiny-invariant";
import { useAppContext } from "./appContext";
import { getBeltConnections } from "./beltUtils";
import { getTilesForEntity } from "./entityUtils";
import { decrementInventory } from "./inventoryUtils";
import type { Entity } from "./types";
import { CHUNK_SIZE, getChunkId, getEntityId, tileToChunk } from "./types";

/**
 * Hook that provides a function to add an entity to the app state.
 * Validates that the entity ID is empty, generates a new ID, and updates
 * all tiles occupied by the entity.
 */
export function useHandleBuild(): (entity: Entity) => void {
  const { updateState } = useAppContext();

  return (entity: Entity) => {
    invariant(entity.id === "", "Entity ID must be empty string");

    updateState((draft) => {
      // Generate unique entity ID and increment counter
      const entityId = getEntityId(draft.nextEntityId++);

      // Create updated entity with new ID
      const updatedEntity: Entity = {
        ...entity,
        id: entityId,
      };

      // Add entity to entities Map
      draft.entities.set(entityId, updatedEntity);

      // Log belt connections if this is a belt
      if (updatedEntity.type === "belt") {
        const connections = getBeltConnections(updatedEntity, draft);
        console.log("Belt placed:", {
          position: updatedEntity.position,
          rotation: updatedEntity.rotation,
          turn: updatedEntity.turn,
          incomingTile: connections.incomingTile,
          incomingBelt: connections.incomingBelt
            ? {
                id: connections.incomingBelt.id,
                position: connections.incomingBelt.position,
                rotation: connections.incomingBelt.rotation,
                turn: connections.incomingBelt.turn,
              }
            : null,
          outgoingTile: connections.outgoingTile,
          outgoingBelt: connections.outgoingBelt
            ? {
                id: connections.outgoingBelt.id,
                position: connections.outgoingBelt.position,
                rotation: connections.outgoingBelt.rotation,
                turn: connections.outgoingBelt.turn,
              }
            : null,
        });
      }

      // Update all tiles occupied by entity to reference it
      for (const { x, y } of getTilesForEntity(updatedEntity)) {
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

        tile.entityId = entityId;
      }

      decrementInventory(draft.inventory, entity.type, 1);
    });
  };
}
