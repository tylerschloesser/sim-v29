import { TILE_SIZE, type EntityConfig } from "../../types";

interface HomeStorageSVGProps {
  config: EntityConfig;
}

export function HomeStorageSVG({ config }: HomeStorageSVGProps) {
  const width = config.size.x * TILE_SIZE;
  const height = config.size.y * TILE_SIZE;
  const colorHex = config.color.toString(16).padStart(6, "0");

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height}>
      <defs>
        {/* Radial gradient for depth */}
        <radialGradient id="storage-gradient" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor={`#${colorHex}`} stopOpacity={1} />
          <stop
            offset="100%"
            stopColor={`#${((config.color >> 1) & 0x7f7f7f).toString(16).padStart(6, "0")}`}
            stopOpacity={1}
          />
        </radialGradient>

        {/* Grid pattern */}
        <pattern
          id="storage-grid"
          x="0"
          y="0"
          width="16"
          height="16"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 16 0 L 0 0 0 16"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
          />
        </pattern>
      </defs>

      {/* Background with gradient */}
      <rect width={width} height={height} fill="url(#storage-gradient)" />

      {/* Grid overlay */}
      <rect width={width} height={height} fill="url(#storage-grid)" />

      {/* Border */}
      <rect
        width={width}
        height={height}
        fill="none"
        stroke="#000000"
        strokeWidth="2"
      />

      {/* Storage box icon in center */}
      <g transform={`translate(${width / 2}, ${height / 2})`}>
        {/* Box shape with 3D effect */}
        <rect
          x="-16"
          y="-16"
          width="32"
          height="32"
          fill="rgba(255,255,255,0.2)"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="2"
        />

        {/* Inner compartments */}
        <line
          x1="-16"
          y1="0"
          x2="16"
          y2="0"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1"
        />
        <line
          x1="0"
          y1="-16"
          x2="0"
          y2="16"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1"
        />

        {/* Items in compartments (small squares) */}
        <rect
          x="-12"
          y="-12"
          width="8"
          height="8"
          fill="rgba(255,255,255,0.4)"
        />
        <rect x="4" y="-12" width="8" height="8" fill="rgba(255,255,255,0.4)" />
        <rect x="-12" y="4" width="8" height="8" fill="rgba(255,255,255,0.4)" />
      </g>
    </svg>
  );
}
