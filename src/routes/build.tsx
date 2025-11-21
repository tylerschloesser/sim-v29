import {
  faArrowLeft,
  faCircleNodes,
  faHammer,
  faRotateRight,
  faTurnLeft,
  faTurnRight,
  faUp,
} from "@fortawesome/pro-solid-svg-icons";
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import clsx from "clsx";
import { useCallback, useEffect } from "react";
import { useAppContext } from "../appContext";
import { isBelt, searchSchema } from "../build-types";
import { IconButton } from "../IconButton";
import { IconLink } from "../IconLink";
import { inventoryHas } from "../inventoryUtils";
import { Panel } from "../Panel";
import { SelectEntityPanel } from "../SelectEntityPanel";
import {
  ENTITY_CONFIGS,
  entityTypeSchema,
  rotateClockwise,
  type BeltTurn,
  type EntityType,
} from "../types";
import { useBuildPreview } from "../useBuildPreview";
import { useHandleBuild } from "../useHandleBuild";
import { invariant } from "../invariant";

export const Route = createFileRoute("/build")({
  component: BuildComponent,
  validateSearch: searchSchema.catch({ selectedEntityType: undefined }),
});

function BuildComponent() {
  const { state, pixiController } = useAppContext();
  const search = useSearch({ from: "/build" });
  const navigate = useNavigate({ from: "/build" });

  // Monitor inventory and clear selection if count drops to 0
  useEffect(() => {
    if (
      search.selectedEntityType !== undefined &&
      !inventoryHas(state.inventory, search.selectedEntityType)
    ) {
      navigate({ search: { selectedEntityType: undefined } });
    }
  }, [search, state.inventory, navigate]);

  // Update build preview based on camera, selected entity type, rotation, and turn
  const build = useBuildPreview(search, state, pixiController);

  const handleRotate = useCallback(() => {
    if (search.selectedEntityType) {
      navigate({
        search: { ...search, rotation: rotateClockwise(search.rotation) },
      });
    }
  }, [search, navigate]);

  const handleTurn = useCallback(() => {
    if (!isBelt(search)) {
      return;
    }
    let nextTurn: BeltTurn;
    if (search.turn === "none") {
      nextTurn = "right";
    } else if (search.turn === "right") {
      nextTurn = "left";
    } else {
      nextTurn = "none";
    }
    navigate({ search: { ...search, turn: nextTurn } });
  }, [search, navigate]);

  const handleBuild = useHandleBuild(search);

  // Check if the selected entity is rotatable
  const isRotatable =
    search.selectedEntityType !== undefined &&
    ENTITY_CONFIGS[search.selectedEntityType].rotatable;

  const handleSelectEntity = useCallback(
    (entityType: EntityType) => {
      if (entityType === entityTypeSchema.enum.belt) {
        navigate({
          search: {
            selectedEntityType: entityType,
            rotation: 0,
            turn: "none",
            sourceId: null,
          },
        });
      } else {
        navigate({
          search: {
            selectedEntityType: entityType,
            rotation: 0,
          },
        });
      }
    },
    [navigate],
  );

  return (
    <>
      <div
        className={clsx("fixed inset-0", "p-4 flex flex-col justify-end gap-4")}
      >
        {!search.selectedEntityType && (
          <SelectEntityPanel
            inventory={state.inventory}
            onSelectEntity={handleSelectEntity}
          />
        )}
        <div className="flex justify-end">
          <Panel className="flex">
            {isBelt(search) && (
              <IconButton
                faIcon={
                  search.turn === "none"
                    ? faUp
                    : search.turn === "right"
                      ? faTurnRight
                      : faTurnLeft
                }
                disabled={build?.type === "start-belt"}
                onClick={handleTurn}
                title="Change belt turn"
              />
            )}
            <IconButton
              faIcon={faRotateRight}
              disabled={!isRotatable || build?.type === "start-belt"}
              onClick={handleRotate}
              title="Rotate (90° clockwise)"
            />
            {!build && <IconButton faIcon={faHammer} disabled={true} />}
            {build?.type === "simple" && (
              <IconButton
                faIcon={faHammer}
                disabled={!build.valid}
                onClick={
                  build.valid &&
                  (() => {
                    handleBuild(build.entities);
                  })
                }
              />
            )}
            {build?.type === "start-belt" && (
              <IconButton
                faIcon={faCircleNodes}
                onClick={() => {
                  invariant(search.selectedEntityType === "belt");
                  invariant(build.entities.length === 1);
                  const existingBelt = build.entities.at(0);
                  invariant(existingBelt);
                  navigate({
                    search: {
                      ...search,
                      sourceId: existingBelt.id,
                    },
                  });
                }}
              />
            )}
            <IconLink faIcon={faArrowLeft} to={build ? "/build" : "/"} />
          </Panel>
        </div>
      </div>
    </>
  );
}
