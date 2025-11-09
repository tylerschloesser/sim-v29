import { TopBar } from "./TopBar";
import { BottomBar } from "./BottomBar";
import { useCamera } from "./useCamera";

interface AppProps {
  updateCamera: (x: number, y: number) => void;
}

export function App({ updateCamera }: AppProps) {
  useCamera(updateCamera);

  return (
    <>
      <TopBar />
      <BottomBar />
    </>
  );
}
