import { Delete, CornerDownLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function VirtualKeyboard({
  alphabet,
  onInsert,
  onBackspace,
  onEnter,
  enterLabel,
  disabled = false,
  className,
}) {
  const { letters = [], extras = [], space = false } = alphabet ?? {};

  const hold = (e) => e.preventDefault();

  return (
    <div
      className={cn("animate-fade-up select-none space-y-1.5", className)}
      role="group"
    >
      <div className="grid grid-cols-9 gap-1.5 sm:grid-cols-13">
        {letters.map((char) => (
          <Key
            key={char}
            disabled={disabled}
            onDown={hold}
            onClick={() => onInsert(char)}
          >
            {char}
          </Key>
        ))}
      </div>

      {extras.length > 0 && (
        <div className="grid grid-cols-9 gap-1.5 sm:grid-cols-13">
          {extras.map((char) => (
            <Key
              key={char}
              tone="extra"
              disabled={disabled}
              onDown={hold}
              onClick={() => onInsert(char)}
            >
              {char}
            </Key>
          ))}
        </div>
      )}

      <div className="flex gap-1.5">
        {space && (
          <Key
            className="flex-1"
            tone="extra"
            disabled={disabled}
            onDown={hold}
            onClick={() => onInsert(" ")}
          >
            ␣
          </Key>
        )}
        <Key
          className={space ? "w-16" : "flex-1"}
          tone="warn"
          disabled={disabled}
          onDown={hold}
          onClick={onBackspace}
          label="⌫"
        >
          <Delete className="h-5 w-5" />
        </Key>
        <Key
          className="flex-1"
          tone="ok"
          onDown={hold}
          onClick={onEnter}
          label={enterLabel}
        >
          <CornerDownLeft className="h-5 w-5" /> {enterLabel}
        </Key>
      </div>
    </div>
  );
}

function Key({ children, onClick, onDown, tone, disabled, className, label }) {
  const tones = {
    extra: "bg-muted text-foreground",
    warn: "bg-brand/15 text-brand",
    ok: "bg-grass text-white",
  };
  return (
    <button
      type="button"
      disabled={disabled}
      onMouseDown={onDown}
      onClick={onClick}
      aria-label={label}
      className={cn(
        "flex h-11 items-center justify-center gap-1.5 rounded-xl border-2 border-border bg-card text-lg font-black shadow-sm transition-transform active:scale-90 disabled:opacity-40 sm:hover:-translate-y-0.5",
        tones[tone],
        className,
      )}
    >
      {children}
    </button>
  );
}
