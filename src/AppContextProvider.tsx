import { type ReactNode } from "react";
import { useImmer } from "use-immer";
import type { AppState } from "./types";
import { AppContext } from "./appContext";
import { useTicker } from "./useTicker";
import type { PixiController } from "./PixiController";
import type { TextureManager } from "./TextureManager";

interface AppContextProviderProps {
  initialState: AppState;
  controller: PixiController;
  textureManager: TextureManager;
  children: ReactNode;
}

export function AppContextProvider({
  initialState,
  controller,
  textureManager,
  children,
}: AppContextProviderProps) {
  const [state, updateState] = useImmer<AppState>(initialState);

  // Initialize ticker to auto-update action progress at 60 ticks/second
  useTicker(updateState);

  return (
    <AppContext.Provider
      value={{ state, updateState, pixiController: controller, textureManager }}
    >
      {children}
    </AppContext.Provider>
  );
}
