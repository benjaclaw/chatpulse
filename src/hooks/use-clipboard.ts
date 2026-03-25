import { useState, useCallback, useRef, useEffect } from "react";

export function useClipboard(resetDelay = 2000): {
  copied: boolean;
  copy: (text: string) => void;
} {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const copy = useCallback(
    (text: string) => {
      navigator.clipboard.writeText(text);
      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), resetDelay);
    },
    [resetDelay]
  );

  return { copied, copy };
}
