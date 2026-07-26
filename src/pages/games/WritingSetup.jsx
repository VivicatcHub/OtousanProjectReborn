import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PresetCard } from "@/components/PresetCard";

const PRESETS = [
  {
    emoji: "🐣",
    titleKey: "writingSetup.presetBeginnerTitle",
    descKey: "writingSetup.presetBeginnerDesc",
    color: "bg-grass",
    params: { hint: "underscores", forgiving: 1, image: 1 },
  },
  {
    emoji: "🙈",
    titleKey: "writingSetup.presetNoHintTitle",
    descKey: "writingSetup.presetNoHintDesc",
    color: "bg-sky",
    params: { hint: "hidden", forgiving: 1, image: 1 },
  },
  {
    emoji: "🔥",
    titleKey: "writingSetup.presetStrictTitle",
    descKey: "writingSetup.presetStrictDesc",
    color: "bg-brand",
    params: { hint: "hidden", forgiving: 0, image: 1 },
  },
  {
    emoji: "♾️",
    titleKey: "writingSetup.presetEndlessTitle",
    descKey: "writingSetup.presetEndlessDesc",
    color: "bg-sun text-foreground",
    params: { hint: "underscores", forgiving: 1, image: 1, inf: 1 },
  },
];

export default function WritingSetup() {
  const { t: translate } = useTranslation();
  const navigate = useNavigate();

  const play = (params) =>
    navigate(`/games/writing/play?${new URLSearchParams(params)}`);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">
          {translate("writingSetup.title")}
        </h1>
        <p className="text-muted-foreground">{translate("games.chooseHow")}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {PRESETS.map((p) => (
          <PresetCard
            key={p.titleKey}
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
          onClick={() => navigate("/games/writing/custom")}
        />
      </div>
    </div>
  );
}
