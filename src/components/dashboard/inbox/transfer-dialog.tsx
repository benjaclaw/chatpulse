import { Button } from "@/components/ui/button";

interface OnlineAgent {
  user_id: string;
  name?: string;
  email?: string;
}

interface TransferDialogProps {
  agents: OnlineAgent[];
  onTransfer: (agentId: string) => void;
  onClose: () => void;
  t: (key: string) => string;
}

export function TransferDialog({ agents, onTransfer, onClose, t }: TransferDialogProps): React.ReactNode {
  return (
    <div className="border-b bg-muted/50 p-3">
      <p className="text-xs font-medium mb-2">{t('inbox.transferTo')}</p>
      {agents.length === 0 ? (
        <p className="text-xs text-muted-foreground">{t('inbox.noAgentsOnline')}</p>
      ) : (
        <div className="space-y-1">
          {agents.map((agent) => (
            <button
              key={agent.user_id}
              onClick={() => onTransfer(agent.user_id)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs hover:bg-muted transition-colors"
            >
              <span className="h-2 w-2 rounded-full bg-green-500" />
              {agent.name || agent.email || agent.user_id.slice(0, 8)}
            </button>
          ))}
        </div>
      )}
      <Button variant="ghost" size="sm" onClick={onClose} className="mt-2 h-6 text-xs">
        {t('settings.cancel')}
      </Button>
    </div>
  );
}
