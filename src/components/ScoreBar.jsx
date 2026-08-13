import { useTranslation } from "react-i18next";

export function ScoreBar({ current, total, score, infinite = false }) {
  const { t: translate } = useTranslation();
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm font-bold">
        <span>
          {infinite
            ? translate("scoreBar.endless", { current: current + 1 })
            : translate("scoreBar.question", {
                current: Math.min(current + 1, total),
                total,
              })}
        </span>
        <span key={score} className="inline-block animate-tada">
          ⭐ {score}
        </span>
      </div>
      {!infinite && (
        <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-grass transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}
