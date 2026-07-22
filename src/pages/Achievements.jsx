import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Lock, Trophy, RotateCcw } from "lucide-react";
import { useStats } from "@/context/StatsContext";
import { ACHIEVEMENTS } from "@/data/achievements";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const GAME_META = {
  quiz: { emoji: "❓", color: "sky" },
  imagier: { emoji: "🖼️", color: "grass" },
  writing: { emoji: "🖊", color: "grape" },
  memory: { emoji: "🧩", color: "sky" },
};

const BG = {
  brand: "bg-brand",
  sky: "bg-sky",
  grass: "bg-grass",
  sun: "bg-sun",
  grape: "bg-grape",
};

export default function Achievements() {
  const { t: translate } = useTranslation();
  const { stats, resetStats } = useStats();

  const unlockedCount = Object.keys(stats.unlocked).length;
  const daysPlayed = Object.keys(stats.history).length;

  const tiles = [
    { key: "totalPlays", emoji: "🎮", value: stats.totalPlays },
    { key: "totalCorrect", emoji: "✅", value: stats.totalCorrect },
    { key: "bestStreak", emoji: "🔥", value: stats.bestStreak },
    { key: "perfectCount", emoji: "🌟", value: stats.perfectCount },
    { key: "daysPlayed", emoji: "📅", value: daysPlayed },
    {
      key: "badges",
      emoji: "🏆",
      value: `${unlockedCount}/${ACHIEVEMENTS.length}`,
    },
  ];

  const played = stats.totalPlays > 0;

  return (
    <div className="space-y-8">
      <section className="text-center">
        <h1 className="text-3xl font-black sm:text-4xl">
          {translate("achievements.title")}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {translate("achievements.subtitle")}
        </p>
      </section>

      {/* ---- Records: headline numbers ---- */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {tiles.map((tile) => (
          <Card key={tile.key} className="text-center">
            <CardContent className="p-4 pt-4">
              <div className="text-3xl">{tile.emoji}</div>
              <div className="mt-1 text-2xl font-black tabular-nums">
                {tile.value}
              </div>
              <div className="text-xs font-bold text-muted-foreground">
                {translate(`achievements.stats.${tile.key}`)}
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {played ? (
        <>
          <GamesChart stats={stats} />
          <WeekChart stats={stats} />
        </>
      ) : (
        <Card>
          <CardContent className="p-6 text-center text-lg font-semibold text-muted-foreground">
            {translate("achievements.empty")}
          </CardContent>
        </Card>
      )}

      {/* ---- Badges grid ---- */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-2xl font-black">
          <Trophy className="h-6 w-6 text-sun" />{" "}
          {translate("achievements.badgesTitle")}
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {ACHIEVEMENTS.map((a) => (
            <BadgeCard key={a.id} badge={a} date={stats.unlocked[a.id]} />
          ))}
        </div>
      </section>

      <ResetButton onReset={resetStats} />
    </div>
  );
}

function BadgeCard({ badge, date }) {
  const { t: translate } = useTranslation();
  const earned = Boolean(date);

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-2xl border-2 p-4 transition-colors",
        earned
          ? "border-border bg-card"
          : "border-dashed border-border bg-muted/50",
      )}
    >
      <div
        className={cn(
          "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-3xl",
          earned ? `${BG[badge.color]} text-white shadow-sm` : "bg-muted",
        )}
      >
        <span className={cn(!earned && "opacity-40 grayscale")}>
          {badge.emoji}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-lg font-black",
            !earned && "text-muted-foreground",
          )}
        >
          {translate(`achievements.items.${badge.id}.title`)}
        </p>
        <p className="text-sm text-muted-foreground">
          {translate(`achievements.items.${badge.id}.desc`)}
        </p>
        {earned && (
          <p className="mt-1 text-xs font-bold text-grass">
            {translate("achievements.earnedOn", { date })}
          </p>
        )}
      </div>
      {!earned && <Lock className="h-5 w-5 shrink-0 text-muted-foreground" />}
    </div>
  );
}

function GamesChart({ stats }) {
  const { t: translate } = useTranslation();
  const rows = Object.keys(GAME_META).map((game) => ({
    game,
    ...GAME_META[game],
    plays: stats.games[game]?.plays ?? 0,
  }));
  const max = Math.max(1, ...rows.map((r) => r.plays));

  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <h2 className="text-xl font-black">
          {translate("achievements.gamesChart")}
        </h2>
        {rows.map((r) => (
          <div key={r.game} className="flex items-center gap-3">
            <div className="w-28 shrink-0 text-sm font-bold">
              {r.emoji} {translate(`games.${r.game}.title`)}
            </div>
            {/* Track + baseline-anchored fill; value sits at the bar end. */}
            <div className="relative h-7 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "flex h-full items-center justify-end rounded-full pr-2 text-sm font-black text-white transition-all",
                  BG[r.color],
                )}
                style={{
                  width: `${Math.max((r.plays / max) * 100, r.plays > 0 ? 12 : 0)}%`,
                }}
              >
                {r.plays > 0 && r.plays}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function WeekChart({ stats }) {
  const { t: translate, i18n } = useTranslation();
  const days = lastSevenDays();
  const max = Math.max(1, ...days.map((d) => stats.history[d.key] ?? 0));
  const fmt = new Intl.DateTimeFormat(i18n.language, { weekday: "short" });

  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <h2 className="text-xl font-black">
          {translate("achievements.weekChart")}
        </h2>
        <div
          className="flex items-end justify-between gap-2"
          style={{ height: "8rem" }}
        >
          {days.map((d) => {
            const count = stats.history[d.key] ?? 0;
            return (
              <div
                key={d.key}
                className="flex flex-1 flex-col items-center justify-end gap-1"
                title={`${count}`}
              >
                <span className="text-xs font-black tabular-nums text-muted-foreground">
                  {count > 0 ? count : ""}
                </span>
                <div
                  className={cn(
                    "w-full rounded-t-lg bg-sky transition-all",
                    count === 0 && "bg-muted",
                  )}
                  style={{
                    height: `${count === 0 ? 4 : (count / max) * 100}%`,
                    minHeight: count === 0 ? "4px" : "8px",
                  }}
                />
                <span className="text-xs font-bold text-muted-foreground">
                  {fmt.format(d.date).slice(0, 2)}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function ResetButton({ onReset }) {
  const { t: translate } = useTranslation();
  const [confirm, setConfirm] = useState(false);

  if (!confirm) {
    return (
      <div className="pt-2 text-center">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => setConfirm(true)}
        >
          <RotateCcw className="h-4 w-4" /> {translate("achievements.reset")}
        </Button>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center gap-3 rounded-2xl bg-muted p-4">
      <span className="font-bold">
        {translate("achievements.resetConfirm")}
      </span>
      <Button
        variant="default"
        size="sm"
        onClick={() => {
          onReset();
          setConfirm(false);
        }}
      >
        {translate("achievements.resetYes")}
      </Button>
      <Button variant="outline" size="sm" onClick={() => setConfirm(false)}>
        {translate("achievements.resetNo")}
      </Button>
    </div>
  );
}

function lastSevenDays() {
  const out = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    out.push({ key, date });
  }
  return out;
}
