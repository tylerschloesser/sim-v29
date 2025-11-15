import { faRightFromLine } from "@fortawesome/pro-solid-svg-icons";
import { TILE_SIZE, type EntityConfig } from "../../types";
import { FAIconSVG } from "../../utils/faIconUtils";
import { hslToHex } from "../../colorUtils";

interface BurnerInserterSVGProps {
  config: EntityConfig;
}

export function BurnerInserterSVG({ config }: BurnerInserterSVGProps) {
  const width = config.size.x * TILE_SIZE;
  const height = config.size.y * TILE_SIZE;
  const colorHex = hslToHex(config.color);

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height}>
      {/* Solid color background */}
      <rect width={width} height={height} fill={colorHex} />

      {/* Right arrow */}
      <g transform={`translate(${width / 2}, ${height / 2})`}>
        <FAIconSVG icon={faRightFromLine} size={12} fill="black" />
      </g>
    </svg>
  );
}
