import { useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useHotkeys } from "react-hotkeys-hook";
import { Check, RotateCcw } from "lucide-react";
import { useWritingRound, normalizeAnswer } from "@/hooks/useWritingRound";
import { Button } from "@/components/ui/button";
import { ScoreBar } from "@/components/ScoreBar";
import { SpeakButton } from "@/components/SpeakButton";
import { cn } from "@/lib/utils";
import { useRecordResult } from "@/hooks/useRecordResult";

export default function Writing() {
  const { t: translate } = useTranslation();
  const [params] = useSearchParams();
  const showImage = params.get("image") !== "0";
  const round = useWritingRound({
    direction: params.get("dir") || "known-learn",
    category: params.get("category") || "all",
    hint: params.get("hint") || "underscores",
    forgiving: params.get("forgiving") !== "0",
    infinite: params.get("inf") === "1",
  });

  const {
    loading,
    ready,
    word,
    target,
    finished,
    infinite,
    index,
    total,
    score,
    typed,
    setTyped,
    checkedValue,
    status,
    revealed,
    hint,
    questionLang,
    answerLang,
    answerLangObj,
    getText,
  } = round;

  const inputRef = useRef(null);
  useEffect(() => {
    if (!revealed && ready && !finished) inputRef.current?.focus();
  }, [index, revealed, ready, finished]);

  useHotkeys(
    "enter",
    (e) => {
      e.preventDefault();
      if (revealed) round.next();
      else if (typed.trim().length > 0) round.check();
    },
    { enableOnFormTags: ["INPUT"], enabled: ready && !finished },
    [revealed, typed, round],
  );

  useRecordResult(finished, () => ({
    game: "writing",
    perfect: !infinite && score === total,
    streak: infinite ? score : 0,
    correct: score,
  }));

  if (loading || !ready) return <p>{translate("common.loading")}</p>;

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
      <h1 className="text-2xl font-black">{translate("writing.title")}</h1>
      <ScoreBar
        current={index}
        total={total}
        score={score}
        infinite={infinite}
      />

      {/* Prompt: the word to translate, in the language the child knows. */}
      <div className="flex flex-col items-center gap-2 py-2 text-center">
        {showImage && <div className="text-6xl">{word.emoji}</div>}
        <div className="text-3xl font-black">{getText(word, questionLang)}</div>
        <span className="text-sm font-bold text-muted-foreground">
          {translate("writing.prompt", {
            lang: answerLangObj?.label ?? answerLang,
          })}
        </span>
      </div>

      {/* Character slots: fill as they type, colour wrong letters red. */}
      <AnswerSlots
        typed={typed}
        target={target}
        hint={hint}
        status={status}
        checkedValue={checkedValue}
      />

      {/* The input the child types into. */}
      <input
        ref={inputRef}
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        disabled={revealed}
        autoCapitalize="none"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        placeholder={translate("writing.placeholder")}
        className="w-full rounded-2xl border-2 border-border bg-card px-5 py-4 text-center text-2xl font-bold focus:border-brand focus:outline-none disabled:opacity-60"
      />

      {/* Retry nudge (easy mode, after the first wrong try). */}
      {status === "retry" && (
        <p className="text-center text-lg font-bold text-brand">
          {translate("writing.tryAgain")}
        </p>
      )}

      {/* Feedback + reveal once the word is decided. */}
      {revealed && (
        <div
          className={cn(
            "flex flex-col items-center gap-3 rounded-2xl p-4 text-center",
            status === "correct" ? "bg-grass/15" : "bg-brand/15",
          )}
        >
          <p className="text-xl font-black">
            {status === "correct"
              ? translate("writing.correct")
              : translate("writing.wrong")}
          </p>
          <div className="flex items-center gap-2 text-2xl font-black">
            <SpeakButton
              word={word}
              langCode={answerLang}
              speechCode={answerLangObj?.speechCode}
            />
            <span>{target}</span>
          </div>
        </div>
      )}

      {/* Action button. */}
      {revealed ? (
        <Button size="lg" variant="sky" className="w-full" onClick={round.next}>
          {translate("common.next")}
        </Button>
      ) : (
        <Button
          size="lg"
          variant="grass"
          className="w-full"
          disabled={typed.trim().length === 0}
          onClick={round.check}
        >
          <Check className="h-5 w-5" /> {translate("common.check")}
        </Button>
      )}
    </div>
  );
}

function AnswerSlots({ typed, target, hint, status, checkedValue }) {
  const reveal = status === "correct" || status === "wrong";
  const retryFeedback = status === "retry" && typed === checkedValue;
  const showCount = hint === "underscores";
  const targetChars = [...target];
  const typedChars = [...typed.trim()];

  const len = reveal
    ? targetChars.length
    : showCount
      ? Math.max(targetChars.length, typedChars.length)
      : typedChars.length;

  if (len === 0) return <div className="h-14" />; // keep layout steady

  const same = (a, b) =>
    a !== undefined &&
    b !== undefined &&
    normalizeAnswer(a) === normalizeAnswer(b);

  return (
    <div className="flex flex-wrap items-end justify-center gap-1.5">
      {Array.from({ length: len }).map((_, i) => {
        const tc = targetChars[i];
        const yc = typedChars[i];

        if (reveal && tc === " ") return <span key={i} className="w-4" />;

        let ch = "";
        let tone = "text-foreground border-border";
        if (reveal) {
          ch = tc ?? "";
          tone = same(yc, tc)
            ? "text-grass border-grass"
            : "text-brand border-brand";
        } else if (retryFeedback) {
          ch = yc ?? "";
          if (yc !== undefined)
            tone = same(yc, tc)
              ? "text-grass border-grass"
              : "text-brand border-brand";
        } else {
          ch = yc ?? "";
        }

        return (
          <span
            key={i}
            className={cn(
              "inline-flex h-14 w-10 items-center justify-center border-b-4 text-3xl font-black",
              tone,
            )}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
}
