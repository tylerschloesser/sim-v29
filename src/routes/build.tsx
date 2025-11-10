import { faArrowLeft, faHammer } from "@fortawesome/pro-solid-svg-icons";
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
import type { EntityType } from "../types";
import { useHandleBuild } from "../useHandleBuild";

interface BuildSearch {
  selectedEntityType?: EntityType;
}

const VALID_ENTITY_TYPES = [
  "stone-furnace",
  "home-storage",
  "burner-inserter",
] as const satisfies readonly EntityType[];

// Compile-time check that ensures all EntityType values are included
// This will cause a type error if any EntityType is missing from the array above
type AssertAllEntityTypes =
  (typeof VALID_ENTITY_TYPES)[number] extends EntityType
    ? EntityType extends (typeof VALID_ENTITY_TYPES)[number]
      ? true
      : "Missing entity type in VALID_ENTITY_TYPES array"
    : "Invalid entity type in VALID_ENTITY_TYPES array";
const _checkEntityTypes: AssertAllEntityTypes = true;
void _checkEntityTypes; // Suppress unused variable warning

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
  const build = useBuildPreview(selectedEntityType, state, pixiController);

  const handleSelectEntity = (entityType: EntityType) => {
    navigate({ search: { selectedEntityType: entityType } });
  };

  const handleBuild = useHandleBuild();

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
