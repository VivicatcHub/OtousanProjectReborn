// Keyboard hints, hidden on small screens where there is no keyboard.
export function ShortcutHints({ items }) {
  return (
    <div className="hidden flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-2 text-xs font-bold text-muted-foreground lg:flex">
      {items.map(({ keys, label }) => (
        <span key={label} className="flex items-center gap-1.5">
          {keys.map((key) => (
            <kbd
              key={key}
              className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border-2 border-border bg-muted px-1.5 font-black"
            >
              {key}
            </kbd>
          ))}
          {label}
        </span>
      ))}
    </div>
  );
}
