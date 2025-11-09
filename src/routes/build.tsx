import { faArrowLeft } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { createFileRoute, Link } from "@tanstack/react-router";
import clsx from "clsx";
import { useAppContext } from "../appContext";
import { Panel } from "../Panel";
import { SelectEntityPanel } from "../SelectEntityPanel";

export const Route = createFileRoute("/build")({
  component: BuildComponent,
});

function BuildComponent() {
  const { state } = useAppContext();
  return (
    <>
      <div
        className={clsx("fixed inset-0", "p-4 flex flex-col justify-end gap-4")}
      >
        <SelectEntityPanel inventory={state.inventory} />
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
