import {
  faArrowLeft,
  faHammer,
  faRotateRight,
} from "@fortawesome/pro-solid-svg-icons";
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
import { useBuildPreview } from "../useBuildPreview";
import { ENTITY_CONFIGS, isEntityType, type EntityType } from "../types";
import { useHandleBuild } from "../useHandleBuild";

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
      state.inventory[selectedEntityType] === 0
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
            <button
              className="block p-4 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!isRotatable}
              onClick={handleRotate}
              title="Rotate (90° clockwise)"
            >
              <FontAwesomeIcon icon={faRotateRight} />
            </button>
            <button
              className="block p-4 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!build?.valid}
              onClick={() => {
                if (build?.valid) {
                  handleBuild(build.entity);
                }
              }}
            >
              <FontAwesomeIcon icon={faHammer} />
            </button>
            <Link to={build ? "/build" : "/"} className="block p-4">
              <FontAwesomeIcon icon={faArrowLeft} />
            </Link>
          </Panel>
        </div>
      </div>
    </>
  );
}
