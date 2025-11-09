import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/build")({
  component: BuildComponent,
});

function BuildComponent() {
  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-2xl">hello world</div>
      </div>
    </>
  );
}
