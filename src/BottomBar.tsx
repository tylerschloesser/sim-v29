import { faBorderLeft, faBorderRight } from "@fortawesome/pro-solid-svg-icons";
import clsx from "clsx";
import { useState } from "react";
import { MineButton } from "./MineButton";
import { Panel } from "./Panel";
import { HomeButton } from "./HomeButton";
import { BuildButton } from "./BuildButton";
import { IconButton } from "./IconButton";

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
          <PrimaryButton />
          <BuildButton />
          <HomeButton />
          <IconButton
            faIcon={config === "left" ? faBorderLeft : faBorderRight}
            onClick={toggleConfig}
          />
        </Panel>
      </div>
    </div>
  );
}

function PrimaryButton() {
  return <MineButton />;
}
