import { faHammer } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "@tanstack/react-router";

export function BuildButton() {
  return (
    <Link to="/build" className="p-4">
      <FontAwesomeIcon icon={faHammer} />
    </Link>
  );
}
