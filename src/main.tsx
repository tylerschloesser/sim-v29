import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App.tsx";
import invariant from "tiny-invariant";
import { setupCanvas, animate } from "./canvas.ts";

const canvas = document.querySelector("canvas");
invariant(canvas);

const { ctx, width, height } = setupCanvas(canvas);
animate(ctx, width, height);

const container = document.getElementById("root");
invariant(container);
createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
