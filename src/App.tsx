import { times } from "lodash-es";

export function App() {
  return (
    <div className="fixed inset-0 top-[unset]">
      <div className="p-4">
        <div className="border rounded flex divide-x">
          {times(5, (i) => (
            <button
              key={i}
              className="flex-1 p-2 aspect-square"
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
