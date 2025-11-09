import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App.tsx";
import invariant from "tiny-invariant";
import { setupPixi } from "./pixi.ts";

const canvas = document.querySelector("canvas");
invariant(canvas);

const container = document.getElementById("root");
invariant(container);

// Initialize PixiJS and render React app with callback
const { updateCamera } = await setupPixi(canvas);

createRoot(container).render(
  <StrictMode>
    <App updateCamera={updateCamera} />
  </StrictMode>,
);
