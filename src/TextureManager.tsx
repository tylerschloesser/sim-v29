import { Assets, Texture } from "pixi.js";
import { renderToStaticMarkup } from "react-dom/server";
import invariant from "tiny-invariant";
import { EntitySVG } from "./components/entity-svgs";
import { BeltSVG } from "./components/entity-svgs/BeltSVG";
import {
  ENTITY_CONFIGS,
  type Entity,
  type EntityType,
  type BeltTurn,
} from "./types";

type TextureKey = string; // Format: "entityType" or "entityType:variant"

export class TextureManager {
  private textures: Map<TextureKey, { dataUrl: string; texture: Texture }>;

  constructor(
    textures: Map<TextureKey, { dataUrl: string; texture: Texture }>,
  ) {
    this.textures = textures;
  }

  /**
   * Gets the texture key for an entity.
   * For belts: "belt:none", "belt:left", or "belt:right"
   * For other entities: just the entity type
   */
  private getTextureKey(entityOrType: Entity | EntityType): TextureKey {
    if (typeof entityOrType === "string") {
      // EntityType passed - use default variant
      if (entityOrType === "belt") {
        return "belt:none";
      }
      return entityOrType;
    }

    // Entity object passed - check for variants
    const entity = entityOrType;
    if (entity.type === "belt") {
      return `belt:${entity.turn}`;
    }

    return entity.type;
  }

  getDataUrl(entityOrType: Entity | EntityType): string | undefined {
    const key = this.getTextureKey(entityOrType);
    const entry = this.textures.get(key);
    invariant(entry, `Texture for key ${key} not found`);
    return entry.dataUrl;
  }

  getTexture(entityOrType: Entity | EntityType): Texture {
    const key = this.getTextureKey(entityOrType);
    const entry = this.textures.get(key);
    invariant(entry, `Texture for key ${key} not found`);
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
  Map<TextureKey, { dataUrl: string; texture: Texture }>
> {
  const textures = new Map<TextureKey, { dataUrl: string; texture: Texture }>();

  for (const entityType of Object.keys(ENTITY_CONFIGS) as EntityType[]) {
    // Special handling for belt entity - generate 3 variants
    if (entityType === "belt") {
      const beltTurns: BeltTurn[] = ["none", "left", "right"];
      const config = ENTITY_CONFIGS.belt;

      for (const turn of beltTurns) {
        // Render BeltSVG with turn variant
        const svgString = renderToStaticMarkup(
          <BeltSVG config={config} turn={turn} />,
        );

        // Convert SVG string to data URL
        const dataUrl = `data:image/svg+xml,${encodeURIComponent(svgString)}`;

        // Load texture for PixiJS
        const texture = await Assets.load(dataUrl);
        const key = `belt:${turn}`;
        textures.set(key, { dataUrl, texture });
      }
    } else {
      // Regular entity - single texture
      const svgString = renderToStaticMarkup(
        <EntitySVG entityType={entityType} />,
      );

      const dataUrl = `data:image/svg+xml,${encodeURIComponent(svgString)}`;
      const texture = await Assets.load(dataUrl);
      textures.set(entityType, { dataUrl, texture });
    }
  }

  return textures;
}
