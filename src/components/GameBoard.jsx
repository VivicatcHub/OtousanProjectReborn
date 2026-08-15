import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Check, X, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ScoreBar } from "@/components/ScoreBar";
import { SpeakButton } from "@/components/SpeakButton";
import { ShortcutHints } from "@/components/ShortcutHints";
import { useSettings } from "@/context/SettingsContext";
import { getText } from "@/hooks/useData";
import { playWord } from "@/lib/audio";
import { cn } from "@/lib/utils";
import { useHotkeys } from "react-hotkeys-hook";
import { useRecordResult } from "@/hooks/useRecordResult";

const NEXT_DELAY = 1000;

export function GameBoard({ round, title, renderPrompt, gameId }) {
  const { t: translate } = useTranslation();
  const { voice } = useSettings();
  const {
    loading,
    ready,
    question,
    finished,
    index,
    total,
    score,
    picked,
    infinite,
    answerLang,
    answerLangObj,
    isCorrectOption,
    optionKey,
    optionLabel,
    speakOnPick,
  } = round;

  useRecordResult(finished, () => ({
    game: gameId,
    perfect: !infinite && score === total,
    streak: infinite ? score : 0,
    correct: score,
  }));

  const answered = picked !== null;
  const wasRight = answered && isCorrectOption(picked);
  const answerSpeech = answerLangObj?.speechCode;

  const shortcutKeys = ["D", "J", "F", "K"];

  const pickOption = (i) => {
    if (picked !== null) {
      round.next();
    } else {
      const option = question.options[i];
      round.answer(option);
      playWord(speakOnPick(option), answerLang, answerSpeech);
    }
  };

  useEffect(() => {
    if (!wasRight) return;
    const timer = setTimeout(() => round.next(), NEXT_DELAY);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wasRight, picked, index]);

  useHotkeys("d", () => pickOption(0));
  useHotkeys("j", () => pickOption(1));
  useHotkeys("f", () => pickOption(2));
  useHotkeys("k", () => pickOption(3));
  useHotkeys("enter", () => (finished ? round.restart() : round.next()), [
    finished,
    round,
  ]);
  useHotkeys(
    "s",
    () => playWord(question.word, answerLang, answerSpeech), // only once answered, so it never gives the answer away
    { enabled: answered },
    [answered, question, answerLang, answerSpeech],
  );

  if (loading) return <p>{translate("common.loading")}</p>;

  if (!ready) {
    return (
      <div className="animate-fade-up space-y-6 text-center">
        <h1 className="text-3xl font-black">{title}</h1>
        <p className="rounded-xl bg-sun/40 p-3 font-semibold">
          {translate("common.notEnoughWords")}
        </p>
        <Button asChild size="lg" variant="outline">
          <Link to="/games">{translate("common.backToGames")}</Link>
        </Button>
      </div>
    );
  }

  if (finished) {
    const perfect = !infinite && score === total;
    return (
      <div className="animate-fade-up space-y-6 text-center">
        <h1 className="text-3xl font-black">
          {infinite
            ? translate("result.endlessOver")
            : perfect
              ? translate("result.perfect")
              : translate("result.wonQuiz")}
        </h1>
        <p className="animate-tada text-6xl">
          {infinite ? "🏁" : perfect ? "🌟" : "👏"}
        </p>
        <p className="text-2xl font-bold">
          {infinite
            ? translate("result.streak", { count: score })
            : translate("result.score", { score, total })}
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" variant="grass" onClick={round.restart}>
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

  return (
    <div className="space-y-6">
      {/* <h1 className="text-2xl font-black">{title}</h1> */}
      <ScoreBar
        current={index}
        total={total}
        score={score}
        infinite={infinite}
      />

      <div
        key={index}
        className="animate-fade-up flex flex-col items-center gap-3 py-4"
      >
        {renderPrompt(question)}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {question.options.map((option, i) => {
          const isAnswer = isCorrectOption(option);
          const isPicked = picked === option;

          let state =
            "border-border bg-card hover:bg-muted hover:-translate-y-0.5";
          let animation = "animate-pop-in";
          if (answered && isAnswer) {
            state = "border-grass bg-grass text-white";
            animation = "animate-tada";
          } else if (answered && isPicked) {
            state = "border-brand bg-brand text-white";
            animation = "animate-shake";
          } else if (answered) {
            state = "border-border bg-card opacity-60";
          }

          return (
            <button
              key={optionKey(option)}
              onClick={() => pickOption(i)}
              style={{ animationDelay: `${i * 60}ms` }}
              className={cn(
                "flex items-center justify-between rounded-2xl border-2 px-5 py-4 text-left text-xl font-bold transition-all active:scale-95",
                animation,
                state,
              )}
            >
              <span className="flex items-center gap-3">
                {!answered && (
                  <kbd className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-md border-2 border-border bg-muted text-sm font-black text-muted-foreground lg:inline-flex">
                    {shortcutKeys[i]}
                  </kbd>
                )}
                {optionLabel(option)}
              </span>
              {answered && isAnswer && <Check className="h-6 w-6" />}
              {answered && isPicked && !isAnswer && <X className="h-6 w-6" />}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="animate-fade-up flex items-center justify-between gap-3 rounded-2xl bg-muted p-4">
          <div className="flex items-center gap-2 text-lg font-bold">
            <SpeakButton
              word={question.word}
              langCode={answerLang}
              speechCode={answerSpeech}
            />
            <span>{getText(question.word, answerLang)}</span>
          </div>
          {wasRight ? (
            <span className="animate-tada text-2xl">✅</span>
          ) : (
            <Button size="lg" variant="sky" onClick={round.next}>
              {translate("common.next")}
            </Button>
          )}
        </div>
      )}

      <ShortcutHints
        items={[
          {
            keys: shortcutKeys.slice(0, question.options.length),
            label: translate("shortcuts.answer"),
          },
          { keys: ["Enter"], label: translate("shortcuts.next") },
          ...(voice && answered
            ? [{ keys: ["S"], label: translate("shortcuts.listen") }]
            : []),
        ]}
      />
    </div>
  );
}
