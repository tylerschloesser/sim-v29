import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App.tsx";
import invariant from "tiny-invariant";
import { setupPixi } from "./pixi.ts";

const canvas = document.querySelector("canvas");
invariant(canvas);

// Initialize PixiJS
setupPixi(canvas);

const container = document.getElementById("root");
invariant(container);
createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
