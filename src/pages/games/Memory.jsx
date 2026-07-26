import { Link, useSearchParams } from "react-router-dom";
import { RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useMemoryGame } from "@/hooks/useMemoryGame";
import { getText } from "@/hooks/useData";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRecordResult } from "@/hooks/useRecordResult";

function findFactorClosestToRoot(z) {
  const root = Math.sqrt(z);
  let diff = Infinity;
  let val = 1;
  for (let i = 1; i <= z; i++) {
    if (z % i === 0 && Math.abs(i - root) < diff) {
      diff = Math.abs(i - root);
      val = i;
    }
  }
  return z / val;
}

export default function Memory() {
  const { t: translate } = useTranslation();
  const [params] = useSearchParams();
  const game = useMemoryGame({
    pairs: Number(params.get("pairs")) || 6,
    mode: params.get("mode") === "translation" ? "translation" : "image",
    category: params.get("category") || "all",
    pictures: params.get("pics") || "both",
  });

  useRecordResult(game.phase === "won", () => ({
    game: "memory",
    perfect: game.mistakes === 0,
    streak: 0,
    correct: game.totalPairs,
  }));

  if (game.loading) return <p>{translate("common.loading")}</p>;

  if (!game.canPlay) {
    return (
      <div className="space-y-6 text-center">
        <h1 className="text-3xl font-black">{translate("memory.title")}</h1>
        <p className="rounded-xl bg-sun/40 p-3 font-semibold">
          {translate("memory.needTwoLanguages")}
        </p>
        <Button asChild size="lg" variant="outline">
          <Link to="/games/memory">{translate("common.backToGames")}</Link>
        </Button>
      </div>
    );
  }

  if (game.phase === "won") {
    const perfect = game.mistakes === 0;
    return (
      <div className="space-y-6 text-center">
        <h1 className="text-3xl font-black">
          {perfect
            ? translate("result.perfect")
            : translate("result.wonImagier")}
        </h1>
        <p className="text-6xl">{perfect ? "🌟" : "👏"}</p>
        <p className="text-2xl font-bold">
          {translate("memory.mistakes", { count: game.mistakes })}
        </p>
        <div className="flex justify-center gap-3">
          <Button size="lg" variant="grass" onClick={game.start}>
            <RotateCcw className="h-5 w-5" /> {translate("common.replay")}
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/games">{translate("common.backToGames")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  const columns = findFactorClosestToRoot(game.cards.length);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">{translate("memory.title")}</h1>
        <span className="rounded-full bg-muted px-3 py-1 text-sm font-bold">
          ❌ {game.mistakes} · 🧩 {game.remaining}
        </span>
      </div>

      <p className="text-center font-semibold text-muted-foreground">
        {translate("memory.prompt")}
      </p>

      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {game.cards.map((card, index) => {
          const faceUp = card.matched || game.flipped.includes(index);
          const wrong =
            game.lock && game.penalty && game.flipped.includes(index);

          return (
            <button
              key={card.id}
              onClick={() => game.clickCard(index)}
              disabled={faceUp}
              aria-label={translate("memory.cardAria")}
              className={cn(
                "flex aspect-square items-center justify-center rounded-2xl border-2 p-1 text-center shadow-sm transition-transform active:scale-95",
                faceUp
                  ? "border-border bg-card"
                  : "border-sky bg-sky text-white hover:-translate-y-0.5",
                card.matched && "border-grass bg-grass/15 animate-pop",
                wrong && "animate-shake border-brand",
              )}
            >
              {faceUp ? (
                card.type === "image" && card.word.emoji ? (
                  <span role="img" className="text-4xl sm:text-5xl">
                    {card.word.emoji}
                  </span>
                ) : (
                  <span className="text-base font-black leading-tight sm:text-xl">
                    {getText(card.word, card.lang)}
                  </span>
                )
              ) : (
                <span className="text-3xl font-black opacity-90 sm:text-4xl">
                  ?
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
