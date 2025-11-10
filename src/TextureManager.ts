import { Assets, Texture } from "pixi.js";
import invariant from "tiny-invariant";
import { ENTITY_CONFIGS, TILE_SIZE, type EntityType } from "./types";

export class TextureManager {
  private textures: Record<EntityType, { dataUrl: string; texture: Texture }>;

  constructor(
    textures: Record<EntityType, { dataUrl: string; texture: Texture }>,
  ) {
    this.textures = textures;
  }

  getDataUrl(entityType: EntityType): string | undefined {
    const entry = this.textures[entityType];
    invariant(entry, `Texture for entity type ${entityType} not found`);
    return entry.dataUrl;
  }

  getTexture(entityType: EntityType): Texture {
    const entry = this.textures[entityType];
    invariant(entry, `Texture for entity type ${entityType} not found`);
    return entry.texture;
  }
}

/**
 * Initializes the TextureManager after PixiJS is set up.
 * Creates both data URLs (for React) and PixiJS Textures.
 */
export async function initializeTextures(): Promise<TextureManager> {
  const textures = await generateTextures();
  return new TextureManager(textures);
}

async function generateTextures(): Promise<
  Record<EntityType, { dataUrl: string; texture: Texture }>
> {
  const textures: Partial<
    Record<EntityType, { dataUrl: string; texture: Texture }>
  > = {};

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

    const dataUrl = `data:image/svg+xml;base64,${btoa(svg)}`;

    const texture = await Assets.load(dataUrl);
    textures[entityType as EntityType] = { dataUrl, texture };
  }

  return textures as Record<EntityType, { dataUrl: string; texture: Texture }>;
}
