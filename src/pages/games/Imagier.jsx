import { Link, useSearchParams } from "react-router-dom";
import { Volume2, RotateCcw, Play } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useImagier } from "@/hooks/useImagier";
import { useSettings } from "@/context/SettingsContext";
import { getText } from "@/hooks/useData";
import { VoiceRequired } from "@/components/VoiceRequired";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useHotkeys } from "react-hotkeys-hook";
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

export default function Imagier() {
  const { t: translate } = useTranslation();
  const { voice, known, learn } = useSettings();
  const [params] = useSearchParams();
  const gridSize = Number(params.get("grid")) || 12;
  const infinite = params.get("inf") === "1";
  const prompt = params.get("prompt") === "text" ? "text" : "voice";
  const game = useImagier({
    gridSize: gridSize,
    category: params.get("category") || "all",
    pictures: params.get("pics") || "both",
    infinite,
    prompt,
  });

  useHotkeys("r", game.repeat);

  useRecordResult(game.phase === "won" || game.phase === "over", () => ({
    game: "imagier",
    perfect: game.phase === "won" && !game.infinite && game.mistakes === 0,
    streak: game.infinite ? game.score : 0,
    correct: game.score,
  }));

  if (prompt === "voice" && !voice) return <VoiceRequired />; // voice mode needs the robot voice

  if (game.loading) return <p>{translate("common.loading")}</p>;

  if (game.phase === "intro") {
    return (
      <div className="space-y-6 text-center">
        <h1 className="text-3xl font-black">{translate("imagier.title")}</h1>
        <p className="text-lg text-muted-foreground">
          {prompt === "text"
            ? translate("imagier.introText")
            : translate("imagier.intro")}
        </p>
        {game.canPlay ? (
          <Button size="lg" variant="grass" onClick={game.start}>
            <Play className="h-5 w-5" /> {translate("imagier.start")}
          </Button>
        ) : (
          <p className="rounded-xl bg-sun/40 p-3 font-semibold">
            {translate("imagier.needTwoLanguages")}
          </p>
        )}
      </div>
    );
  }

  if (game.phase === "over") {
    return (
      <div className="space-y-6 text-center">
        <h1 className="text-3xl font-black">
          {translate("result.endlessOver")}
        </h1>
        <p className="text-6xl">🏁</p>
        <p className="text-2xl font-bold">
          {translate("result.streak", { count: game.score })}
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
          {translate("imagier.mistakes", { count: game.mistakes })}
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">{translate("imagier.title")}</h1>
        <span className="rounded-full bg-muted px-3 py-1 text-sm font-bold">
          {game.infinite ? (
            <>⭐ {game.score}</>
          ) : (
            <>
              ❌ {game.mistakes} · 🖼️ {game.remaining}
            </>
          )}
        </span>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-3 p-6">
          <p className="font-semibold text-muted-foreground">
            {prompt === "text"
              ? translate("imagier.promptText")
              : translate("imagier.prompt")}
          </p>
          {prompt === "text" ? (
            <p className="text-center text-4xl font-black">
              {getText(game.targetWord, learn)}
            </p>
          ) : (
            <Button
              size="lg"
              variant="sky"
              onClick={game.repeat}
              aria-label={translate("imagier.listenAgainAria")}
            >
              <Volume2 className="h-7 w-7" /> {translate("imagier.listenAgain")}
            </Button>
          )}
        </CardContent>
      </Card>

      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: `repeat(${findFactorClosestToRoot(gridSize)}, minmax(0, 1fr))`,
        }}
      >
        {game.slots.map((slot, index) => {
          if (!slot.word) {
            return (
              <div
                key={index}
                className="aspect-square rounded-2xl border-2 border-dashed border-border/60"
              />
            );
          }
          return (
            <button
              key={index}
              onClick={() => game.clickSlot(index)}
              aria-label="image"
              className={cn(
                "flex aspect-square items-center justify-center rounded-2xl border-2 border-border bg-card text-5xl shadow-sm transition-transform hover:-translate-y-0.5 active:scale-95 sm:text-6xl",
                index === game.shakeIndex && "animate-shake border-brand",
                index === game.poppedIndex && "animate-pop",
              )}
            >
              {slot.word.emoji ? (
                <span role="img">{slot.word.emoji}</span>
              ) : (
                <span className="px-1 text-center text-lg font-black leading-tight sm:text-2xl">
                  {getText(slot.word, known)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
