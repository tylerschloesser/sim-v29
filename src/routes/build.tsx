import {
  faArrowLeft,
  faHammer,
  faRotateRight,
} from "@fortawesome/pro-solid-svg-icons";
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import clsx from "clsx";
import { useEffect } from "react";
import { useAppContext } from "../appContext";
import { IconButton } from "../IconButton";
import { IconLink } from "../IconLink";
import { Panel } from "../Panel";
import { SelectEntityPanel } from "../SelectEntityPanel";
import { ENTITY_CONFIGS, isEntityType, type EntityType } from "../types";
import { useBuildPreview } from "../useBuildPreview";
import { useHandleBuild } from "../useHandleBuild";
import { inventoryHas } from "../inventoryUtils";

interface BuildSearch {
  selectedEntityType?: EntityType;
  rotation?: 0 | 90 | 180 | 270;
}

export const Route = createFileRoute("/build")({
  component: BuildComponent,
  validateSearch: (search: Record<string, unknown>): BuildSearch => {
    const selectedEntityType = search.selectedEntityType;
    const rotation = search.rotation;
    const isValidRotation = (value: unknown): value is 0 | 90 | 180 | 270 =>
      value === 0 || value === 90 || value === 180 || value === 270;

    return {
      selectedEntityType: isEntityType(selectedEntityType)
        ? selectedEntityType
        : undefined,
      rotation: isValidRotation(rotation) ? rotation : 0,
    };
  },
});

function BuildComponent() {
  const { state, pixiController } = useAppContext();
  const { selectedEntityType, rotation } = useSearch({
    from: "/build",
  }) as BuildSearch;
  const navigate = useNavigate({ from: "/build" });

  // Monitor inventory and clear selection if count drops to 0
  useEffect(() => {
    if (
      selectedEntityType !== undefined &&
      !inventoryHas(state.inventory, selectedEntityType)
    ) {
      navigate({ search: { selectedEntityType: undefined, rotation: 0 } });
    }
  }, [selectedEntityType, state.inventory, navigate]);

  // Update build preview based on camera, selected entity type, and rotation
  const build = useBuildPreview(
    selectedEntityType,
    rotation ?? 0,
    state,
    pixiController,
  );

  const handleSelectEntity = (entityType: EntityType) => {
    navigate({ search: { selectedEntityType: entityType, rotation: 0 } });
  };

  const handleRotate = () => {
    const nextRotation = (((rotation ?? 0) + 90) % 360) as 0 | 90 | 180 | 270;
    navigate({ search: { selectedEntityType, rotation: nextRotation } });
  };

  const handleBuild = useHandleBuild();

  // Check if the selected entity is rotatable
  const isRotatable =
    selectedEntityType !== undefined &&
    ENTITY_CONFIGS[selectedEntityType].rotatable;

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
          <Panel className="flex">
            <IconButton
              faIcon={faRotateRight}
              disabled={!isRotatable}
              onClick={handleRotate}
              title="Rotate (90° clockwise)"
              className="block"
            />
            <IconButton
              faIcon={faHammer}
              disabled={!build?.valid}
              onClick={() => {
                if (build?.valid) {
                  handleBuild(build.entity);
                }
              }}
              className="block"
            />
            <IconLink
              faIcon={faArrowLeft}
              to={build ? "/build" : "/"}
              className="block"
            />
          </Panel>
        </div>
      </div>
    </>
  );
}
