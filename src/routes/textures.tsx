import { createFileRoute } from "@tanstack/react-router";
import { Fragment } from "react/jsx-runtime";
import { useAppContext } from "../appContext";
import { EntitySVG } from "../components/entity-svgs";
import { BeltSVG } from "../components/entity-svgs/BeltSVG";
import {
  ENTITY_CONFIGS,
  type BeltTurn,
  type EntityConfig,
  type EntityType,
} from "../types";

export const Route = createFileRoute("/textures")({
  component: TexturesComponent,
});

function TexturesComponent() {
  const { textureManager } = useAppContext();

  return (
    <div className="fixed inset-0 bg-white p-8 overflow-auto">
      <div className="grid grid-cols-3 gap-4 max-w-6xl">
        <div className="font-bold text-black border-b-2 border-black pb-2">
          Entity Type
        </div>
        <div className="font-bold text-black border-b-2 border-black pb-2">
          Live SVG
        </div>
        <div className="font-bold text-black border-b-2 border-black pb-2">
          Rasterized Texture
        </div>

        {(Object.entries(ENTITY_CONFIGS) as [EntityType, EntityConfig][]).map(
          ([entityType, config]) => {
            // Special handling for belt - show all 3 variants
            if (entityType === "belt") {
              const beltTurns: BeltTurn[] = ["none", "left", "right"];
              return beltTurns.map((turn) => {
                const textureKey = `belt:${turn}`;
                const dataUrl = textureManager.getDataUrl({
                  type: "belt",
                  turn,
                } as any);

                return (
                  <Fragment key={textureKey}>
                    <div className="text-black flex items-center">
                      belt ({turn})
                    </div>
                    <div className="flex items-center">
                      <div className="border border-black">
                        <BeltSVG config={config} turn={turn} />
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="border border-black">
                        <img
                          src={dataUrl}
                          alt={`belt ${turn} texture`}
                          style={{
                            width: config.size.x * 32,
                            height: config.size.y * 32,
                          }}
                        />
                      </div>
                    </div>
                  </Fragment>
                );
              });
            }

            // Regular entities
            const dataUrl = textureManager.getDataUrl(entityType);
            return (
              <Fragment key={entityType}>
                <div className="text-black flex items-center">{entityType}</div>
                <div className="flex items-center">
                  <div className="border border-black">
                    <EntitySVG entityType={entityType} />
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="border border-black">
                    <img
                      src={dataUrl}
                      alt={`${entityType} texture`}
                      style={{
                        width: config.size.x * 32,
                        height: config.size.y * 32,
                      }}
                    />
                  </div>
                </div>
              </Fragment>
            );
          },
        )}
      </div>
    </div>
  );
}
