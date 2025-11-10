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
      <defs>
        {/* Gradient for metallic look */}
        <linearGradient
          id="inserter-gradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor={`#${colorHex}`} stopOpacity={1} />
          <stop
            offset="50%"
            stopColor={`#${((config.color * 1.2) | 0).toString(16).padStart(6, "0")}`}
            stopOpacity={1}
          />
          <stop offset="100%" stopColor={`#${colorHex}`} stopOpacity={1} />
        </linearGradient>

        {/* Diagonal stripes pattern */}
        <pattern
          id="inserter-stripes"
          x="0"
          y="0"
          width="8"
          height="8"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect width="4" height="8" fill="rgba(0,0,0,0.1)" />
        </pattern>
      </defs>

      {/* Background with gradient */}
      <rect width={width} height={height} fill="url(#inserter-gradient)" />

      {/* Stripe pattern overlay */}
      <rect width={width} height={height} fill="url(#inserter-stripes)" />

      {/* Border */}
      <rect
        width={width}
        height={height}
        fill="none"
        stroke="#000000"
        strokeWidth="2"
      />

      {/* Inserter arm/claw in center */}
      <g transform={`translate(${width / 2}, ${height / 2})`}>
        {/* Base circle */}
        <circle cx="0" cy="0" r="6" fill="rgba(0,0,0,0.4)" />
        <circle cx="0" cy="0" r="4" fill="rgba(255,255,255,0.3)" />

        {/* Arrow/claw pointing right */}
        <path
          d="M 2,0 L 10,0 L 10,-4 L 16,0 L 10,4 L 10,0 Z"
          fill="rgba(255,255,255,0.6)"
          stroke="rgba(0,0,0,0.5)"
          strokeWidth="1"
        />

        {/* Claw pincers */}
        <path
          d="M 14,-2 L 16,-4"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="2"
        />
        <path
          d="M 14,2 L 16,4"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="2"
        />

        {/* Rotation indicator */}
        <circle
          cx="0"
          cy="0"
          r="8"
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1"
          strokeDasharray="2,2"
        />
      </g>
    </svg>
  );
}
