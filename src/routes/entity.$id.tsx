import {
  createFileRoute,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { useAppContext } from "../appContext";
import type { EntityId } from "../types";

export const Route = createFileRoute("/entity/$id")({
  component: EntityComponent,
});

function EntityComponent() {
  const { id } = useParams({ from: "/entity/$id" });
  const { state } = useAppContext();
  const navigate = useNavigate();

  const entity = state.entities.get(id as EntityId);

  // Failsafe: redirect to home if entity is undefined (was deleted)
  useEffect(() => {
    if (entity === undefined) {
      navigate({ to: "/", replace: true });
    }
  }, [entity, navigate]);

  if (entity === undefined) {
    return null;
  }

  return (
    <div className="fixed inset-0 p-4 flex flex-col justify-start gap-4">
      <div className="text-white">
        <h1 className="text-xl font-bold">Entity: {entity.type}</h1>
        <pre className="font-mono text-xs">
          {JSON.stringify(entity, null, 2)}
        </pre>
      </div>
    </div>
  );
}
