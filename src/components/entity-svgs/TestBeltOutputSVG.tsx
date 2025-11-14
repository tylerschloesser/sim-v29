import { TILE_SIZE, type EntityConfig } from "../../types";

interface TestBeltOutputSVGProps {
  config: EntityConfig;
}

export function TestBeltOutputSVG({ config }: TestBeltOutputSVGProps) {
  const width = config.size.x * TILE_SIZE;
  const height = config.size.y * TILE_SIZE;
  const colorHex = config.color.toString(16).padStart(6, "0");

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height}>
      {/* Solid color background */}
      <rect width={width} height={height} fill={`#${colorHex}`} />

      {/* Box outline (slightly inset) */}
      <rect
        x="8"
        y="8"
        width="16"
        height="16"
        fill="none"
        stroke="#000000"
        strokeWidth="2"
      />

      {/* Arrow leaving the box (pointing right, out of the box) */}
      <g transform={`translate(${width / 2 + 4}, ${height / 2})`}>
        {/* Arrow shaft */}
        <rect x="2" y="-1.5" width="8" height="3" fill="#000000" />
        {/* Arrow head */}
        <path d="M 10,-4 L 16,0 L 10,4 Z" fill="#000000" />
      </g>
    </svg>
  );
}
