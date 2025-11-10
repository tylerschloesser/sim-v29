import { createFileRoute } from "@tanstack/react-router";
import { getAllTextures } from "../TextureManager";
import { ENTITY_CONFIGS } from "../types";

export const Route = createFileRoute("/textures")({
  component: TexturesComponent,
});

function TexturesComponent() {
  const textures = getAllTextures();

  return (
    <div className="fixed inset-0 bg-white p-8 overflow-auto">
      <div className="grid grid-cols-2 gap-4 max-w-4xl">
        <div className="font-bold text-black border-b-2 border-black pb-2">
          Entity Type
        </div>
        <div className="font-bold text-black border-b-2 border-black pb-2">
          Texture
        </div>

        {textures.map(([entityType, dataUrl]) => {
          const config = ENTITY_CONFIGS[entityType];
          return (
            <>
              <div
                key={`${entityType}-label`}
                className="text-black flex items-center"
              >
                {entityType}
              </div>
              <div key={`${entityType}-texture`} className="flex items-center">
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
            </>
          );
        })}
      </div>
    </div>
  );
}
