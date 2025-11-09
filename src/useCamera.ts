import { useEffect, useRef } from "react";
import { useSetCamera } from "./useSetCamera";

const CAMERA_SPEED = 5; // pixels per frame for WASD movement

export function useCamera() {
  const setCamera = useSetCamera();
  const keysPressed = useRef<Set<string>>(new Set());
  const isDragging = useRef(false);
  const lastPointerPos = useRef({ x: 0, y: 0 });

  // WASD keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (["w", "a", "s", "d"].includes(key)) {
        keysPressed.current.add(key);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysPressed.current.delete(key);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Pointer drag controls (supports mouse, touch, and pen)
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      isDragging.current = true;
      lastPointerPos.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;

      const deltaX = e.clientX - lastPointerPos.current.x;
      const deltaY = e.clientY - lastPointerPos.current.y;

      setCamera((state) => ({
        x: state.camera.x - deltaX,
        y: state.camera.y - deltaY,
      }));

      lastPointerPos.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = () => {
      isDragging.current = false;
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [setCamera]);

  // Animation loop for WASD movement
  useEffect(() => {
    let animationFrame: number;

    const updateCameraFromKeys = () => {
      if (keysPressed.current.size > 0) {
        setCamera((state) => {
          let newX = state.camera.x;
          let newY = state.camera.y;
          if (keysPressed.current.has("w")) newY -= CAMERA_SPEED;
          if (keysPressed.current.has("s")) newY += CAMERA_SPEED;
          if (keysPressed.current.has("a")) newX -= CAMERA_SPEED;
          if (keysPressed.current.has("d")) newX += CAMERA_SPEED;
          return { x: newX, y: newY };
        });
      }

      animationFrame = requestAnimationFrame(updateCameraFromKeys);
    };

    animationFrame = requestAnimationFrame(updateCameraFromKeys);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [setCamera]);
}
