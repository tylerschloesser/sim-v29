import { invariant } from "./invariant";

export function setupCanvas(canvas: HTMLCanvasElement) {
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

  return { ctx, width: rect.width, height: rect.height };
}

export function animate(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = 50;
  const bounceAmount = 30; // pixels to bounce
  const bounceSpeed = 0.002; // speed of bounce

  let startTime: number | null = null;

  function draw(timestamp: number) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;

    // Calculate bounce offset using sine wave for smooth motion
    const offset = Math.sin(elapsed * bounceSpeed) * bounceAmount;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Fill background with black
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);

    // Draw blue circle with bounce offset
    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.arc(centerX, centerY + offset, radius, 0, 2 * Math.PI);
    ctx.fill();

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
}
