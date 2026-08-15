import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PresetCard } from "@/components/PresetCard";

const PRESETS = [
  {
    emoji: "🐣",
    titleKey: "flashcardsSetup.presetShortTitle",
    descKey: "flashcardsSetup.presetShortDesc",
    color: "bg-grass",
    params: { count: 5, front: "known" },
  },
  {
    emoji: "🃏",
    titleKey: "flashcardsSetup.presetNormalTitle",
    descKey: "flashcardsSetup.presetNormalDesc",
    color: "bg-sky",
    params: { count: 10, front: "known" },
  },
  {
    emoji: "🔁",
    titleKey: "flashcardsSetup.presetReverseTitle",
    descKey: "flashcardsSetup.presetReverseDesc",
    color: "bg-grape",
    params: { count: 10, front: "learn" },
  },
  {
    emoji: "🎲",
    titleKey: "flashcardsSetup.presetRandomTitle",
    descKey: "flashcardsSetup.presetRandomDesc",
    color: "bg-brand",
    params: { count: 10, front: "random" },
  },
];

export default function FlashcardsSetup() {
  const { t: translate } = useTranslation();
  const navigate = useNavigate();

  const play = (params) =>
    navigate(`/games/flashcards/play?${new URLSearchParams(params)}`);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">
          {translate("flashcardsSetup.title")}
        </h1>
        <p className="text-muted-foreground">
          {translate("flashcardsSetup.subtitle")}
        </p>
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
          onClick={() => navigate("/games/flashcards/custom")}
        />
      </div>
    </div>
  );
}
