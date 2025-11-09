import { type ReactNode } from "react";
import { useImmer } from "use-immer";
import type { AppState, Chunk, ChunkId } from "./types";
import { AppContext } from "./appContext";

interface AppContextProviderProps {
  initialState: AppState;
  updateCamera: (x: number, y: number) => void;
  updateChunks: (
    visibleChunkIds: ChunkId[],
    chunkMap: Map<ChunkId, Chunk>,
  ) => void;
  children: ReactNode;
}

export function AppContextProvider({
  initialState,
  updateCamera,
  updateChunks,
  children,
}: AppContextProviderProps) {
  const [state, updateState] = useImmer<AppState>(initialState);

  return (
    <AppContext.Provider
      value={{ state, updateState, updateCamera, updateChunks }}
    >
      {children}
    </AppContext.Provider>
  );
}
