import { useEffect, useMemo, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useHotkeys } from "react-hotkeys-hook";
import { ChevronLeft } from "lucide-react";
import {
  useData,
  getTranslation,
  articlesOf,
  displayEmoji,
} from "@/hooks/useData";
import { useSettings } from "@/context/SettingsContext";
import { useWordStats } from "@/context/WordStatsContext";
import { dataProvider } from "@/services/dataProvider";
import { dictionaryWords } from "@/lib/dictionary";
import { Card, CardContent } from "@/components/ui/card";
import { MasteryBar } from "@/components/MasteryBar";
import { SpeakButton } from "@/components/SpeakButton";
import { ShortcutHints } from "@/components/ShortcutHints";
import { playWord } from "@/lib/audio";
import { cn } from "@/lib/utils";

export default function WordDetail() {
  const { t: translate } = useTranslation();
  const { wordId } = useParams();
  const { words, languages, loading } = useData();
  const { known, learn, voice } = useSettings();
  const navigate = useNavigate();
  const { getWordStat } = useWordStats();
  const [categories, setCategories] = useState([]);
  const [params] = useSearchParams();

  const category = params.get("cat") ?? "all";
  const query = params.get("q") ?? "";
  const search = params.toString();
  const backTo = `/dictionary${search ? `?${search}` : ""}`;

  useEffect(() => {
    dataProvider.getCategories(learn).then(setCategories);
  }, [learn]);

  // Same list as the dictionary showed, so previous/next follow the filter used there.
  const siblings = useMemo(
    () => dictionaryWords(words, { known, learn, category, query }),
    [words, known, learn, category, query],
  );

  const index = siblings.findIndex((w) => w.id === wordId);
  const word =
    index >= 0 ? siblings[index] : words.find((w) => w.id === wordId);
  const previous = index > 0 ? siblings[index - 1] : null;
  const next =
    index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : null;

  const goTo = (target) =>
    target && navigate(`/dictionary/${target.id}${search ? `?${search}` : ""}`);

  useHotkeys("left", () => goTo(previous), [previous, search]);
  useHotkeys("right", () => goTo(next), [next, search]);
  useHotkeys("escape", () => navigate(backTo), [backTo]);
  useHotkeys(
    "s",
    () => {
      if (!voice || !word) return;
      const lang = languages.find((l) => l.code === learn);
      playWord(word, learn, lang?.speechCode);
    },
    [voice, word, learn, languages],
  );

  if (loading) return <p>{translate("common.loading")}</p>;

  if (!word) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          {translate("dictionary.notFound")}
        </p>
        <BackLink to={backTo} label={translate("dictionary.back")} />
      </div>
    );
  }

  const learnTr = getTranslation(word, learn);
  const knownTr = getTranslation(word, known);
  const articles = articlesOf(learnTr);
  const wordCategories = categories.filter((c) =>
    (word.categories ?? []).includes(c.id),
  );
  const rows = languages.filter(
    (l) => l.code !== "ja-romaji" && getTranslation(word, l.code), // romaji rides along in the ja row
  );
  const stat = getWordStat(learn, word.id);
  const total = (stat?.correct ?? 0) + (stat?.wrong ?? 0);

  return (
    <div className="space-y-5">
      <BackLink to={backTo} label={translate("dictionary.back")} />

      <Card className="animate-fade-up overflow-hidden">
        <CardContent className="flex flex-col items-center gap-2 p-6 text-center">
          <span className="text-7xl leading-none">
            {displayEmoji(word) ?? "📖"}
          </span>
          <p className="text-3xl font-black">
            {articles.length > 0 && (
              <span className="text-muted-foreground">
                {articles.join(" / ")}{" "}
              </span>
            )}
            {learnTr?.text}
          </p>
          {learnTr?.romaji && learnTr.romaji !== learnTr.text && (
            <p className="text-base font-bold text-muted-foreground">
              {learnTr.romaji}
            </p>
          )}
          <p className="text-lg text-muted-foreground">{knownTr?.text}</p>

          {wordCategories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              {wordCategories.map((c) => (
                <Link
                  key={c.id}
                  to={`/dictionary?cat=${c.id}`}
                  className="rounded-full border-2 border-border bg-muted px-3 py-1 text-sm font-bold transition-transform active:scale-95 hover:bg-card"
                >
                  {c.emoji} {c.label}
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Section title={translate("dictionary.detail.languages")}>
        <div className="divide-y-2 divide-border">
          {rows.map((lang) => {
            const tr = getTranslation(word, lang.code);
            const langArticles = articlesOf(tr);
            return (
              <div
                key={lang.code}
                className={cn(
                  "flex items-center gap-3 px-4 py-3",
                  lang.code === learn.replace("ja-romaji", "ja") &&
                    "bg-muted/60", // the romaji view lives in the ja row
                )}
              >
                <span className="text-2xl">{lang.flag}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-muted-foreground">
                    {lang.label}
                  </p>
                  <p className="truncate text-lg font-extrabold">
                    {langArticles.length > 0 && (
                      <span className="font-bold text-muted-foreground">
                        {langArticles.join(" / ")}{" "}
                      </span>
                    )}
                    {tr.text}{" "}
                    {tr.kana && tr.kana !== tr.text && "(" + tr.kana + ")"}
                  </p>
                  {tr.romaji && tr.romaji !== tr.text && (
                    <p className="truncate text-xs text-muted-foreground">
                      {tr.romaji}
                    </p>
                  )}
                </div>
                <SpeakButton
                  word={word}
                  langCode={lang.code}
                  speechCode={lang.speechCode}
                />
              </div>
            );
          })}
        </div>
      </Section>

      <Section
        title={`${translate("dictionary.detail.stats")} ${languages.find((l) => l.code === learn)?.flag ?? ""}`}
      >
        <div className="space-y-3 p-4">
          {total === 0 ? (
            <p className="text-muted-foreground">
              {translate("dictionary.detail.noStats")}
            </p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3">
                <StatTile
                  emoji="✅"
                  value={stat.correct}
                  label={translate("dictionary.detail.correct")}
                  tone="text-grass"
                />
                <StatTile
                  emoji="❌"
                  value={stat.wrong}
                  label={translate("dictionary.detail.wrong")}
                  tone="text-brand"
                />
                <StatTile
                  emoji="🎯"
                  value={`${Math.round((stat.correct / total) * 100)}%`}
                  label={translate("dictionary.detail.success")}
                  tone="text-sky"
                />
              </div>
              <MasteryBar stat={stat} />
            </>
          )}
        </div>
      </Section>

      <div className="flex items-stretch gap-3">
        <NeighbourLink
          word={previous}
          search={search}
          learn={learn}
          side="prev"
          label={translate("dictionary.pagination.prev")}
        />
        <NeighbourLink
          word={next}
          search={search}
          learn={learn}
          side="next"
          label={translate("dictionary.pagination.next")}
        />
      </div>

      <ShortcutHints
        items={[
          { keys: ["←", "→"], label: translate("shortcuts.move") },
          ...(voice
            ? [{ keys: ["S"], label: translate("shortcuts.listen") }]
            : []),
          { keys: ["Esc"], label: translate("shortcuts.back") },
        ]}
      />
    </div>
  );
}

function BackLink({ to, label }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1 text-sm font-bold text-muted-foreground hover:text-foreground"
    >
      <ChevronLeft className="h-4 w-4" />
      {label}
    </Link>
  );
}

function Section({ title, children }) {
  return (
    <Card className="animate-fade-up overflow-hidden">
      <p className="border-b-2 border-border px-4 py-2 text-sm font-black">
        {title}
      </p>
      {children}
    </Card>
  );
}

function StatTile({ emoji, value, label, tone }) {
  return (
    <div className="rounded-2xl border-2 border-border bg-muted/50 p-3 text-center">
      <p className="text-xl">{emoji}</p>
      <p className={cn("text-2xl font-black", tone)}>{value}</p>
      <p className="text-[11px] font-bold text-muted-foreground">{label}</p>
    </div>
  );
}

function NeighbourLink({ word, search, learn, side, label }) {
  if (!word) return <span className="flex-1" aria-hidden />; // keeps the other button in place

  const tr = getTranslation(word, learn);
  return (
    <Link
      to={`/dictionary/${word.id}${search ? `?${search}` : ""}`}
      aria-label={label}
      className={cn(
        "flex flex-1 items-center gap-2 rounded-2xl border-2 border-border bg-card px-4 py-3 font-bold transition-transform active:scale-95 hover:bg-muted",
        side === "next" && "justify-end text-right",
      )}
    >
      {side === "prev" && <span aria-hidden>◀</span>}
      <span className="text-2xl">{displayEmoji(word)}</span>
      <span className="truncate">{tr?.text}</span>
      {side === "next" && <span aria-hidden>▶</span>}
    </Link>
  );
}
