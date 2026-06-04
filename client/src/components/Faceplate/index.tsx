import type { ReactNode } from "react";
import { Screw } from "../Screw";
import styles from "./Faceplate.module.css";

interface FaceplateProps {
  children: ReactNode;
}

export function Faceplate({ children }: FaceplateProps) {
  return (
    <div className={styles.faceplate}>
      {/* Rack-mount ears, each fixed with a screw top and bottom */}
      <div className={styles.railLeft}>
        <Screw rotation={22} />
        <Screw rotation={-38} />
      </div>
      <div className={styles.railRight}>
        <Screw rotation={-14} />
        <Screw rotation={41} />
      </div>

      <div className={styles.panel}>
        <div className={styles.header}>
          <span className={styles.brand}>TRM-85</span>
          <span className={styles.tagline}>TOKEN REGURGITATION MACHINE</span>
        </div>

        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
