import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useHotkeys } from "react-hotkeys-hook";
import { ArrowLeft, ArrowRight, RotateCcw, Volume2 } from "lucide-react";
import { useFlashcards } from "@/hooks/useFlashcards";
import { useData, getText, displayEmoji } from "@/hooks/useData";
import { useSettings } from "@/context/SettingsContext";
import { Button } from "@/components/ui/button";
import { ShortcutHints } from "@/components/ShortcutHints";
import { cn } from "@/lib/utils";

export default function Flashcards() {
  const { t: translate } = useTranslation();
  const [params] = useSearchParams();
  const { languages } = useData();
  const { voice } = useSettings();

  const deck = useFlashcards({
    count: Number(params.get("count")) || 10,
    front: params.get("front") || "known",
    category: params.get("category") || "all",
    pictures: params.get("pics") || "both",
    autoVoice: params.get("say") !== "0",
  });

  const { card, flipped, done, index, total } = deck;
  const side = card ? (flipped ? card.backLang : card.frontLang) : null;

  useHotkeys(
    "space",
    (e) => {
      e.preventDefault();
      deck.flip();
    },
    { enabled: !done },
    [deck],
  );
  useHotkeys("right", () => deck.next(), { enabled: !done }, [deck]);
  useHotkeys("left", () => deck.previous(), { enabled: !done }, [deck]);
  useHotkeys("s", () => deck.speak(card?.word, side), { enabled: !done }, [
    deck,
    card,
    side,
  ]);
  useHotkeys("enter", () => (done ? deck.restart() : deck.next()), [
    deck,
    done,
  ]);

  if (deck.loading) return <p>{translate("common.loading")}</p>;

  if (!deck.canPlay) {
    return (
      <div className="animate-fade-up space-y-6 text-center">
        <h1 className="text-3xl font-black">{translate("flashcards.title")}</h1>
        <p className="rounded-xl bg-sun/40 p-3 font-semibold">
          {translate("common.notEnoughWords")}
        </p>
        <Button asChild size="lg" variant="outline">
          <Link to="/games/flashcards">{translate("common.backToGames")}</Link>
        </Button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="animate-fade-up space-y-6 text-center">
        <h1 className="text-3xl font-black">
          {translate("flashcards.finished")}
        </h1>
        <p className="animate-tada text-6xl">🎉</p>
        <p className="text-xl font-bold text-muted-foreground">
          {translate("flashcards.seenCount", { count: total })}
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" variant="grass" onClick={deck.restart}>
            <RotateCcw className="h-5 w-5" /> {translate("flashcards.again")}
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/games">{translate("common.backToGames")}</Link>
          </Button>
        </div>
        <ShortcutHints
          items={[{ keys: ["Enter"], label: translate("shortcuts.replay") }]}
        />
      </div>
    );
  }

  if (!card) return null;

  const lang = languages.find((l) => l.code === side);
  const emoji = displayEmoji(card.word);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">{translate("flashcards.title")}</h1>
        <span className="rounded-full bg-muted px-3 py-1 text-sm font-bold">
          🃏 {index + 1} / {total}
        </span>
      </div>

      <button
        type="button"
        onClick={deck.flip}
        aria-label={translate("flashcards.flip")}
        className={cn(
          "flex min-h-[16rem] w-full flex-col items-center justify-center gap-4 rounded-3xl border-4 p-6 text-center shadow-lg transition-transform active:scale-95 sm:min-h-[20rem]",
          flipped ? "border-grass bg-grass/10" : "border-sky bg-card",
        )}
      >
        <span className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
          <span aria-hidden>{lang?.flag}</span> {lang?.label}
        </span>

        {emoji && (
          <span role="img" className="animate-float text-7xl sm:text-8xl">
            {emoji}
          </span>
        )}

        <span
          key={`${index}-${flipped}`}
          className="animate-flip text-4xl font-black leading-tight sm:text-5xl"
        >
          {getText(card.word, side)}
        </span>

        <span className="text-sm font-semibold text-muted-foreground">
          {flipped
            ? translate("flashcards.tapBack")
            : translate("flashcards.tapReveal")}
        </span>
      </button>

      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          size="lg"
          disabled={index === 0}
          onClick={deck.previous}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        {voice && (
          <Button
            variant="sky"
            size="lg"
            aria-label={translate("flashcards.listen")}
            onClick={() => deck.speak(card.word, side)}
          >
            <Volume2 className="h-5 w-5" />
          </Button>
        )}

        <Button variant="grass" size="lg" onClick={deck.next}>
          {translate("common.next")} <ArrowRight className="h-5 w-5" />
        </Button>
      </div>

      <ShortcutHints
        items={[
          { keys: ["Space"], label: translate("shortcuts.flip") },
          { keys: ["←", "→"], label: translate("shortcuts.move") },
          ...(voice
            ? [{ keys: ["S"], label: translate("shortcuts.listen") }]
            : []),
        ]}
      />
    </div>
  );
}
