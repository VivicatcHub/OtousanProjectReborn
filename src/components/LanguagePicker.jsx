import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function LanguagePicker({ title, languages, value, onChange }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          {languages.map((lang) => {
            const selected = lang.code === value;
            return (
              <button
                key={lang.code}
                onClick={() => onChange(lang.code)}
                aria-pressed={selected}
                className={cn(
                  "flex items-center gap-2 rounded-xl border-2 px-4 py-3 text-lg font-bold transition-transform active:scale-95",
                  selected
                    ? "border-brand bg-brand text-brand-foreground shadow-md"
                    : "border-border bg-card hover:bg-muted",
                )}
              >
                <span className="text-2xl">{lang.flag}</span>
                {lang.label}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
