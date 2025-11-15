import { faHouse } from "@fortawesome/pro-solid-svg-icons";
import { TILE_SIZE, type EntityConfig } from "../../types";
import { FAIconSVG } from "../../utils/faIconUtils";

interface HomeStorageSVGProps {
  config: EntityConfig;
}

export function HomeStorageSVG({ config }: HomeStorageSVGProps) {
  const width = config.size.x * TILE_SIZE;
  const height = config.size.y * TILE_SIZE;
  const colorHex = config.color.toString(16).padStart(6, "0");

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height}>
      {/* Solid color background */}
      <rect width={width} height={height} fill={`#${colorHex}`} />
      <g transform={`translate(${width / 2}, ${height / 2})`}>
        <FAIconSVG icon={faHouse} size={24} fill="black" />
      </g>
    </svg>
  );
}
