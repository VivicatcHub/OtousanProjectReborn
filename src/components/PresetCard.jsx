import { cn } from "@/lib/utils";

export function PresetCard({
  emoji,
  title,
  description,
  color = "bg-card",
  onClick,
  delay = 0,
}) {
  const light = color === "bg-card";
  return (
    <button
      onClick={onClick}
      style={{ animationDelay: `${delay}ms` }}
      className={cn(
        "animate-pop-in group flex items-center gap-4 rounded-2xl border-2 border-transparent p-5 text-left shadow-md transition-transform hover:-translate-y-1 hover:rotate-1 active:scale-95",
        color,
        light ? "border-border text-foreground" : "text-white",
      )}
    >
      <span className="text-4xl transition-transform group-hover:scale-125">
        {emoji}
      </span>
      <span>
        <span className="block text-xl font-black">{title}</span>
        {description && (
          <span
            className={cn(
              "block text-sm font-semibold",
              light ? "text-muted-foreground" : "opacity-90",
            )}
          >
            {description}
          </span>
        )}
      </span>
    </button>
  );
}
