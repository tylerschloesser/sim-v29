import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";

interface RouterContext {
  updateCamera: (x: number, y: number) => void;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  return <Outlet />;
}
