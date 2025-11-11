import { TILE_SIZE, type EntityConfig } from "../../types";

interface BurnerMiningDrillSVGProps {
  config: EntityConfig;
}

export function BurnerMiningDrillSVG({ config }: BurnerMiningDrillSVGProps) {
  const width = config.size.x * TILE_SIZE;
  const height = config.size.y * TILE_SIZE;
  const colorHex = config.color.toString(16).padStart(6, "0");

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height}>
      {/* Solid color background */}
      <rect width={width} height={height} fill={`#${colorHex}`} />
    </svg>
  );
}
