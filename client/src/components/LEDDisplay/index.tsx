import styles from "./LEDDisplay.module.css";

interface LEDDisplayProps {
  count: number;
}

export function LEDDisplay({ count }: LEDDisplayProps) {
  const displayValue = String(count % 1000000).padStart(6, "0");

  return (
    <div className={styles.display} aria-label={`Token count: ${count}`}>
      <span className={styles.background}>888888</span>
      <span className={styles.value}>{displayValue}</span>
      <span className={styles.label}>TOKENS</span>
    </div>
  );
}
