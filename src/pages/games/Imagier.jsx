import { Link, useSearchParams } from "react-router-dom";
import { Volume2, RotateCcw, Play } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useImagier } from "@/hooks/useImagier";
import { useSettings } from "@/context/SettingsContext";
import { getText, displayEmoji } from "@/hooks/useData";
import { VoiceRequired } from "@/components/VoiceRequired";
import { AutoText } from "@/components/AutoText";
import { ShortcutHints } from "@/components/ShortcutHints";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn, gridColumns } from "@/lib/utils";
import { useIsPhone } from "@/hooks/useMediaQuery";
import { useHotkeys } from "react-hotkeys-hook";
import { useRecordResult } from "@/hooks/useRecordResult";

export default function Imagier() {
  const { t: translate } = useTranslation();
  const { voice, known, learn } = useSettings();
  const [params] = useSearchParams();
  const phone = useIsPhone();
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

  useHotkeys("r", game.repeat, { enabled: game.phase === "playing" }, [game]);
  useHotkeys(
    "enter",
    () => {
      if (game.phase === "reveal") game.dismissReveal();
      else if (game.phase !== "playing" && game.canPlay) game.start(); // intro, won and over all (re)start
    },
    [game],
  );

  useRecordResult(game.phase === "won" || game.phase === "over", () => ({
    game: "imagier",
    perfect: game.phase === "won" && !game.infinite && game.mistakes === 0,
    streak: game.infinite ? game.score : 0,
    correct: game.score,
  }));

  if (prompt === "voice" && !voice) return <VoiceRequired />;

  if (game.loading) return <p>{translate("common.loading")}</p>;

  if (game.phase === "intro") {
    return (
      <div className="animate-fade-up space-y-6 text-center">
        <h1 className="text-3xl font-black">{translate("imagier.title")}</h1>
        <p className="text-lg text-muted-foreground">
          {prompt === "text"
            ? translate("imagier.introText")
            : translate("imagier.intro")}
        </p>
        {game.canPlay ? (
          <>
            <Button size="lg" variant="grass" onClick={game.start}>
              <Play className="h-5 w-5" /> {translate("imagier.start")}
            </Button>
            <ShortcutHints
              items={[{ keys: ["Enter"], label: translate("shortcuts.start") }]}
            />
          </>
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
      <div className="animate-fade-up space-y-6 text-center">
        <h1 className="text-3xl font-black">
          {translate("result.endlessOver")}
        </h1>
        <p className="animate-tada text-6xl">🏁</p>
        <p className="text-2xl font-bold">
          {translate("result.streak", { count: game.score })}
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" variant="grass" onClick={game.start}>
            <RotateCcw className="h-5 w-5" /> {translate("common.replay")}
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

  if (game.phase === "won") {
    const perfect = game.mistakes === 0;
    return (
      <div className="animate-fade-up space-y-6 text-center">
        <h1 className="text-3xl font-black">
          {perfect
            ? translate("result.perfect")
            : translate("result.wonImagier")}
        </h1>
        <p className="animate-tada text-6xl">{perfect ? "🌟" : "👏"}</p>
        <p className="text-2xl font-bold">
          {translate("imagier.mistakes", { count: game.mistakes })}
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" variant="grass" onClick={game.start}>
            <RotateCcw className="h-5 w-5" /> {translate("common.replay")}
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

  const revealing = game.phase === "reveal";

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

      {revealing ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-6">
            <p className="font-semibold text-muted-foreground">
              {translate("imagier.answerWas")}
            </p>
            <p className="animate-pop-in text-center text-4xl font-black">
              {displayEmoji(game.targetWord)} {getText(game.targetWord, learn)}
            </p>
            <Button size="lg" variant="sky" onClick={game.dismissReveal}>
              {translate("common.next")}
            </Button>
          </CardContent>
        </Card>
      ) : (
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
                <Volume2 className="h-7 w-7" />{" "}
                {translate("imagier.listenAgain")}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <div
        className="grid gap-2 sm:gap-3"
        style={{
          gridTemplateColumns: `repeat(${gridColumns(gridSize, phone)}, minmax(0, 1fr))`,
        }}
      >
        {game.slots.map((slot, index) => {
          if (!slot.word) {
            return <div key={index} className="aspect-square rounded-2xl" />;
          }
          const emoji = displayEmoji(slot.word);
          return (
            <button
              key={index}
              onClick={() => game.clickSlot(index)}
              aria-label="image"
              style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
              className={cn(
                "flex aspect-square items-center justify-center rounded-2xl bg-card text-5xl shadow-sm transition-transform hover:-translate-y-0.5 hover:rotate-2 active:scale-95 sm:text-6xl",
                index === game.shakeIndex
                  ? "animate-shake border-brand"
                  : index === game.poppedIndex
                    ? "animate-pop"
                    : "animate-pop-in",
                revealing &&
                  (index === game.revealIndex
                    ? "animate-tada ring-4 ring-grass"
                    : index === game.shakeIndex
                      ? "ring-4 ring-brand"
                      : "opacity-60"),
              )}
            >
              {emoji ? (
                <AutoText>{emoji}</AutoText>
              ) : (
                <AutoText className="px-1 text-center font-black leading-tight">
                  {getText(slot.word, known)}
                </AutoText>
              )}
            </button>
          );
        })}
      </div>

      <ShortcutHints
        items={
          revealing
            ? [{ keys: ["Enter"], label: translate("shortcuts.next") }]
            : prompt === "voice"
              ? [{ keys: ["R"], label: translate("shortcuts.repeat") }]
              : []
        }
      />
    </div>
  );
}
