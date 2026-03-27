import { useCallback, useEffect } from "react";
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
  disabled,
  disabledMessage,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  primaryColor: string;
  ref: React.RefObject<HTMLTextAreaElement | null>;
  t: TranslateFunction;
  hideWatermark?: boolean;
  placeholderText?: string;
  onEndChat?: () => void;
  i18nLang?: string;
  disabled?: boolean;
  disabledMessage?: string;
}): React.ReactNode => {
  const autoResize = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    const lineHeight = parseInt(getComputedStyle(el).lineHeight) || 20;
    const maxHeight = lineHeight * 4;
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  }, [ref]);

  useEffect(() => {
    autoResize();
  }, [value, autoResize]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="border-t p-3">
      <div className="flex items-end gap-2">
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholderText || t('widget.placeholder')}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ lineHeight: "20px" }}
        />
        <button
          type="button"
          onClick={() => onSend()}
          disabled={!value.trim() || disabled}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white transition-all duration-150 hover:opacity-90 disabled:opacity-40"
          style={{ backgroundColor: primaryColor }}
          aria-label={t('widget.sendLabel')}
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
      {disabledMessage && (
        <p className="px-1 pt-1 text-xs text-muted-foreground">{disabledMessage}</p>
      )}
      {onEndChat && (
        <div className="pt-1 text-center">
          <button
            type="button"
            onClick={() => {
                if (confirm(t('widget.confirmNewChat'))) onEndChat();
            }}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            {t('widget.restartNewChat')}
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
