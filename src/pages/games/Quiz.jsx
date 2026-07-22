import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGameRound } from "@/hooks/useGameRound";
import { GameBoard } from "@/components/GameBoard";
import { getText } from "@/hooks/useData";

export default function Quiz() {
  const { t: translate } = useTranslation();
  const [params] = useSearchParams();
  const showImage = params.get("image") !== "0";
  const round = useGameRound({
    direction: params.get("dir") || "known-learn",
    category: params.get("category") || "all",
    infinite: params.get("inf") === "1",
  });

  return (
    <GameBoard
      round={round}
      gameId="quiz"
      title={translate("quiz.title")}
      renderPrompt={(question) => (
        <div className="text-center">
          {showImage && <div className="text-6xl">{question.word.emoji}</div>}
          <div className="mt-2 text-3xl font-black">
            {getText(question.word, round.questionLang)}
          </div>
        </div>
      )}
    />
  );
}
