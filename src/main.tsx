import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App, type AppState } from "./App.tsx";
import invariant from "tiny-invariant";
import { setupPixi } from "./pixi.ts";
import { enableMapSet } from "immer";
import { generateChunk, getVisibleChunks } from "./chunkUtils.ts";

import "./index.css";

enableMapSet();

async function main() {
  const canvas = document.querySelector("canvas");
  invariant(canvas);

  const container = document.getElementById("root");
  invariant(container);

  // Initialize PixiJS and get callbacks
  const { updateCamera, updateChunks } = await setupPixi(canvas);

  // Initialize app state outside of React
  const initialState: AppState = {
    camera: { x: 0, y: 0 },
    chunks: new Map(),
  };

  // Calculate and generate initial visible chunks
  const visibleChunkIds = getVisibleChunks(
    initialState.camera.x,
    initialState.camera.y,
    window.innerWidth,
    window.innerHeight,
  );

  for (const chunkId of visibleChunkIds) {
    initialState.chunks.set(chunkId, generateChunk(chunkId));
  }

  // Render initial chunks in PixiJS before React mounts
  updateCamera(initialState.camera.x, initialState.camera.y);
  updateChunks(visibleChunkIds, initialState.chunks);

  createRoot(container).render(
    <StrictMode>
      <App
        initialState={initialState}
        updateCamera={updateCamera}
        updateChunks={updateChunks}
      />
    </StrictMode>,
  );
}

main();
