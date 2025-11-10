import { createRouter, RouterProvider } from "@tanstack/react-router";
import { enableMapSet } from "immer";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import invariant from "tiny-invariant";
import { AppContextProvider } from "./AppContextProvider.tsx";
import { initializeState } from "./initState.ts";
import { setupPixi } from "./pixi.ts";

import "./index.css";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import { initializeTextures } from "./TextureManager.tsx";

enableMapSet();

async function main() {
  const canvas = document.querySelector("canvas");
  invariant(canvas);

  const container = document.getElementById("root");
  invariant(container);

  const textureManager = await initializeTextures();

  // Initialize PixiJS and get controller and textureManager
  const { controller } = await setupPixi(canvas, textureManager);

  // Initialize app state outside of React
  const { state: initialState, visibleChunkIds } = initializeState(
    window.innerWidth,
    window.innerHeight,
  );

  // Render initial chunks and entities in PixiJS before React mounts
  controller.updateCamera(initialState.camera.x, initialState.camera.y);
  controller.updateChunks(visibleChunkIds, initialState.chunks);
  controller.updateEntities(initialState.entities);

  // Create a new router instance
  const router = createRouter({
    routeTree,
  });

  createRoot(container).render(
    <StrictMode>
      <AppContextProvider
        initialState={initialState}
        controller={controller}
        textureManager={textureManager}
      >
        <RouterProvider router={router} />
      </AppContextProvider>
    </StrictMode>,
  );
}

main();
