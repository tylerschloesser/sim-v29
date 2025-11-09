import { times } from "lodash-es";

export function BottomBar() {
  return (
    <div className="fixed inset-x-0 bottom-0">
      <div className="p-4">
        <div className="border rounded overflow-hidden grid grid-cols-5 grid-rows-2">
          {times(10, (i) => (
            <button
              key={i}
              className="py-4"
              onClick={() => alert(`Button ${i + 1} clicked`)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
