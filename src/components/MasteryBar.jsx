import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export function MasteryBar({ stat, className }) {
  const { t: translate } = useTranslation();
  const total = (stat?.correct ?? 0) + (stat?.wrong ?? 0);

  if (total === 0) {
    return (
      <div className={cn("mt-1.5 flex items-center gap-2", className)}>
        <div className="h-1.5 flex-1 rounded-full bg-muted" />
        <span className="shrink-0 text-[11px] font-bold text-muted-foreground">
          🆕 {translate("dictionary.mastery.new")}
        </span>
      </div>
    );
  }

  const errPct = Math.round((stat.wrong / total) * 100);
  const mastery = 100 - errPct;
  const tone =
    errPct <= 25
      ? { fill: "bg-grass", text: "text-grass" }
      : errPct <= 60
        ? { fill: "bg-sun", text: "text-sun" }
        : { fill: "bg-brand", text: "text-brand" };

  return (
    <div className={cn("mt-1.5 flex items-center gap-2", className)}>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", tone.fill)}
          style={{ width: `${mastery}%` }}
        />
      </div>
      <span className={cn("shrink-0 text-[11px] font-bold", tone.text)}>
        {errPct === 0
          ? `⭐ ${translate("dictionary.mastery.perfect")}`
          : translate("dictionary.mastery.errors", { pct: errPct })}
      </span>
    </div>
  );
}
