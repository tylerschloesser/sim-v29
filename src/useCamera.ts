import { useEffect, useRef, useState } from "react";

const CAMERA_SPEED = 5; // pixels per frame for WASD movement

interface CameraState {
  x: number;
  y: number;
}

export function useCamera(onCameraUpdate: (x: number, y: number) => void) {
  const [camera, setCamera] = useState<CameraState>({ x: 0, y: 0 });
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

      setCamera((prev) => {
        const newCamera = {
          x: prev.x - deltaX,
          y: prev.y - deltaY,
        };
        onCameraUpdate(newCamera.x, newCamera.y);
        return newCamera;
      });

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
  }, [onCameraUpdate]);

  // Animation loop for WASD movement
  useEffect(() => {
    let animationFrame: number;

    const updateCameraFromKeys = () => {
      if (keysPressed.current.size > 0) {
        setCamera((prev) => {
          let newX = prev.x;
          let newY = prev.y;

          if (keysPressed.current.has("w")) newY -= CAMERA_SPEED;
          if (keysPressed.current.has("s")) newY += CAMERA_SPEED;
          if (keysPressed.current.has("a")) newX -= CAMERA_SPEED;
          if (keysPressed.current.has("d")) newX += CAMERA_SPEED;

          const newCamera = { x: newX, y: newY };
          onCameraUpdate(newCamera.x, newCamera.y);
          return newCamera;
        });
      }

      animationFrame = requestAnimationFrame(updateCameraFromKeys);
    };

    animationFrame = requestAnimationFrame(updateCameraFromKeys);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [onCameraUpdate]);

  return camera;
}
