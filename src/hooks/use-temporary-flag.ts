import { useState, useCallback, useRef, useEffect } from "react";

export function useTemporaryFlag(resetDelay = 2000): {
  active: boolean;
  trigger: () => void;
} {
  const [active, setActive] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const trigger = useCallback(() => {
    setActive(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setActive(false), resetDelay);
  }, [resetDelay]);

  return { active, trigger };
}
