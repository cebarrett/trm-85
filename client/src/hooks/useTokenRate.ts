import { useState, useCallback, useRef } from "react";

interface TokenEntry {
  count: number;
  timestamp: number;
}

const WINDOW_MS = 1000;
const BUFFER_SIZE = 60;

export function useTokenRate() {
  const [tokenRate, setTokenRate] = useState(0);
  const bufferRef = useRef<TokenEntry[]>([]);

  const recordTokens = useCallback((count: number) => {
    const now = Date.now();
    const buffer = bufferRef.current;

    if (count > 0) {
      buffer.push({ count, timestamp: now });
      if (buffer.length > BUFFER_SIZE) {
        buffer.shift();
      }
    }

    // Calculate rate from entries within the window
    const windowStart = now - WINDOW_MS;
    const recentEntries = buffer.filter(
      (entry) => entry.timestamp >= windowStart
    );
    bufferRef.current = recentEntries;

    if (recentEntries.length === 0) {
      setTokenRate(0);
      return;
    }

    const totalTokens = recentEntries.reduce(
      (sum, entry) => sum + entry.count,
      0
    );
    const elapsed = now - recentEntries[0].timestamp;
    const rate = elapsed > 0 ? totalTokens / (elapsed / 1000) : totalTokens;

    setTokenRate(rate);
  }, []);

  return { tokenRate, recordTokens };
}
