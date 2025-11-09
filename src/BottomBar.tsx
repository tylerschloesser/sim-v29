import {
  faBorderBottom,
  faBorderLeft,
  faBorderRight,
  faDrawSquare,
  faGear,
  faHammer,
  faHouse,
  faPickaxe,
  faSquareInfo,
  faSquarePlus,
} from "@fortawesome/pro-solid-svg-icons";
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
    <div className="fixed inset-x-0 bottom-0 pointer-events-none">
      <div
        className={clsx("flex p-4", {
          "justify-end": config === "right",
          "justify-start": config === "left",
        })}
      >
        <div
          className={clsx("pointer-events-auto", "border rounded", {
            "flex-1 grid grid-cols-5 grid-rows-2": config === "bottom",
            // prettier-ignore
            "inline-grid grid-cols-2 grid-rows-5": config === "left" || config === "right",
          })}
        >
          <button className="p-4" onClick={toggleConfig}>
            <FontAwesomeIcon
              icon={
                config === "bottom"
                  ? faBorderBottom
                  : config === "left"
                    ? faBorderLeft
                    : faBorderRight
              }
            />
          </button>
          <button className="p-4">
            <FontAwesomeIcon icon={faPickaxe} />
          </button>
          <button className="p-4">
            <FontAwesomeIcon icon={faGear} />
          </button>
          <button className="p-4">
            <FontAwesomeIcon icon={faHouse} />
          </button>
          <button className="p-4">
            <FontAwesomeIcon icon={faHammer} />
          </button>
          <button className="p-4">
            <FontAwesomeIcon icon={faDrawSquare} />
          </button>
          <button className="p-4">
            <FontAwesomeIcon icon={faSquareInfo} />
          </button>
          <button className="p-4">
            <FontAwesomeIcon icon={faSquarePlus} />
          </button>
          {times(2, (i) => (
            <button
              key={i}
              className="p-4"
              onClick={() => {
                alert(`Button ${i + 1} clicked`);
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
