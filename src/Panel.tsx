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
        "pointer-events-auto",
        "border rounded",
        className,
      )}
    >
      {children}
    </div>
  );
}
