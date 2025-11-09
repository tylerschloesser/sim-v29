import { faBorderLeft, faBorderRight } from "@fortawesome/pro-solid-svg-icons";
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
        <Panel
          className={clsx("pointer-events-auto flex", {
            "flex-row": config === "right",
            "flex-row-reverse": config === "left",
          })}
        >
          <MineButton />
          <button className="p-4" onClick={toggleConfig}>
            <FontAwesomeIcon
              icon={config === "left" ? faBorderLeft : faBorderRight}
            />
          </button>
        </Panel>
      </div>
    </div>
  );
}
