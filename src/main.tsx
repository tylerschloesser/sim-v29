import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import invariant from "tiny-invariant";
import { setupPixi } from "./pixi.ts";

import "./index.css";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

async function main() {
  const canvas = document.querySelector("canvas");
  invariant(canvas);

  const container = document.getElementById("root");
  invariant(container);

  // Initialize PixiJS and render React app with callback
  const { updateCamera } = await setupPixi(canvas);

  // Create a new router instance with the updateCamera context
  const router = createRouter({
    routeTree,
    context: {
      updateCamera,
    },
  });

  createRoot(container).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
}

main();
