import type { ReactNode } from "react";
import styles from "./Faceplate.module.css";

interface FaceplateProps {
  children: ReactNode;
}

export function Faceplate({ children }: FaceplateProps) {
  return (
    <div className={styles.faceplate}>
      <div className={styles.screwTopLeft} />
      <div className={styles.screwTopRight} />
      <div className={styles.screwBottomLeft} />
      <div className={styles.screwBottomRight} />

      <div className={styles.header}>
        <span className={styles.brand}>TRM-85</span>
        <span className={styles.tagline}>TOKEN REGURGITATION MACHINE</span>
      </div>

      <div className={styles.content}>{children}</div>
    </div>
  );
}
