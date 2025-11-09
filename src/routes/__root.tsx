import { createRootRoute, Outlet } from "@tanstack/react-router";
import { useAppContext } from "../appContext";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
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
