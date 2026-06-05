import type { ReactNode } from "react";
import styles from "./RackDevice.module.css";

interface RackDeviceProps {
  code: string;
  name: string;
  children: ReactNode;
}

/** A single mounted rack unit: a left brand spine + a content area. */
export function RackDevice({ code, name, children }: RackDeviceProps) {
  return (
    <section className={styles.device}>
      <div className={styles.spine}>
        <span className={styles.led} />
        <span className={styles.spineText}>
          {code} · {name}
        </span>
      </div>
      <div className={styles.content}>{children}</div>
    </section>
  );
}
