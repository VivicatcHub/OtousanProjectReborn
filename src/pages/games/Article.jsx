import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGameArticle } from "@/hooks/useGameArticle";
import { GameBoard } from "@/components/GameBoard";
import { getText } from "@/hooks/useData";

export default function Article() {
  const { t: translate } = useTranslation();
  const [params] = useSearchParams();
  const showImage = params.get("image") !== "0";
  const round = useGameArticle({
    direction: params.get("dir") || "known-learn",
    category: params.get("category") || "all",
    pictures: params.get("pics") || "both",
    infinite: params.get("inf") === "1",
  });

  return (
    <GameBoard
      round={round}
      gameId="article"
      title={translate("article.title")}
      renderPrompt={(question) => (
        <div className="text-center">
          {showImage && question.word.emoji && (
            <div className="text-6xl">{question.word.emoji}</div>
          )}
          <div className="mt-2 text-3xl font-black">
            {getText(question.word, round.questionLang, true)}
          </div>
        </div>
      )}
    />
  );
}
