import { useEffect, useState } from "react";
import { getTemperatureZone } from "../../utils/temperatureZone";
import styles from "./Deterioration.module.css";

interface DeteriorationProps {
  temperature: number;
}

export function Deterioration({ temperature }: DeteriorationProps) {
  const zone = getTemperatureZone(temperature);
  const [noiseSeed, setNoiseSeed] = useState(0);

  // Animate noise seed for static effect
  useEffect(() => {
    if (zone !== "danger" && zone !== "chaos") return;

    const interval = setInterval(() => {
      setNoiseSeed(Math.floor(Math.random() * 1000));
    }, 100);

    return () => clearInterval(interval);
  }, [zone]);

  if (zone === "clean") return null;

  const warmOpacity = Math.min((temperature - 0.72) / 0.28, 1) * 0.05;

  return (
    <div className={styles.overlay} data-zone={zone}>
      <div
        className={styles.warmTint}
        style={{ opacity: warmOpacity }}
      />

      {(zone === "warning" || zone === "danger" || zone === "chaos") && (
        <div className={styles.scanlines} />
      )}

      {(zone === "danger" || zone === "chaos") && (
        <>
          <svg className={styles.noiseSvg} aria-hidden="true">
            <filter id="noise-filter">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.9"
                numOctaves={3}
                seed={noiseSeed}
              />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect
              width="100%"
              height="100%"
              filter="url(#noise-filter)"
            />
          </svg>
          <div
            className={styles.staticOverlay}
            style={{
              opacity: zone === "chaos" ? 0.15 : 0.07,
            }}
          />
        </>
      )}
    </div>
  );
}
