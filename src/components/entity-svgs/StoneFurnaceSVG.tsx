import { TILE_SIZE, type EntityConfig } from "../../types";

interface StoneFurnaceSVGProps {
  config: EntityConfig;
}

export function StoneFurnaceSVG({ config }: StoneFurnaceSVGProps) {
  const width = config.size.x * TILE_SIZE;
  const height = config.size.y * TILE_SIZE;
  const colorHex = config.color.toString(16).padStart(6, "0");

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height}>
      <defs>
        {/* Gradient from top to bottom */}
        <linearGradient id="furnace-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={`#${colorHex}`} stopOpacity={1} />
          <stop
            offset="100%"
            stopColor={`#${(config.color * 0.7).toString(16).padStart(6, "0")}`}
            stopOpacity={1}
          />
        </linearGradient>

        {/* Pattern for texture */}
        <pattern
          id="furnace-pattern"
          x="0"
          y="0"
          width="8"
          height="8"
          patternUnits="userSpaceOnUse"
        >
          <rect width="8" height="8" fill="url(#furnace-gradient)" />
          <circle cx="4" cy="4" r="1" fill="rgba(0,0,0,0.1)" />
        </pattern>
      </defs>

      {/* Background with pattern */}
      <rect width={width} height={height} fill="url(#furnace-pattern)" />

      {/* Border */}
      <rect
        width={width}
        height={height}
        fill="none"
        stroke="#000000"
        strokeWidth="2"
      />

      {/* Inner frame */}
      <rect
        x="4"
        y="4"
        width={width - 8}
        height={height - 8}
        fill="none"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="2"
      />

      {/* Flame icon in center */}
      <g transform={`translate(${width / 2}, ${height / 2})`}>
        {/* Simple flame shape */}
        <path
          d="M 0,-12 Q -6,-6 -6,0 Q -6,6 0,12 Q 6,6 6,0 Q 6,-6 0,-12 Z"
          fill="#ffaa00"
          opacity="0.8"
        />
        <path
          d="M 0,-8 Q -4,-4 -4,0 Q -4,4 0,8 Q 4,4 4,0 Q 4,-4 0,-8 Z"
          fill="#ff6600"
          opacity="0.9"
        />
        <path
          d="M 0,-4 Q -2,-2 -2,0 Q -2,2 0,4 Q 2,2 2,0 Q 2,-2 0,-4 Z"
          fill="#ffff00"
          opacity="1"
        />
      </g>
    </svg>
  );
}
