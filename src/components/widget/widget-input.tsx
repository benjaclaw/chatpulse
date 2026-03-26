import { Send } from "lucide-react";
import type { TranslateFunction } from "@/lib/i18n";

export const WidgetInput = ({
  value,
  onChange,
  onSend,
  primaryColor,
  ref,
  t,
  hideWatermark = false,
  placeholderText,
  onEndChat,
  i18nLang,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  primaryColor: string;
  ref: React.RefObject<HTMLInputElement | null>;
  t: TranslateFunction;
  hideWatermark?: boolean;
  placeholderText?: string;
  onEndChat?: () => void;
  i18nLang?: string;
}): React.ReactNode => {
  return (
    <div className="border-t p-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSend();
        }}
        className="flex items-center gap-2"
      >
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholderText || t('widget.placeholder')}
          className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white transition-all duration-150 hover:opacity-90 disabled:opacity-40"
          style={{ backgroundColor: primaryColor }}
          aria-label={t('widget.sendLabel')}
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
      {onEndChat && (
        <div className="pt-1 text-center">
          <button
            type="button"
            onClick={() => {
              const msg = i18nLang === "nb"
                ? "Er du sikker på at du vil starte ny chat? Nåværende samtale avsluttes."
                : "Are you sure you want to start a new chat? The current conversation will end.";
              if (confirm(msg)) onEndChat();
            }}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            {i18nLang === "nb" ? "\u21BB Start ny chat" : "\u21BB Start new chat"}
          </button>
        </div>
      )}
      {!hideWatermark && (
        <div className="px-3 pb-1.5 pt-0.5 text-center">
          <a
            href="https://chatpulse.no"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-muted-foreground/70 hover:text-muted-foreground transition-colors"
          >
            {t('widget.poweredBy')}
          </a>
        </div>
      )}
    </div>
  );
};
