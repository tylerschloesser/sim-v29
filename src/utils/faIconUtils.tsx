import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import invariant from "tiny-invariant";

interface FAIconSVGProps {
  icon: IconDefinition;
  size?: number; // Display size in pixels (default: 16)
  x?: number; // X position (default: 0)
  y?: number; // Y position (default: 0)
  fill?: string; // Fill color (default: "#000000")
}

/**
 * Renders a FontAwesome icon as SVG path elements within a larger SVG component.
 * This extracts the raw path data from a FontAwesome icon definition and renders it
 * with proper scaling and positioning.
 *
 * @example
 * ```tsx
 * import { faEnvelope } from "@fortawesome/pro-solid-svg-icons";
 *
 * <svg width={64} height={64}>
 *   <rect width={64} height={64} fill="#cccccc" />
 *   <FAIconSVG icon={faEnvelope} size={16} x={32} y={32} fill="#000000" />
 * </svg>
 * ```
 */
export function FAIconSVG({
  icon,
  size = 16,
  x = 0,
  y = 0,
  fill = "#000000",
}: FAIconSVGProps) {
  // Extract icon data: [width, height, ligatures, unicode, pathData]
  const [iconWidth, iconHeight, , , svgPathData] = icon.icon;
  invariant(
    iconWidth === 512 || iconHeight === 512,
    "Unexpected icon dimensions",
  );

  // Calculate scale to fit icon into desired display size
  const scale = size / 512;

  // Center the icon at the given x,y position
  const translateX = x - (iconWidth * scale) / 2;
  const translateY = y - (iconHeight * scale) / 2;

  return (
    <g transform={`translate(${translateX}, ${translateY}) scale(${scale})`}>
      {Array.isArray(svgPathData) ? (
        // Handle icons with multiple paths
        svgPathData.map((pathString, index) => (
          <path key={index} d={pathString} fill={fill} />
        ))
      ) : (
        // Handle icons with a single path (most common)
        <path d={svgPathData} fill={fill} />
      )}
    </g>
  );
}
