import { createRootRoute, Outlet } from "@tanstack/react-router";
import { useAppContext } from "../appContext";
import { useCamera } from "../useCamera";
import { useSetEntities } from "../useSetEntities";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  useCamera();
  useSetEntities();
  const { state } = useAppContext();
  return (
    <>
      <div className="fixed pointer-events-none flex">
        <span className="text-xs font-mono">{state.tick}</span>
      </div>
      <Outlet />
    </>
  );
}
