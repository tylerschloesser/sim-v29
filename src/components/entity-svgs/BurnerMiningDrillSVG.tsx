import { faDownFromLine } from "@fortawesome/pro-solid-svg-icons";
import { hslToHex } from "../../colorUtils";
import { TILE_SIZE, type EntityConfig } from "../../types";
import { FAIconSVG } from "../../utils/faIconUtils";

interface BurnerMiningDrillSVGProps {
  config: EntityConfig;
}

export function BurnerMiningDrillSVG({ config }: BurnerMiningDrillSVGProps) {
  const width = config.size.x * TILE_SIZE;
  const height = config.size.y * TILE_SIZE;
  const colorHex = hslToHex(config.color);

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height}>
      {/* Solid color background */}
      <rect width={width} height={height} fill={colorHex} />
      <g transform={`translate(${width / 2}, ${height / 2})`}>
        <FAIconSVG icon={config.icon} size={24} fill="black" />
      </g>
      <g transform={`translate(${width * 0.75}, ${height * 0.85})`}>
        <FAIconSVG icon={faDownFromLine} size={12} fill="black" />
      </g>
    </svg>
  );
}
