import { useCallback } from "react";
import { useTemporaryFlag } from "./use-temporary-flag";

export function useClipboard(resetDelay = 2000): {
  copied: boolean;
  copy: (text: string) => void;
} {
  const { active: copied, trigger } = useTemporaryFlag(resetDelay);

  const copy = useCallback(
    (text: string): void => {
      navigator.clipboard.writeText(text);
      trigger();
    },
    [trigger]
  );

  return { copied, copy };
}
