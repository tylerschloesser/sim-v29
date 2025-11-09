import { type ReactNode } from "react";
import { useImmer } from "use-immer";
import type { AppState, Chunk, ChunkId, Entity, EntityId } from "./types";
import { AppContext } from "./appContext";
import { useTicker } from "./useTicker";

interface AppContextProviderProps {
  initialState: AppState;
  updateCamera: (x: number, y: number) => void;
  updateChunks: (
    visibleChunkIds: ChunkId[],
    chunkMap: Map<ChunkId, Chunk>,
  ) => void;
  updateEntities: (entities: Map<EntityId, Entity>) => void;
  children: ReactNode;
}

export function AppContextProvider({
  initialState,
  updateCamera,
  updateChunks,
  updateEntities,
  children,
}: AppContextProviderProps) {
  const [state, updateState] = useImmer<AppState>(initialState);

  // Initialize ticker to auto-update action progress at 60 ticks/second
  useTicker(updateState);

  return (
    <AppContext.Provider
      value={{ state, updateState, updateCamera, updateChunks, updateEntities }}
    >
      {children}
    </AppContext.Provider>
  );
}
