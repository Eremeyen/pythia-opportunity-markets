import { useEffect, useState } from "react";

export function useDelayMount(delayMs: number): boolean {
  const [ready, setReady] = useState<boolean>(delayMs <= 0);
  useEffect(() => {
    if (delayMs <= 0) return;
    const id = setTimeout(() => setReady(true), delayMs);
    return () => clearTimeout(id);
  }, [delayMs]);
  return ready;
}


