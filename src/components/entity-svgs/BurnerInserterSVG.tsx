import { TILE_SIZE, type EntityConfig } from "../../types";

interface BurnerInserterSVGProps {
  config: EntityConfig;
}

export function BurnerInserterSVG({ config }: BurnerInserterSVGProps) {
  const width = config.size.x * TILE_SIZE;
  const height = config.size.y * TILE_SIZE;
  const colorHex = config.color.toString(16).padStart(6, "0");

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height}>
      {/* Solid color background */}
      <rect width={width} height={height} fill={`#${colorHex}`} />

      {/* Right arrow */}
      <g transform={`translate(${width / 2}, ${height / 2})`}>
        {/* Arrow shaft */}
        <rect x="-8" y="-1.5" width="10" height="3" fill="#000000" />
        {/* Arrow head */}
        <path d="M 2,-4 L 8,0 L 2,4 Z" fill="#000000" />
      </g>
    </svg>
  );
}
