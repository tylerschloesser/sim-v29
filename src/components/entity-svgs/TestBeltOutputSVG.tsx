import { faRightToBracket } from "@fortawesome/pro-solid-svg-icons";
import { TILE_SIZE, type EntityConfig } from "../../types";
import { FAIconSVG } from "../../utils/faIconUtils";

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

      <g transform={`translate(${width / 2}, ${height / 2})`}>
        <FAIconSVG icon={faRightToBracket} size={12} fill="black" />
      </g>
    </svg>
  );
}
