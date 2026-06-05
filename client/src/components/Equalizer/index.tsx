import { useEq } from "../../context/AppContext";
import { Fader } from "../Fader";
import type { EqBand } from "../../utils/eqToFragments";
import styles from "./Equalizer.module.css";

export const EQ_BANDS: EqBand[] = [
  { id: "gravity", label: "Gravity", high: "dark and heavy", low: "light and breezy" },
  {
    id: "substance",
    label: "Substance",
    high: "dense and substantive",
    low: "all vibe, light on substance",
  },
  { id: "wit", label: "Wit", high: "witty and funny", low: "dry and deadpan" },
  { id: "warmth", label: "Warmth", high: "warm and affectionate", low: "cold and clinical" },
  { id: "formality", label: "Formal", high: "formal and precise", low: "loose and slangy" },
];

export function Equalizer() {
  const { bands, setBand } = useEq();

  return (
    <div className={styles.eq}>
      <div className={styles.scaleMarks} aria-hidden="true">
        <span>+</span>
        <span>0</span>
        <span>−</span>
      </div>
      <div className={styles.faders}>
        {EQ_BANDS.map((band) => (
          <Fader
            key={band.id}
            label={band.label}
            value={bands[band.id] ?? 0}
            onChange={(value) => setBand(band.id, value)}
          />
        ))}
      </div>
    </div>
  );
}
