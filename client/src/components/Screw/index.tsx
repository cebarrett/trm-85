import styles from "./Screw.module.css";

interface ScrewProps {
  /** Rotation of the cross slot, in degrees. Vary per instance — perfectly
   *  aligned screws read as fake. */
  rotation?: number;
  size?: number;
}

export function Screw({ rotation = 0, size }: ScrewProps) {
  return (
    <span
      className={styles.screw}
      style={
        {
          "--screw-rot": `${rotation}deg`,
          ...(size ? { width: `${size}px`, height: `${size}px` } : {}),
        } as React.CSSProperties
      }
    />
  );
}
