import {
  faBorderLeft,
  faBorderRight,
  faChartLine,
  faDrawSquare,
  faGear,
  faHammer,
  faHouse,
  faSquareInfo,
  faSquarePlus,
} from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";
import { useState } from "react";
import { MineButton } from "./MineButton";
import { Panel } from "./Panel";

export function BottomBar() {
  const [config, setConfig] = useState<"left" | "right">("right");

  const toggleConfig = () => {
    setConfig((current) => {
      return current === "right" ? "left" : "right";
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
        <Panel className={clsx("pointer-events-auto")}>
          <button className="p-4" onClick={toggleConfig}>
            <FontAwesomeIcon
              icon={config === "left" ? faBorderLeft : faBorderRight}
            />
          </button>
          <MineButton />
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
          <button className="p-4">
            <FontAwesomeIcon icon={faChartLine} />
          </button>
        </Panel>
      </div>
    </div>
  );
}
