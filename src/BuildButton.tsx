import { faHammer } from "@fortawesome/pro-solid-svg-icons";
import { IconButton } from "./IconButton";

export function BuildButton() {
  return <IconButton faIcon={faHammer} to="/build" />;
}
