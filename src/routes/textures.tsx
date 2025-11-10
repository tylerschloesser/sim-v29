import { createFileRoute } from "@tanstack/react-router";
import { Fragment } from "react/jsx-runtime";
import { useAppContext } from "../appContext";
import { ENTITY_CONFIGS, type EntityConfig, type EntityType } from "../types";

export const Route = createFileRoute("/textures")({
  component: TexturesComponent,
});

function TexturesComponent() {
  const { textureManager } = useAppContext();

  return (
    <div className="fixed inset-0 bg-white p-8 overflow-auto">
      <div className="grid grid-cols-2 gap-4 max-w-4xl">
        <div className="font-bold text-black border-b-2 border-black pb-2">
          Entity Type
        </div>
        <div className="font-bold text-black border-b-2 border-black pb-2">
          Texture
        </div>

        {(Object.entries(ENTITY_CONFIGS) as [EntityType, EntityConfig][]).map(
          ([entityType, config]) => {
            const dataUrl = textureManager.getDataUrl(entityType);
            return (
              <Fragment key={entityType}>
                <div
                  key={`${entityType}-label`}
                  className="text-black flex items-center"
                >
                  {entityType}
                </div>
                <div
                  key={`${entityType}-texture`}
                  className="flex items-center"
                >
                  <img
                    src={dataUrl}
                    alt={`${entityType} texture`}
                    className="border border-black"
                    style={{
                      width: config.size.x * 32,
                      height: config.size.y * 32,
                    }}
                  />
                </div>
              </Fragment>
            );
          },
        )}
      </div>
    </div>
  );
}
