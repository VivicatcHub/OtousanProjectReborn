import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useStats } from "@/context/StatsContext";
import { useSettings } from "@/context/SettingsContext";
import { ACHIEVEMENTS } from "@/data/achievements";

const ICON_BG = {
  brand: "bg-brand",
  sky: "bg-sky",
  grass: "bg-grass",
  sun: "bg-sun",
  grape: "bg-grape",
};

export function AchievementToast() {
  const { t: translate } = useTranslation();
  const { queue, dequeue } = useStats();
  const { sound } = useSettings();

  const [current, setCurrent] = useState(null);

  useEffect(() => {
    if (current == null && queue.length > 0) {
      setCurrent(queue[0]);
      dequeue();
    }
  }, [queue, current, dequeue]);

  useEffect(() => {
    if (current == null) return;
    if (sound) playChime();
    const timer = setTimeout(() => setCurrent(null), 4000);
    return () => clearTimeout(timer);
  }, [current, sound]);

  if (current == null) return null;
  const badge = ACHIEVEMENTS.find((a) => a.id === current);
  if (!badge) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-50 flex justify-center px-3">
      <div
        key={current} // restart the animation for each new badge
        role="status"
        aria-live="polite"
        className="animate-achievement flex w-full max-w-sm items-center gap-3 rounded-2xl border-2 border-border bg-foreground p-3 text-background shadow-2xl"
      >
        <div
          className={`animate-badge-wiggle flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-3xl ${ICON_BG[badge.color] ?? "bg-sun"}`}
        >
          {badge.emoji}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-sun">
            {translate("achievements.unlocked")}
          </p>
          <p className="truncate text-lg font-black">
            {translate(`achievements.items.${badge.id}.title`)}
          </p>
        </div>
      </div>
    </div>
  );
}

function playChime() {
  try {
    const audio = new Audio("/victory.mp3");
    audio.volume = 0.2;
    audio.play().catch(() => {});
  } catch {}
}
