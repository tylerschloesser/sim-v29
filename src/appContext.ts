import { createContext, useContext } from "react";
import type { AppState } from "./types";
import type { PixiController } from "./PixiController";

export interface AppContextType {
  state: AppState;
  updateState: (updater: (draft: AppState) => void) => void;
  pixiController: PixiController;
}

export const AppContext = createContext<AppContextType | null>(null);

export function useAppContext(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppContextProvider");
  }
  return context;
}
