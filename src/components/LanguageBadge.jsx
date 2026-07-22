import { useData } from "@/hooks/useData";
import { useSettings } from "@/context/SettingsContext";

export function LanguageBadge() {
  const { languages } = useData();
  const { known, learn } = useSettings();

  const find = (code) => languages.find((l) => l.code === code);
  const from = find(known);
  const to = find(learn);
  if (!from || !to) return null;

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm font-bold">
      <span title={from.label}>{from.flag}</span>
      <span aria-hidden>→</span>
      <span title={to.label}>{to.flag}</span>
    </span>
  );
}
