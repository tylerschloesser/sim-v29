import { faRight, faTurnUp } from "@fortawesome/pro-solid-svg-icons";
import { TILE_SIZE, type BeltTurn, type EntityConfig } from "../../types";
import { FAIconSVG } from "../../utils/faIconUtils";

interface BeltSVGProps {
  config: EntityConfig;
  turn?: BeltTurn;
}

export function BeltSVG({ config, turn = "none" }: BeltSVGProps) {
  const width = config.size.x * TILE_SIZE;
  const height = config.size.y * TILE_SIZE;
  const colorHex = config.color.toString(16).padStart(6, "0");

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height}>
      {/* Solid color background */}
      <rect width={width} height={height} fill={`#${colorHex}`} />

      <g transform={`translate(${width / 2}, ${height / 2})`}>
        {turn === "none" && <FAIconSVG icon={faRight} size={12} fill="black" />}

        {turn === "left" && (
          <FAIconSVG icon={faTurnUp} size={12} fill="black" />
        )}

        {turn === "right" && (
          <>
            {/* Curved arrow turning right (right to down) */}
            {/* Horizontal line from left */}
            <rect x="-8" y="-1.5" width="6" height="3" fill="#000000" />
            {/* Curved path turning down */}
            <path
              d="M -2,-1.5 Q 4,-1.5 4,8"
              stroke="#000000"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            {/* Arrow head pointing down */}
            <path d="M 0,8 L 4,14 L 8,8 Z" fill="#000000" />
          </>
        )}
      </g>
    </svg>
  );
}
