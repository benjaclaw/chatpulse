import { useCallback } from "react";

export function usePresenceCheck(
  setAgentsOnline: (v: boolean) => void,
  workspaceIdRef: React.MutableRefObject<string | null>
): (chatbotId: string) => Promise<void> {
  const checkPresence = useCallback(async (chatbotId: string) => {
    try {
      const res = await fetch(`/api/widget-config?chatbotId=${encodeURIComponent(chatbotId)}`);
      const data = await res.json() as { workspaceId?: string; agentsOnline?: boolean };
      if (data.workspaceId) workspaceIdRef.current = data.workspaceId;
      setAgentsOnline(!!data.agentsOnline);
    } catch {
      // ignore
    }
  }, [setAgentsOnline, workspaceIdRef]);

  return checkPresence;
}
