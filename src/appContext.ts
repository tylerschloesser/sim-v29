import { createContext } from "react";
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
