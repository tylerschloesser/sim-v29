import { type ReactNode } from "react";
import { useImmer } from "use-immer";
import type { AppState } from "./types";
import { AppContext } from "./appContext";
import { useTicker } from "./useTicker";
import type { PixiController } from "./PixiController";

interface AppContextProviderProps {
  initialState: AppState;
  controller: PixiController;
  children: ReactNode;
}

export function AppContextProvider({
  initialState,
  controller,
  children,
}: AppContextProviderProps) {
  const [state, updateState] = useImmer<AppState>(initialState);

  // Initialize ticker to auto-update action progress at 60 ticks/second
  useTicker(updateState);

  return (
    <AppContext.Provider
      value={{ state, updateState, pixiController: controller }}
    >
      {children}
    </AppContext.Provider>
  );
}
