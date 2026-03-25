import { useState, useCallback } from "react";
import type { ActionResult } from "@/lib/types";

interface UseFormActionReturn {
  error: string | null;
  pending: boolean;
  handleSubmit: (action: () => Promise<ActionResult>) => Promise<void>;
}

export function useFormAction(): UseFormActionReturn {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = useCallback(
    async (action: () => Promise<ActionResult>): Promise<void> => {
      setPending(true);
      setError(null);

      const result = await action();

      if (result?.error) {
        setError(result.error);
        setPending(false);
      }
    },
    []
  );

  return { error, pending, handleSubmit };
}
