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
import { Panel } from "../Panel";
import { SelectEntityPanel } from "../SelectEntityPanel";
import { createEntity, ENTITY_CONFIGS, worldToTile } from "../types";
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

    // Calculate entity position: center on camera, then round to nearest tile
    const cameraTileX = worldToTile(state.camera.x);
    const cameraTileY = worldToTile(state.camera.y);

    // Create entity with empty ID at camera position
    // Entity position is top-left, so offset by half the entity size to center it
    const entitySize = ENTITY_CONFIGS[selectedEntityType].size;
    const entityX = Math.round(cameraTileX - entitySize.x / 2);
    const entityY = Math.round(cameraTileY - entitySize.y / 2);

    const entity = createEntity("", selectedEntityType, entityX, entityY);

    // TODO: Add collision detection to determine validity
    const valid = true;

    pixiController.updateBuild({ entity, valid });
  }, [state.camera, selectedEntityType, pixiController]);

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
