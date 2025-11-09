import clsx from "clsx";
import { type ReactNode } from "react";

export function Panel({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={clsx(
        "bg-black/50 backdrop-blur-xs",
        "border rounded",
        className,
      )}
    >
      {children}
    </div>
  );
}
