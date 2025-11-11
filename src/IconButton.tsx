import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { Link } from "@tanstack/react-router";
import clsx from "clsx";

interface IconButtonProps {
  faIcon: IconDefinition;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  to?: string;
  title?: string;
}

export function IconButton({
  faIcon,
  onClick,
  disabled,
  className,
  to,
  title,
}: IconButtonProps) {
  const baseClassName = clsx(
    "p-4",
    !to && "disabled:opacity-50 disabled:cursor-not-allowed",
    className,
  );

  if (to) {
    return (
      <Link to={to} className={baseClassName} title={title}>
        <FontAwesomeIcon icon={faIcon} />
      </Link>
    );
  }

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
