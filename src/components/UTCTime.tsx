// UTCTime.tsx
// Redesigned React component with Sleek Glassmorphism design
// Displays UTC time in DD on top, HHMMz below when expanded
// Shows ZULU text and clock icon when collapsed
import React, { useEffect, useState, useRef, useCallback } from "react";

// NOTE: We are adding a simple, global flag on the window object.
// This is a lightweight and effective way to ensure that across the entire
// application, only one instance of this component can ever be active.
const GLOBAL_INSTANCE_FLAG = "__UTC_TIME_WIDGET_INSTANCE_EXISTS__";

const COMPONENT_ID = "utc-time-widget";

// Extend Window interface to include our custom flag
declare global {
  interface Window {
    [key: string]: any;
  }
}

interface PointerCoords {
  x: number;
  y: number;
}

// Define the UTCTime component
const UTCTime: React.FC = () => {
  // State to hold the current date parts
  const [currentDay, setCurrentDay] = useState<string>("");
  const [currentTime, setCurrentTime] = useState<string>("");
  // State to control if clock is visible
  const [isVisible, setIsVisible] = useState<boolean>(false);
  // State to control vertical position
  const [position, setPosition] = useState<number>(() => {
    // Get saved position from sessionStorage or default to 50%
    const saved: string | null = sessionStorage.getItem("utc-clock-position");
    return saved ? parseFloat(saved) : 50;
  });
  // State to track if dragging
  const [isDragging, setIsDragging] = useState<boolean>(false);
  // State to track if drag actually happened
  const [hasDragged, setHasDragged] = useState<boolean>(false);

  // ADDITION: This new state determines if this specific instance is the "primary" one.
  const [isPrimaryInstance, setIsPrimaryInstance] = useState<boolean>(false);

  // Ref for the draggable element
  const dragRef = useRef<HTMLDivElement | null>(null);
  // Ref to track initial pointer position (mouse or touch)
  const dragStartRef = useRef<PointerCoords>({ x: 0, y: 0 });

  // This is the "safety net" effect. It runs once when the component mounts.
  useEffect(() => {
    // If the global flag is already set, it means another instance is active.
    // This instance will do nothing.
    if (window[GLOBAL_INSTANCE_FLAG]) {
      return;
    }

    // If the flag is not set, this is the first and only instance.
    // Set the global flag to true.
    window[GLOBAL_INSTANCE_FLAG] = true;
    // Mark this instance as the primary one so it will render.
    setIsPrimaryInstance(true);

    // The cleanup function will run when the primary instance is unmounted
    // (e.g., the user closes the web app).
    return () => {
      window[GLOBAL_INSTANCE_FLAG] = false;
    };
  }, []); // Empty array ensures this runs only on mount.

  // Save position to sessionStorage
  useEffect(() => {
    // Only the primary instance should save its position.
    if (!isPrimaryInstance) return;
    sessionStorage.setItem("utc-clock-position", position.toString());
  }, [position, isPrimaryInstance]);

  // Update the time
  useEffect(() => {
    // Only the primary instance should run the timer logic.
    if (!isPrimaryInstance) return;

    const updateFormattedDate = (): void => {
      const date: Date = new Date();
      const day: string = String(date.getUTCDate()).padStart(2, "0");
      const hour: string = String(date.getUTCHours()).padStart(2, "0");
      const minute: string = String(date.getUTCMinutes()).padStart(2, "0");

      setCurrentDay(day);
      setCurrentTime(`${hour}${minute}Z`);
    };

    updateFormattedDate();
    const intervalId: NodeJS.Timeout = setInterval(updateFormattedDate, 60000);
    return () => clearInterval(intervalId);
  }, [isPrimaryInstance]);

  // The drag-and-drop logic remains the same.
  const getPointerCoords = (
    e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent,
  ): PointerCoords => {
    if ("touches" in e && e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return {
      x: (e as React.MouseEvent | MouseEvent).clientX,
      y: (e as React.MouseEvent | MouseEvent).clientY,
    };
  };

  const handlePointerMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const coords: PointerCoords = getPointerCoords(e);
      const deltaX: number = Math.abs(coords.x - dragStartRef.current.x);
      const deltaY: number = Math.abs(coords.y - dragStartRef.current.y);
      if (deltaX > 3 || deltaY > 3) setHasDragged(true);
      const windowHeight: number = window.innerHeight;
      const elementHeight: number = dragRef.current?.offsetHeight || 50;
      const pointerY: number = coords.y;
      const minY: number = elementHeight / 2;
      const maxY: number = windowHeight - elementHeight / 2;
      const constrainedY: number = Math.max(minY, Math.min(maxY, pointerY));
      const percentage: number = (constrainedY / windowHeight) * 100;
      setPosition(percentage);
    },
    [isDragging],
  );

  const handlePointerUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      document.body.style.touchAction = "";
      setTimeout(() => setHasDragged(false), 100);
    }
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      document.body.style.userSelect = "none";
      document.body.style.cursor = "grabbing";
      document.body.style.touchAction = "none";
      document.addEventListener("mousemove", handlePointerMove);
      document.addEventListener("mouseup", handlePointerUp);
      document.addEventListener("touchmove", handlePointerMove, {
        passive: false,
      });
      document.addEventListener("touchend", handlePointerUp);
      document.addEventListener("touchcancel", handlePointerUp);
      return () => {
        document.removeEventListener("mousemove", handlePointerMove);
        document.removeEventListener("mouseup", handlePointerUp);
        document.removeEventListener("touchmove", handlePointerMove);
        document.removeEventListener("touchend", handlePointerUp);
        document.removeEventListener("touchcancel", handlePointerUp);
      };
    }
  }, [isDragging, handlePointerMove, handlePointerUp]);

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    const coords: PointerCoords = getPointerCoords(e);
    dragStartRef.current = { x: coords.x, y: coords.y };
    setHasDragged(false);
    setIsDragging(true);
  };

  const handleClick = (e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    if (!hasDragged && !isDragging) setIsVisible(!isVisible);
  };

  // This is the final gate. If this is not the primary instance, render nothing.
  if (!isPrimaryInstance) {
    return null;
  }

  // If this IS the primary instance, render the clock.
  return (
    <div
      id={COMPONENT_ID}
      className="utc-glass__container"
      style={{ top: `${position}%` }}
      ref={dragRef}
    >
      <button
        className={`utc-glass__widget ${isVisible ? "utc-glass__widget--expanded" : "utc-glass__widget--collapsed"} ${isDragging ? "utc-glass__widget--dragging" : ""}`}
        onClick={handleClick}
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
        aria-label="Toggle UTC Clock"
        style={{ touchAction: "none" }}
      >
        {!isVisible ? (
          <div className="utc-glass__collapsed-content">
            <div className="utc-glass__clock-icon">🕐</div>
            <div className="utc-glass__zulu-text">ZULU</div>
          </div>
        ) : (
          <div className="utc-glass__expanded-content">
            <div className="utc-glass__clock-icon">🕐</div>
            <div className="utc-glass__time-info">
              <div className="utc-glass__day">{currentDay}</div>
              <div className="utc-glass__time">{currentTime}</div>
            </div>
          </div>
        )}
      </button>
    </div>
  );
};

export default UTCTime;
