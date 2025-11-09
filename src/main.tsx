import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import invariant from "tiny-invariant";
import { setupPixi } from "./pixi.ts";
import { enableMapSet } from "immer";
import { initializeState } from "./initState.ts";

import "./index.css";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

enableMapSet();

async function main() {
  const canvas = document.querySelector("canvas");
  invariant(canvas);

  const container = document.getElementById("root");
  invariant(container);

  // Initialize PixiJS and get callbacks
  const { updateCamera, updateChunks } = await setupPixi(canvas);

  // Initialize app state outside of React
  const { state: initialState, visibleChunkIds } = initializeState(
    window.innerWidth,
    window.innerHeight,
  );

  // Render initial chunks in PixiJS before React mounts
  updateCamera(initialState.camera.x, initialState.camera.y);
  updateChunks(visibleChunkIds, initialState.chunks);

  // Create a new router instance with the callbacks and initial state in context
  const router = createRouter({
    routeTree,
    context: {
      initialState,
      updateCamera,
      updateChunks,
    },
  });

  createRoot(container).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
}

main();
