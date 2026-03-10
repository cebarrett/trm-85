import styles from "./ToggleButton.module.css";

interface ToggleButtonProps {
  label: string;
  active: boolean;
  onToggle: () => void;
}

export function ToggleButton({ label, active, onToggle }: ToggleButtonProps) {
  return (
    <button
      className={`${styles.button} ${active ? styles.active : ""}`}
      onClick={onToggle}
      type="button"
      aria-pressed={active}
    >
      <span className={styles.led} />
      <span className={styles.label}>{label}</span>
    </button>
  );
}
