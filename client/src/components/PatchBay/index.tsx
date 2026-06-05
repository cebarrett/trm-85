import styles from "./PatchBay.module.css";

/**
 * Decorative patch bay: two metal jacks with a glossy cable draped between them.
 * The cable is a quadratic bezier whose control point hangs below the midpoint,
 * approximating a catenary sag, with a blurred shadow cast on the panel.
 */
export function PatchBay() {
  return (
    <div className={styles.bay}>
      <svg className={styles.svg} viewBox="0 0 132 112" aria-hidden="true">
        <defs>
          <radialGradient id="pbJack" cx="38%" cy="32%" r="78%">
            <stop offset="0%" stopColor="#d4d6da" />
            <stop offset="55%" stopColor="#8b8d93" />
            <stop offset="100%" stopColor="#525458" />
          </radialGradient>
          <linearGradient id="pbCable" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffd25a" />
            <stop offset="100%" stopColor="#c48c18" />
          </linearGradient>
          <linearGradient id="pbPlug" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffe491" />
            <stop offset="100%" stopColor="#b07a10" />
          </linearGradient>
          <filter id="pbShadow" x="-30%" y="-30%" width="160%" height="190%">
            <feGaussianBlur stdDeviation="2.4" />
          </filter>
        </defs>

        <text x="28" y="11" className={styles.jackLabel} textAnchor="middle">
          OUT
        </text>
        <text x="104" y="11" className={styles.jackLabel} textAnchor="middle">
          THRU
        </text>

        {/* cable shadow cast on the panel */}
        <path
          d="M28 45 Q66 104 104 45"
          fill="none"
          stroke="rgba(0,0,0,0.38)"
          strokeWidth="8"
          strokeLinecap="round"
          filter="url(#pbShadow)"
          transform="translate(4 6)"
        />

        {/* jack sockets */}
        <g>
          <circle cx="28" cy="32" r="13" fill="url(#pbJack)" />
          <circle cx="28" cy="32" r="13" fill="none" stroke="rgba(0,0,0,0.45)" />
          <circle cx="28" cy="32" r="6.5" fill="#141518" />
        </g>
        <g>
          <circle cx="104" cy="32" r="13" fill="url(#pbJack)" />
          <circle cx="104" cy="32" r="13" fill="none" stroke="rgba(0,0,0,0.45)" />
          <circle cx="104" cy="32" r="6.5" fill="#141518" />
        </g>

        {/* cable body + gloss highlight */}
        <path
          d="M28 45 Q66 104 104 45"
          fill="none"
          stroke="url(#pbCable)"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M28 44 Q66 100 104 44"
          fill="none"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* plugs inserted into the jacks */}
        <g>
          <rect x="21.5" y="23" width="13" height="22" rx="4" fill="url(#pbPlug)" />
          <rect x="21.5" y="23" width="13" height="6" rx="3" fill="rgba(255,255,255,0.45)" />
        </g>
        <g>
          <rect x="97.5" y="23" width="13" height="22" rx="4" fill="url(#pbPlug)" />
          <rect x="97.5" y="23" width="13" height="6" rx="3" fill="rgba(255,255,255,0.45)" />
        </g>
      </svg>
    </div>
  );
}
