import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import type { AppState } from "../App";
import type { Chunk, ChunkId } from "../types";

interface RouterContext {
  initialState: AppState;
  updateCamera: (x: number, y: number) => void;
  updateChunks: (
    visibleChunkIds: ChunkId[],
    chunkMap: Map<ChunkId, Chunk>,
  ) => void;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  return <Outlet />;
}
