/**
 * Converts HSL color string to hex string for SVG usage
 * @param hsl - HSL color string in format "hsl(h, s%, l%)"
 * @returns Hex color string in format "#RRGGBB"
 */
export function hslToHex(hsl: string): string {
  // Parse HSL string
  const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) {
    throw new Error(`Invalid HSL color format: ${hsl}`);
  }

  const h = parseInt(match[1], 10);
  const s = parseInt(match[2], 10) / 100;
  const l = parseInt(match[3], 10) / 100;

  // Convert HSL to RGB
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (h >= 0 && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (h >= 300 && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  // Convert to 0-255 range and format as hex
  const toHex = (value: number) => {
    const hex = Math.round((value + m) * 255).toString(16);
    return hex.padStart(2, "0");
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Converts HSL color string to PixiJS number format (0xRRGGBB)
 * @param hsl - HSL color string in format "hsl(h, s%, l%)"
 * @returns Number in PixiJS color format (0xRRGGBB)
 */
export function hslToPixi(hsl: string): number {
  const hex = hslToHex(hsl);
  return parseInt(hex.slice(1), 16);
}
