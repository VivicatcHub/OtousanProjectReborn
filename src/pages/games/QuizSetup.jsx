import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PresetCard } from "@/components/PresetCard";

const PRESETS = [
  {
    emoji: "❓",
    titleKey: "quizSetup.presetClassicTitle",
    descKey: "quizSetup.presetClassicDesc",
    color: "bg-sun text-foreground",
    params: { dir: "known-learn", image: 1 },
  },
  {
    emoji: "🧠",
    titleKey: "quizSetup.presetNoImageTitle",
    descKey: "quizSetup.presetNoImageDesc",
    color: "bg-grape",
    params: { dir: "known-learn", image: 0 },
  },
  {
    emoji: "🔄",
    titleKey: "quizSetup.presetReverseTitle",
    descKey: "quizSetup.presetReverseDesc",
    color: "bg-sky",
    params: { dir: "learn-known", image: 1 },
  },
  {
    emoji: "♾️",
    titleKey: "quizSetup.presetEndlessTitle",
    descKey: "quizSetup.presetEndlessDesc",
    color: "bg-grass",
    params: { dir: "known-learn", image: 1, inf: 1 },
  },
];

export default function QuizSetup() {
  const { t: translate } = useTranslation();
  const navigate = useNavigate();

  const play = (params) =>
    navigate(`/games/quiz/play?${new URLSearchParams(params)}`);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">{translate("quizSetup.title")}</h1>
        <p className="text-muted-foreground">{translate("games.chooseHow")}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {PRESETS.map((p, i) => (
          <PresetCard
            key={p.titleKey}
            delay={i * 70}
            emoji={p.emoji}
            title={translate(p.titleKey)}
            description={translate(p.descKey)}
            color={p.color}
            onClick={() => play(p.params)}
          />
        ))}

        <PresetCard
          emoji="🎛️"
          title={translate("common.custom")}
          description={translate("common.customDesc")}
          onClick={() => navigate("/games/quiz/custom")}
        />
      </div>
    </div>
  );
}
