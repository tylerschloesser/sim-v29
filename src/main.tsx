import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App.tsx";
import invariant from "tiny-invariant";

const canvas = document.querySelector("canvas");
invariant(canvas);

const ctx = canvas.getContext("2d");
invariant(ctx);

// Get display size and device pixel ratio
const dpr = window.devicePixelRatio || 1;
const rect = canvas.getBoundingClientRect();

// Set canvas internal dimensions accounting for device pixel ratio
canvas.width = rect.width * dpr;
canvas.height = rect.height * dpr;

// Scale context to account for device pixel ratio
ctx.scale(dpr, dpr);

// Draw blue circle at center (using CSS pixels)
const centerX = rect.width / 2;
const centerY = rect.height / 2;
const radius = 50;

ctx.fillStyle = "blue";
ctx.beginPath();
ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
ctx.fill();

const container = document.getElementById("root");
invariant(container);
createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
