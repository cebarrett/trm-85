import { useCallback, useRef } from "react";
import styles from "./Fader.module.css";

interface FaderProps {
  label: string;
  /** -1..1, 0 = center detent */
  value: number;
  onChange: (value: number) => void;
}

const MIN = -1;
const MAX = 1;
const STEP = 0.1;

function clamp(value: number): number {
  return Math.max(MIN, Math.min(MAX, value));
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function Fader({ label, value, onChange }: FaderProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const setFromClientY = useCallback(
    (clientY: number) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const ratio = (rect.bottom - clientY) / rect.height; // 0 bottom .. 1 top
      onChange(round2(clamp(ratio * 2 - 1)));
    },
    [onChange]
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      setFromClientY(event.clientY);
    },
    [setFromClientY]
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent) => {
      if (event.buttons !== 1) return;
      setFromClientY(event.clientY);
    },
    [setFromClientY]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.key) {
        case "ArrowUp":
        case "ArrowRight":
          event.preventDefault();
          onChange(round2(clamp(value + STEP)));
          break;
        case "ArrowDown":
        case "ArrowLeft":
          event.preventDefault();
          onChange(round2(clamp(value - STEP)));
          break;
        case "Home":
          event.preventDefault();
          onChange(MAX);
          break;
        case "End":
          event.preventDefault();
          onChange(MIN);
          break;
      }
    },
    [value, onChange]
  );

  const pct = ((value - MIN) / (MAX - MIN)) * 100; // 0 (bottom) .. 100 (top)

  return (
    <div className={styles.fader}>
      <div
        className={styles.track}
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onDoubleClick={() => onChange(0)}
      >
        <span className={styles.detent} />
        <div
          className={styles.cap}
          style={{ bottom: `${pct}%` }}
          role="slider"
          tabIndex={0}
          aria-label={label}
          aria-valuemin={MIN}
          aria-valuemax={MAX}
          aria-valuenow={round2(value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <span className={styles.label}>{label}</span>
    </div>
  );
}
