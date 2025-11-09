import { createContext, useContext } from "react";
import type { AppState, Chunk, ChunkId } from "./types";

export interface AppContextType {
  state: AppState;
  updateState: (updater: (draft: AppState) => void) => void;
  updateCamera: (x: number, y: number) => void;
  updateChunks: (
    visibleChunkIds: ChunkId[],
    chunkMap: Map<ChunkId, Chunk>,
  ) => void;
}

export const AppContext = createContext<AppContextType | null>(null);

export function useAppContext(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppContextProvider");
  }
  return context;
}
