import { TopBar } from "./TopBar";
import { BottomBar } from "./BottomBar";
import { useCamera } from "./useCamera";
import { updateCamera } from "./pixi";

export function App() {
  useCamera(updateCamera);

  return (
    <>
      <TopBar />
      <BottomBar />
    </>
  );
}
