import { ENTITY_CONFIGS, type EntityType } from "../../types";
import { BurnerInserterSVG } from "./BurnerInserterSVG";
import { BurnerMiningDrillSVG } from "./BurnerMiningDrillSVG";
import { HomeStorageSVG } from "./HomeStorageSVG";
import { StoneFurnaceSVG } from "./StoneFurnaceSVG";

export interface EntitySVGProps {
  entityType: EntityType;
}

/**
 * Main component that renders the appropriate SVG for an entity type.
 * Can be used both for generating PixiJS textures and rendering in React UI.
 */
export function EntitySVG({ entityType }: EntitySVGProps) {
  const config = ENTITY_CONFIGS[entityType];

  switch (entityType) {
    case "stone-furnace":
      return <StoneFurnaceSVG config={config} />;
    case "home-storage":
      return <HomeStorageSVG config={config} />;
    case "burner-inserter":
      return <BurnerInserterSVG config={config} />;
    case "burner-mining-drill":
      return <BurnerMiningDrillSVG config={config} />;
    default: {
      // TypeScript exhaustiveness check
      const _exhaustive: never = entityType;
      throw new Error(`Unknown entity type: ${_exhaustive}`);
    }
  }
}
