import clsx from "clsx";
import { times } from "lodash-es";

const config: "bottom" | "left" | "right" = "left";

export function BottomBar() {
  return (
    <div className="fixed inset-x-0 bottom-0">
      <div className="p-4">
        <div
          className={clsx("border rounded overflow-hidden", {
            "grid grid-cols-5 grid-rows-2": config === "bottom",
            // prettier-ignore
            "inline-grid grid-cols-2 grid-rows-5": config === "left" || config === "right",
          })}
        >
          {times(10, (i) => (
            <button
              key={i}
              className="p-4"
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
