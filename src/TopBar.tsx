import { Panel } from "./Panel";

export function TopBar() {
  return (
    <div className="fixed inset-x-0 top-0">
      <div className="p-4">
        <Panel className="p-4">Hello world</Panel>
      </div>
    </div>
  );
}
