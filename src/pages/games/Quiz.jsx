import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGameRound } from "@/hooks/useGameRound";
import { GameBoard } from "@/components/GameBoard";
import { getText, displayEmoji } from "@/hooks/useData";

export default function Quiz() {
  const { t: translate } = useTranslation();
  const [params] = useSearchParams();
  const showImage = params.get("image") !== "0";
  const round = useGameRound({
    direction: params.get("dir") || "known-learn",
    category: params.get("category") || "all",
    pictures: params.get("pics") || "both",
    infinite: params.get("inf") === "1",
  });

  return (
    <GameBoard
      round={round}
      gameId="quiz"
      title={translate("quiz.title")}
      renderPrompt={(question) => (
        <div className="text-center">
          {showImage && displayEmoji(question.word) && (
            <div className="animate-pop-in text-6xl">
              {displayEmoji(question.word)}
            </div>
          )}
          <div className="mt-2 text-3xl font-black">
            {getText(question.word, round.questionLang)}
          </div>
        </div>
      )}
    />
  );
}
