import { useCallback, useRef, useEffect } from "react";
import { clamp } from "../../utils/clamp";
import styles from "./Knob.module.css";

interface KnobProps {
  temperature: number;
  onTemperatureChange: (value: number) => void;
}

const MIN_TEMP = 0;
const MAX_TEMP = 1.0;
const STEP = 1 / 110; // one display-unit / 10
const BIG_STEP = 1 / 11; // one display-unit
const ROTATION_RANGE = 270; // degrees
const START_ANGLE = -135; // 7 o'clock

// Numeric 0–11 scale (Spinal Tap style). Internal values are 0–1.
const DIAL_LABELS = Array.from({ length: 12 }, (_, i) => ({
  value: i / 11,
  label: String(i),
  danger: i === 11,
}));

function temperatureToAngle(temperature: number): number {
  return START_ANGLE + (temperature / MAX_TEMP) * ROTATION_RANGE;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function Knob({ temperature, onTemperatureChange }: KnobProps) {
  const knobRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ y: number; startTemp: number } | null>(null);

  const setTemp = useCallback(
    (value: number) => {
      onTemperatureChange(round2(clamp(value, MIN_TEMP, MAX_TEMP)));
    },
    [onTemperatureChange]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.key) {
        case "ArrowUp":
        case "ArrowRight":
          event.preventDefault();
          setTemp(temperature + STEP);
          break;
        case "ArrowDown":
        case "ArrowLeft":
          event.preventDefault();
          setTemp(temperature - STEP);
          break;
        case "PageUp":
          event.preventDefault();
          setTemp(temperature + BIG_STEP);
          break;
        case "PageDown":
          event.preventDefault();
          setTemp(temperature - BIG_STEP);
          break;
        case "Home":
          event.preventDefault();
          setTemp(MIN_TEMP);
          break;
        case "End":
          event.preventDefault();
          setTemp(MAX_TEMP);
          break;
      }
    },
    [temperature, setTemp]
  );

  const handleWheel = useCallback(
    (event: React.WheelEvent) => {
      event.preventDefault();
      const step = event.shiftKey ? BIG_STEP : STEP;
      const delta = event.deltaY < 0 ? step : -step;
      setTemp(temperature + delta);
    },
    [temperature, setTemp]
  );

  // Mouse drag handling
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!dragStartRef.current) return;
      const deltaY = dragStartRef.current.y - event.clientY;
      const tempDelta = (deltaY / 300) * MAX_TEMP;
      setTemp(dragStartRef.current.startTemp + tempDelta);
    };

    const handleMouseUp = () => {
      dragStartRef.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [setTemp]);

  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      dragStartRef.current = { y: event.clientY, startTemp: temperature };
      document.body.style.cursor = "grabbing";
      document.body.style.userSelect = "none";
    },
    [temperature]
  );

  // Touch drag handling
  const handleTouchStart = useCallback(
    (event: React.TouchEvent) => {
      const touch = event.touches[0];
      dragStartRef.current = { y: touch.clientY, startTemp: temperature };
    },
    [temperature]
  );

  const handleTouchMove = useCallback(
    (event: React.TouchEvent) => {
      if (!dragStartRef.current) return;
      event.preventDefault();
      const touch = event.touches[0];
      const deltaY = dragStartRef.current.y - touch.clientY;
      const tempDelta = (deltaY / 200) * MAX_TEMP;
      setTemp(dragStartRef.current.startTemp + tempDelta);
    },
    [setTemp]
  );

  const handleTouchEnd = useCallback(() => {
    dragStartRef.current = null;
  }, []);

  const angle = temperatureToAngle(temperature);
  const displayTemp = (temperature * 11).toFixed(1);

  return (
    <div className={styles.container}>
      <div className={styles.dialLabels}>
        {DIAL_LABELS.map(({ value, label, danger }) => {
          const labelAngle = temperatureToAngle(value);
          const radians = (labelAngle - 90) * (Math.PI / 180);
          const radius = 120;
          const x = Math.cos(radians) * radius;
          const y = Math.sin(radians) * radius;
          return (
            <span
              key={value}
              className={`${styles.dialLabel} ${danger ? styles.dialLabelDanger : ""}`}
              style={{
                transform: `translate(${x}px, ${y}px)`,
              }}
            >
              {label}
            </span>
          );
        })}
      </div>

      <div
        ref={knobRef}
        className={styles.knob}
        role="slider"
        tabIndex={0}
        aria-valuemin={MIN_TEMP}
        aria-valuemax={MAX_TEMP}
        aria-valuenow={temperature}
        aria-label="Temperature"
        onKeyDown={handleKeyDown}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `rotate(${angle}deg)`,
        }}
      >
        <div className={styles.indicator} />
      </div>

      <div className={styles.readout}>{displayTemp}</div>
    </div>
  );
}
