import { ENTITY_CONFIGS, TILE_SIZE, type EntityType } from "./types";

const textures = new Map<EntityType, string>();

/**
 * Generates SVG-based textures for all entity types.
 * Creates solid colored rectangles matching entity dimensions and colors.
 * Must be called before textures are accessed.
 */
export function generateTextures(): void {
  for (const [entityType, config] of Object.entries(ENTITY_CONFIGS)) {
    const width = config.size.x * TILE_SIZE;
    const height = config.size.y * TILE_SIZE;

    // Convert hex color to CSS format
    const colorHex = config.color.toString(16).padStart(6, "0");

    // Create SVG string with solid colored rectangle
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
        <rect width="${width}" height="${height}" fill="#${colorHex}" />
      </svg>
    `.trim();

    // Convert SVG to data URL
    const dataUrl = `data:image/svg+xml;base64,${btoa(svg)}`;

    textures.set(entityType as EntityType, dataUrl);
  }
}

/**
 * Retrieves the texture data URL for a given entity type.
 * Returns undefined if the texture hasn't been generated yet.
 */
export function getTexture(entityType: EntityType): string | undefined {
  return textures.get(entityType);
}

/**
 * Gets all generated textures as an array of [entityType, dataUrl] pairs.
 */
export function getAllTextures(): Array<[EntityType, string]> {
  return Array.from(textures.entries());
}
