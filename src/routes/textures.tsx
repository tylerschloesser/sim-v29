import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/textures")({
  component: TexturesComponent,
});

function TexturesComponent() {
  return (
    <div className="fixed inset-0 flex bg-white/50">
      <div className="text-black">hello world</div>
    </div>
  );
}
