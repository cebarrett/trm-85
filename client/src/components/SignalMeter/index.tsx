import { useMemo } from "react";
import styles from "./SignalMeter.module.css";

interface SignalMeterProps {
  temperature: number;
}

const TOTAL_SEGMENTS = 20;

function getSegmentColor(index: number): string {
  if (index < 12) return "green";
  if (index < 16) return "yellow";
  return "red";
}

export function SignalMeter({ temperature }: SignalMeterProps) {
  const litCount = useMemo(
    () => Math.round(TOTAL_SEGMENTS * (1 - temperature / 1.1)),
    [temperature]
  );

  return (
    <div className={styles.container}>
      <span className={styles.label}>SIGNAL</span>
      <div className={styles.meterBar}>
        {Array.from({ length: TOTAL_SEGMENTS }, (_, index) => {
          const isLit = index < litCount;
          const color = getSegmentColor(index);
          return (
            <div
              key={index}
              className={`${styles.segment} ${isLit ? styles.lit : ""} ${styles[color]}`}
            />
          );
        })}
      </div>
      <span className={styles.sublabel}>COHERENCE</span>
    </div>
  );
}
