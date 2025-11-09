import { Panel } from "./Panel";
import { useHighlightedTile } from "./useHighlightedTile";
import { MineProgress } from "./MineProgress";

export function TopBar() {
  const { tileX, tileY, resource } = useHighlightedTile();

  return (
    <div className="fixed inset-x-0 top-0">
      <div className="p-4">
        <Panel className="p-4">
          <div className="flex gap-4">
            {/* Left column - fills remaining space */}
            <div className="flex-1 flex gap-4">
              <div>
                Tile: ({tileX}, {tileY})
              </div>
              {resource && (
                <div>
                  Resource: {resource.type} ({resource.count})
                </div>
              )}
            </div>

            {/* Right column - mine progress indicator */}
            <MineProgress />
          </div>
        </Panel>
      </div>
    </div>
  );
}
