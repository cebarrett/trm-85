import styles from "./EjectButton.module.css";

interface EjectButtonProps {
  onEject: () => void;
  disabled: boolean;
}

export function EjectButton({ onEject, disabled }: EjectButtonProps) {
  return (
    <button
      className={`${styles.button} ${disabled ? styles.disabled : ""}`}
      onClick={onEject}
      disabled={disabled}
      aria-label="Eject — abort current generation"
      type="button"
    >
      <span className={styles.label}>EJECT</span>
    </button>
  );
}
