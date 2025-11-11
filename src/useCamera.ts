import { useEffect, useRef } from "react";
import { useSetCamera } from "./useSetCamera";
import { CAMERA_SPEED } from "./constants";

export function useCamera() {
  const setCamera = useSetCamera();
  const keysPressed = useRef<Set<string>>(new Set());
  const activePointerId = useRef<number | null>(null);
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
  // Only tracks the first pointer to ignore multi-touch
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      // Only start dragging if no pointer is already active
      if (activePointerId.current === null) {
        activePointerId.current = e.pointerId;
        lastPointerPos.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      // Only process movement from the active pointer
      if (activePointerId.current !== e.pointerId) return;

      const deltaX = e.clientX - lastPointerPos.current.x;
      const deltaY = e.clientY - lastPointerPos.current.y;

      setCamera((state) => ({
        x: state.camera.x - deltaX,
        y: state.camera.y - deltaY,
      }));

      lastPointerPos.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = (e: PointerEvent) => {
      // Only end dragging if it's the active pointer
      if (activePointerId.current === e.pointerId) {
        activePointerId.current = null;
      }
    };

    const handlePointerCancel = (e: PointerEvent) => {
      // Handle pointer cancellation (e.g., browser UI intervention)
      if (activePointerId.current === e.pointerId) {
        activePointerId.current = null;
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerCancel);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerCancel);
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
