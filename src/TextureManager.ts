import { Assets, Texture, type UnresolvedAsset } from "pixi.js";
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
  const urls = Object.entries(ENTITY_CONFIGS).map<UnresolvedAsset>(
    ([entityType, config]) => {
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
      return {
        alias: entityType,
        src: `data:image/svg+xml;base64,${btoa(svg)}`,
      };
    },
  );

  await Assets.load(urls);

  return Object.fromEntries(
    urls.map(({ alias, url: dataUrl }) => {
      invariant(typeof alias === "string", "Alias must be a string");
      const texture = Assets.get(alias) as Texture;
      invariant(texture instanceof Texture, "Loaded asset must be a Texture");
      return [alias as EntityType, { dataUrl, texture }];
    }),
  ) as Record<EntityType, { dataUrl: string; texture: Texture }>;
}
