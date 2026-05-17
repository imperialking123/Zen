// Listens for touch events and determines whether user slide left or right on screen
// Takes Functions and run them

import { useEffect, type RefObject } from "react";

function useSlideAction({
  containerRef,
  slideLeftFunction,
  slideRightFunction,
}: {
  containerRef: RefObject<HTMLDivElement | null>;
  slideLeftFunction: () => void;
  slideRightFunction: () => void;
}) {
  useEffect(() => {
    let startX: number = 0;
    let endX: number = 0;
    const element = containerRef.current;
    if (!element) return; // ← Guard against null

    const handleTouchStart = (event: TouchEvent) => {
      const touchX = event.touches[0].clientX;
      startX = touchX;
      endX = touchX;
    };

    const handleTouchMove = (event: TouchEvent) => {
      const touchX = event.touches[0].clientX;
      endX = touchX;
    };

    const handleTouchEnd = () => {
      const distance = startX - endX;

      if (distance > 50) {
        slideLeftFunction();
      } else if (distance < -50) {
        slideRightFunction();
      }
    };

    // Use addEventListener
    element.addEventListener("touchstart", handleTouchStart);
    element.addEventListener("touchmove", handleTouchMove);
    element.addEventListener("touchend", handleTouchEnd);

    // Cleanup function
    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
    };
  }, [containerRef, slideLeftFunction, slideRightFunction]);
}

export default useSlideAction;





