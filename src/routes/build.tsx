import { createFileRoute } from "@tanstack/react-router";
import { Panel } from "../Panel";
import clsx from "clsx";

export const Route = createFileRoute("/build")({
  component: BuildComponent,
});

function BuildComponent() {
  return (
    <>
      <div
        className={clsx(
          "fixed inset-0 pointer-events-none",
          "p-4 flex flex-col-reverse",
        )}
      >
        <Panel className="p-4">Test</Panel>
      </div>
    </>
  );
}
