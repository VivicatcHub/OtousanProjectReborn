import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  useData,
  getTranslation,
  getText,
  displayEmoji,
} from "@/hooks/useData";
import { useSettings } from "@/context/SettingsContext";
import { useWordStats } from "@/context/WordStatsContext";
import { dataProvider } from "@/services/dataProvider";
import { dictionaryWords } from "@/lib/dictionary";
import { Card, CardContent } from "@/components/ui/card";
import { MasteryBar } from "@/components/MasteryBar";
import { SpeakButton } from "@/components/SpeakButton";

const PAGE_SIZE = 30;

const DEFAULTS = { cat: "all", q: "", page: "1" }; // params equal to these stay out of the URL

export default function Dictionary() {
  const { t: translate } = useTranslation();
  const { words, languages, loading } = useData();
  const { known, learn } = useSettings();
  const { getWordStat } = useWordStats();
  const [categories, setCategories] = useState([]);
  const [params, setParams] = useSearchParams();

  const category = params.get("cat") ?? "all";
  const query = params.get("q") ?? "";
  const page = Number(params.get("page")) || 1;

  const update = (patch) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(patch)) {
      const v = String(value);
      if (!v || v === DEFAULTS[key]) next.delete(key);
      else next.set(key, v);
    }
    setParams(next, { replace: true }); // replace: typing must not fill the history
  };

  useEffect(() => {
    dataProvider.getCategories(learn).then(setCategories);
  }, [learn]);

  useEffect(() => {
    if (categories.length === 0 || category === "all") return;
    if (!categories.some((c) => c.id === category)) update({ cat: "all" }); // category gone with the language
  }, [categories, category]);

  const learnLang = languages.find((l) => l.code === learn);

  const visible = useMemo(
    () => dictionaryWords(words, { known, learn, category, query }),
    [words, known, learn, category, query],
  );

  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const paged = visible.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const search = params.toString();

  if (loading) return <p>{translate("common.loading")}</p>;

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-black">{translate("dictionary.title")}</h1>

      <input
        type="search"
        value={query}
        onChange={(e) => update({ q: e.target.value, page: 1 })}
        placeholder={translate("dictionary.search")}
        className="w-full rounded-full border-2 border-border bg-card px-4 py-2.5 text-base font-semibold outline-none transition-colors focus:border-brand"
      />

      <div className="flex flex-wrap gap-2">
        <FilterChip
          active={category === "all"}
          onClick={() => update({ cat: "all", page: 1 })}
        >
          🌈 {translate("common.all")}
        </FilterChip>
        {categories.map((c) => (
          <FilterChip
            key={c.id}
            active={category === c.id}
            onClick={() => update({ cat: c.id, page: 1 })}
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
                <Link
                  to={`/dictionary/${word.id}${search ? `?${search}` : ""}`}
                  className="flex min-w-0 flex-1 items-center gap-4 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
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
                </Link>
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
            onClick={() => update({ page: Math.max(1, safePage - 1) })}
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
            onClick={() => update({ page: Math.min(pageCount, safePage + 1) })}
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
