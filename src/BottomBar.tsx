import {
  faBorderBottom,
  faBorderLeft,
  faBorderRight,
} from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";
import { times } from "lodash-es";
import { useState } from "react";

export function BottomBar() {
  const [config, setConfig] = useState<"bottom" | "left" | "right">("right");

  const toggleConfig = () => {
    setConfig((current) => {
      if (current === "right") return "bottom";
      if (current === "bottom") return "left";
      return "right";
    });
  };

  return (
    <div className="fixed inset-x-0 bottom-0">
      <div
        className={clsx("flex p-4", {
          "justify-end": config === "right",
          "justify-start": config === "left",
        })}
      >
        <div
          className={clsx("border rounded", {
            "flex-1 grid grid-cols-5 grid-rows-2": config === "bottom",
            // prettier-ignore
            "inline-grid grid-cols-2 grid-rows-5": config === "left" || config === "right",
          })}
        >
          {times(10, (i) => (
            <button
              key={i}
              className="p-4"
              onClick={() => {
                if (i === 0) {
                  toggleConfig();
                } else {
                  alert(`Button ${i + 1} clicked`);
                }
              }}
            >
              {i === 0 ? (
                <FontAwesomeIcon
                  icon={
                    config === "bottom"
                      ? faBorderBottom
                      : config === "left"
                        ? faBorderLeft
                        : faBorderRight
                  }
                />
              ) : (
                <>{i + 1}</>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
