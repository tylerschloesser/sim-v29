import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "../TopBar";
import { BottomBar } from "../BottomBar";
import { useCamera } from "../useCamera";
import { useSetEntities } from "../useSetEntities";

export const Route = createFileRoute("/")({
  component: IndexComponent,
});

function IndexComponent() {
  useCamera();
  useSetEntities();

  return (
    <>
      <TopBar />
      <BottomBar />
    </>
  );
}
