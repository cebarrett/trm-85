import { useRef, useEffect } from "react";
import styles from "./VUMeter.module.css";

interface VUMeterProps {
  tokenRate: number;
  temperature: number;
}

const REST_ANGLE = -45;
const PEAK_ANGLE = 45;
const SPRING_CONSTANT = 0.15;
const DAMPING = 0.7;
const MAX_RATE = 100;
const NOISE_AMPLITUDE = 15;

export function VUMeter({ tokenRate, temperature }: VUMeterProps) {
  const needleRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const velocityRef = useRef(0);
  const currentAngleRef = useRef(REST_ANGLE);

  useEffect(() => {
    const animate = () => {
      const clampedRate = Math.min(tokenRate, MAX_RATE);
      let targetAngle =
        REST_ANGLE +
        (clampedRate / MAX_RATE) * (PEAK_ANGLE - REST_ANGLE);

      // Add noise at high temperature
      if (temperature > 0.9) {
        const temperatureExcess = (temperature - 0.9) / 0.2;
        const noise =
          (Math.random() - 0.5) * NOISE_AMPLITUDE * temperatureExcess;
        targetAngle += noise;
      }

      // Spring physics
      velocityRef.current +=
        (targetAngle - currentAngleRef.current) * SPRING_CONSTANT;
      velocityRef.current *= DAMPING;
      currentAngleRef.current += velocityRef.current;

      // Clamp angle
      currentAngleRef.current = Math.max(
        REST_ANGLE - 5,
        Math.min(PEAK_ANGLE + 5, currentAngleRef.current)
      );

      if (needleRef.current) {
        needleRef.current.style.transform = `rotate(${currentAngleRef.current}deg)`;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [tokenRate, temperature]);

  return (
    <div className={styles.meter}>
      <div className={styles.face}>
        <div className={styles.scale}>
          <span className={styles.scaleLabel}>dB</span>
        </div>
        <div className={styles.greenZone} />
        <div className={styles.redZone} />
        <div className={styles.needlePivot}>
          <div ref={needleRef} className={styles.needle} />
        </div>
      </div>
      <div className={styles.glass} />
      <span className={styles.vuLabel}>VU</span>
    </div>
  );
}
