import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { createLink, type LinkComponent } from "@tanstack/react-router";
import clsx from "clsx";
import React from "react";

interface IconLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  faIcon: IconDefinition;
  className?: string;
}

const IconLinkComponent = React.forwardRef<HTMLAnchorElement, IconLinkProps>(
  ({ faIcon, className, ...props }, ref) => (
    <a ref={ref} {...props} className={clsx("p-4", className)}>
      <FontAwesomeIcon icon={faIcon} />
    </a>
  ),
);

const CreatedIconLinkComponent = createLink(IconLinkComponent);

export const IconLink: LinkComponent<typeof IconLinkComponent> = (props) => {
  return <CreatedIconLinkComponent preload="intent" {...props} />;
};
