import { createFileRoute } from "@tanstack/react-router";
import { BottomBar } from "../BottomBar";
import { TopBar } from "../TopBar";

export const Route = createFileRoute("/")({
  component: IndexComponent,
});

function IndexComponent() {
  return (
    <>
      <TopBar />
      <BottomBar />
    </>
  );
}
