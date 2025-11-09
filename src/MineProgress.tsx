import { faPickaxe } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAppContext } from "./appContext";
import { useHighlightedTile } from "./useHighlightedTile";
import { RESOURCE_COLORS } from "./types";

const CIRCLE_SIZE = 48;
const BORDER_RADIUS = 20;
const BORDER_STROKE_WIDTH = 2;

// Fill circle: stroke is centered on path, so we want it to fill from center to just inside border
// Border inner edge is at (BORDER_RADIUS - BORDER_STROKE_WIDTH/2) = 19
// For fill to go from 0 to 19: radius = 19/2 = 9.5, strokeWidth = 19
const FILL_RADIUS = (BORDER_RADIUS - BORDER_STROKE_WIDTH / 2) / 2;
const FILL_STROKE_WIDTH = BORDER_RADIUS - BORDER_STROKE_WIDTH / 2;

export function MineProgress() {
  const { state } = useAppContext();
  const { resource } = useHighlightedTile();

  // Check if we have an active mine action
  const isMining = state.action?.type === "mine";
  const progress = isMining && state.action ? state.action.progress : 0;

  // Determine if disabled (no resource at highlighted tile)
  const isDisabled = !resource;

  // Get resource color (from highlighted tile, or gray if disabled)
  const resourceColor = resource ? RESOURCE_COLORS[resource.type] : 0x808080;

  // Convert hex color to CSS color
  const colorString = `#${resourceColor.toString(16).padStart(6, "0")}`;

  // Calculate circle progress (use fill radius for circumference)
  const circumference = 2 * Math.PI * FILL_RADIUS;
  const dashOffset = circumference * (1 - progress);

  return (
    <div
      className={`relative ${isDisabled ? "opacity-50" : ""}`}
      style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE }}
    >
      <svg
        width={CIRCLE_SIZE}
        height={CIRCLE_SIZE}
        className="absolute inset-0"
        style={{ transform: "rotate(-90deg)" }}
      >
        {/* Progress fill (resource color) - thick stroke acts as fill */}
        <circle
          cx={CIRCLE_SIZE / 2}
          cy={CIRCLE_SIZE / 2}
          r={FILL_RADIUS}
          fill="none"
          stroke={colorString}
          strokeWidth={FILL_STROKE_WIDTH}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />

        {/* Border (solid white, always visible) */}
        <circle
          cx={CIRCLE_SIZE / 2}
          cy={CIRCLE_SIZE / 2}
          r={BORDER_RADIUS}
          fill="none"
          stroke="white"
          strokeWidth={BORDER_STROKE_WIDTH}
        />
      </svg>

      {/* Pickaxe icon in center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <FontAwesomeIcon icon={faPickaxe} className="text-white" size="lg" />
      </div>
    </div>
  );
}
