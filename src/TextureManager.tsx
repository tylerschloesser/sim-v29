import { Assets, Texture } from "pixi.js";
import { renderToStaticMarkup } from "react-dom/server";
import invariant from "tiny-invariant";
import { EntitySVG } from "./components/entity-svgs";
import { ENTITY_CONFIGS, type EntityType } from "./types";

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

  for (const entityType of Object.keys(ENTITY_CONFIGS) as EntityType[]) {
    // Render React component to static SVG string
    const svgString = renderToStaticMarkup(
      <EntitySVG entityType={entityType} />,
    );

    // Convert SVG string to data URL (using URI encoding to support UTF-8 characters)
    const dataUrl = `data:image/svg+xml,${encodeURIComponent(svgString)}`;

    // Load texture for PixiJS
    const texture = await Assets.load(dataUrl);
    textures[entityType] = { dataUrl, texture };
  }

  return textures as Record<EntityType, { dataUrl: string; texture: Texture }>;
}
