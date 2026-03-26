import { MessageSquare, X } from "lucide-react";
import type { TranslateFunction } from "@/lib/i18n";

export function WidgetHeader({
  botName,
  primaryColor,
  logoUrl,
  onClose,
  showClose,
  t,
  subtext,
  agentsOnline,
}: {
  botName: string;
  primaryColor: string;
  logoUrl?: string;
  onClose: () => void;
  showClose: boolean;
  t: TranslateFunction;
  subtext?: string;
  agentsOnline?: boolean;
}): React.ReactNode {
  return (
    <div
      className="flex items-center justify-between px-4 py-3"
      style={{ backgroundColor: primaryColor }}
    >
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
          <MessageSquare className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{botName}</p>
          <p className="flex items-center gap-1.5 text-xs text-white/70">
            {agentsOnline && (
              <span className="inline-block h-2 w-2 rounded-full bg-green-400" />
            )}
            {subtext || t('widget.online')}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {logoUrl && (
          <img
            src={logoUrl}
            alt={botName}
            className="h-7 max-w-[90px] object-contain"
          />
        )}
        {showClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            aria-label={t('widget.close')}
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
