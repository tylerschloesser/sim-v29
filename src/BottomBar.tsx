import { times } from "lodash-es";

export function BottomBar() {
  return (
    <div className="fixed inset-0 top-[unset]">
      <div className="p-4">
        <div className="border rounded flex flex-col divide-y">
          <div className="flex divide-x">
            {times(5, (i) => (
              <button
                key={i}
                className="flex-1 py-4"
                onClick={() => alert(`Button ${i + 1} clicked`)}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div className="flex divide-x">
            {times(5, (i) => (
              <button
                key={i}
                className="flex-1 py-4"
                onClick={() => alert(`Button ${i + 6} clicked`)}
              >
                {i + 6}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
