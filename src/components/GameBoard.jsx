import { Link } from "react-router-dom";
import { Check, X, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ScoreBar } from "@/components/ScoreBar";
import { SpeakButton } from "@/components/SpeakButton";
import { getText } from "@/hooks/useData";
import { playWord } from "@/lib/audio";
import { cn } from "@/lib/utils";
import { useHotkeys } from "react-hotkeys-hook";
import { useRecordResult } from "@/hooks/useRecordResult";

export function GameBoard({ round, title, renderPrompt, gameId }) {
  const { t: translate } = useTranslation();
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
  } = round;

  useRecordResult(finished, () => ({
    game: gameId,
    perfect: !infinite && score === total,
    streak: infinite ? score : 0,
    correct: score,
  }));

  const answered = picked !== null;
  const answerSpeech = answerLangObj?.speechCode;

  const shortcutKeys = ["D", "J", "F", "K"];

  const pickOption = (i) => {
    if (picked !== null) {
      round.next();
    } else {
      const option = question.options[i];
      round.answer(option);
      playWord(option, answerLang, answerSpeech); // read the choice aloud
    }
  };

  useHotkeys("d", () => pickOption(0));
  useHotkeys("j", () => pickOption(1));
  useHotkeys("f", () => pickOption(2));
  useHotkeys("k", () => pickOption(3));
  useHotkeys("enter", () => round.next());

  if (loading) return <p>{translate("common.loading")}</p>;

  if (!ready) {
    return (
      <div className="space-y-6 text-center">
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
      <div className="space-y-6 text-center">
        <h1 className="text-3xl font-black">
          {infinite
            ? translate("result.endlessOver")
            : perfect
              ? translate("result.perfect")
              : translate("result.wonQuiz")}
        </h1>
        <p className="text-6xl">{infinite ? "🏁" : perfect ? "🌟" : "👏"}</p>
        <p className="text-2xl font-bold">
          {infinite
            ? translate("result.streak", { count: score })
            : translate("result.score", { score, total })}
        </p>
        <div className="flex justify-center gap-3">
          <Button size="lg" variant="grass" onClick={round.restart}>
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
      <h1 className="text-2xl font-black">{title}</h1>
      <ScoreBar
        current={index}
        total={total}
        score={score}
        infinite={infinite}
      />

      <div className="flex flex-col items-center gap-3 py-4">
        {renderPrompt(question)}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {question.options.map((option, i) => {
          const isAnswer =
            gameId === "article"
              ? option === question.word.translations.fr.article
              : option.id === question.word.id;
          const isPicked = picked === option;

          let state = "border-border bg-card hover:bg-muted";
          if (answered && isAnswer) state = "border-grass bg-grass text-white";
          else if (answered && isPicked)
            state = "border-brand bg-brand text-white";
          else if (answered) state = "border-border bg-card opacity-60";

          return (
            <button
              key={option.id}
              onClick={() => {
                pickOption(i);
              }}
              className={cn(
                "flex items-center justify-between rounded-2xl border-2 px-5 py-4 text-left text-xl font-bold transition-transform active:scale-95",
                state,
              )}
            >
              <span className="flex items-center gap-3" key={option.id}>
                {!answered && (
                  <kbd className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-md border-2 border-border bg-muted text-sm font-black text-muted-foreground lg:inline-flex">
                    {shortcutKeys[i]}
                  </kbd>
                )}
                {gameId === "article" ? option : getText(option, answerLang)}
              </span>
              {answered && isAnswer && <Check className="h-6 w-6" />}
              {answered && isPicked && !isAnswer && <X className="h-6 w-6" />}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-muted p-4">
          <div className="flex items-center gap-2 text-lg font-bold">
            <SpeakButton
              word={question.word}
              langCode={answerLang}
              speechCode={answerSpeech}
            />
            <span>{getText(question.word, answerLang)}</span>
          </div>
          <Button size="lg" variant="sky" onClick={round.next}>
            {translate("common.next")}
          </Button>
        </div>
      )}
    </div>
  );
}
