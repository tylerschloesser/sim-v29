import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";

interface IconButtonProps {
  faIcon: IconDefinition;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  title?: string;
}

export function IconButton({
  faIcon,
  onClick,
  disabled,
  className,
  title,
}: IconButtonProps) {
  const baseClassName = clsx(
    "p-4",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    className,
  );

  return (
    <button
      className={baseClassName}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      <FontAwesomeIcon icon={faIcon} />
    </button>
  );
}
