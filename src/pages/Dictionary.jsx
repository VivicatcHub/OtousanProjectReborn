import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useData, getTranslation } from "@/hooks/useData";
import { useSettings } from "@/context/SettingsContext";
import { useWordStats } from "@/context/WordStatsContext";
import { dataProvider } from "@/services/dataProvider";
import { Card, CardContent } from "@/components/ui/card";
import { SpeakButton } from "@/components/SpeakButton";
import { cn } from "@/lib/utils";

export default function Dictionary() {
  const { t: translate } = useTranslation();
  const { words, languages, loading } = useData();
  const { known, learn } = useSettings();
  const { getWordStat } = useWordStats();
  const [category, setCategory] = useState("all");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    dataProvider.getCategories(learn).then(setCategories);
    setCategory("all");
  }, [learn]);

  const learnLang = languages.find((l) => l.code === learn);

  const visible = useMemo(() => {
    return words.filter((w) => {
      if (!getTranslation(w, known) || !getTranslation(w, learn)) return false;
      if (category === "all") return true;
      return (w.categories[learn] ?? []).includes(category);
    });
  }, [words, known, learn, category]);

  if (loading) return <p>{translate("common.loading")}</p>;

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-black">{translate("dictionary.title")}</h1>

      {/* Category filter chips */}
      <div className="flex flex-wrap gap-2">
        <FilterChip
          active={category === "all"}
          onClick={() => setCategory("all")}
        >
          🌈 {translate("common.all")}
        </FilterChip>
        {categories.map((c) => (
          <FilterChip
            key={c.id}
            active={category === c.id}
            onClick={() => setCategory(c.id)}
          >
            {c.emoji} {c.label}
          </FilterChip>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {visible.map((word) => {
          const learnTr = getTranslation(word, learn);
          return (
            <Card key={word.id}>
              <CardContent className="flex items-center gap-4 p-4">
                <span className="text-4xl">{word.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-muted-foreground">
                    {getTranslation(word, known).text}
                  </p>
                  <p className="truncate text-xl font-extrabold">
                    {learnTr.text}
                  </p>
                  {learnTr.romaji && (
                    <p className="truncate text-xs text-muted-foreground">
                      {learnTr.kanji ? `${learnTr.kanji} · ` : ""}
                      {learnTr.romaji}
                    </p>
                  )}
                  <MasteryBar stat={getWordStat(learn, word.id)} />
                </div>
                <SpeakButton
                  word={word}
                  langCode={learn}
                  speechCode={learnLang?.speechCode}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {visible.length === 0 && (
        <p className="text-muted-foreground">{translate("dictionary.empty")}</p>
      )}
    </div>
  );
}

function MasteryBar({ stat }) {
  const { t: translate } = useTranslation();
  const total = (stat?.correct ?? 0) + (stat?.wrong ?? 0);

  if (total === 0) {
    return (
      <div className="mt-1.5 flex items-center gap-2">
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
    <div className="mt-1.5 flex items-center gap-2">
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

function FilterChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border-2 px-3 py-1.5 text-sm font-bold transition-transform active:scale-95 ${
        active
          ? "border-brand bg-brand text-brand-foreground"
          : "border-border bg-card hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}
