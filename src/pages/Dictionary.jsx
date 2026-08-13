import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useData,
  getTranslation,
  getText,
  hasCategory,
  displayEmoji,
} from "@/hooks/useData";
import { useSettings } from "@/context/SettingsContext";
import { useWordStats } from "@/context/WordStatsContext";
import { dataProvider } from "@/services/dataProvider";
import { Card, CardContent } from "@/components/ui/card";
import { SpeakButton } from "@/components/SpeakButton";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 30;

export default function Dictionary() {
  const { t: translate } = useTranslation();
  const { words, languages, loading } = useData();
  const { known, learn } = useSettings();
  const { getWordStat } = useWordStats();
  const [category, setCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    dataProvider.getCategories(learn).then(setCategories);
    setCategory("all");
  }, [learn]);

  const learnLang = languages.find((l) => l.code === learn);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return words
      .filter((w) => {
        const knownTr = getTranslation(w, known);
        const learnTr = getTranslation(w, learn);
        if (!knownTr || !learnTr) return false;
        if (!hasCategory(w, category)) return false;
        if (!q) return true;
        return [
          knownTr.text,
          knownTr.romaji,
          learnTr.text,
          learnTr.romaji,
        ].some((s) => s && s.toLowerCase().includes(q));
      })
      .sort((a, b) => a.id.localeCompare(b.id));
  }, [words, known, learn, category, query]);

  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  useEffect(() => {
    setPage(1);
  }, [known, learn, category, query]);
  const safePage = Math.min(page, pageCount);
  const paged = visible.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  if (loading) return <p>{translate("common.loading")}</p>;

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-black">{translate("dictionary.title")}</h1>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={translate("dictionary.search")}
        className="w-full rounded-full border-2 border-border bg-card px-4 py-2.5 text-base font-semibold outline-none transition-colors focus:border-brand"
      />

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
        {paged.map((word, i) => {
          const learnTr = getTranslation(word, learn);
          return (
            <Card
              key={`${word.id}-${i}`}
              style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
              className="animate-fade-up transition-transform hover:-translate-y-0.5"
            >
              <CardContent className="flex items-center gap-4 p-4">
                <span className="text-4xl">{displayEmoji(word)}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-muted-foreground">
                    {getText(word, known)}
                  </p>
                  <p className="truncate text-xl font-extrabold">
                    {getText(word, learn)}
                  </p>
                  {(() => {
                    const extra = [learnTr.romaji]
                      .filter((x) => x && x !== learnTr.text)
                      .join(" · ");
                    return extra ? (
                      <p className="truncate text-xs text-muted-foreground">
                        {extra}
                      </p>
                    ) : null;
                  })()}
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

      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="rounded-full border-2 border-border bg-card px-4 py-2 text-sm font-bold transition-transform active:scale-95 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            {translate("dictionary.pagination.prev")}
          </button>
          <span className="text-sm font-bold text-muted-foreground">
            {translate("dictionary.pagination.page", {
              current: safePage,
              total: pageCount,
            })}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            disabled={safePage === pageCount}
            className="rounded-full border-2 border-border bg-card px-4 py-2 text-sm font-bold transition-transform active:scale-95 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            {translate("dictionary.pagination.next")}
          </button>
        </div>
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
