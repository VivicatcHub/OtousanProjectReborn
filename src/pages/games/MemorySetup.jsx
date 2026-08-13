import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PresetCard } from "@/components/PresetCard";

const PRESETS = [
  {
    emoji: "🐣",
    titleKey: "memorySetup.presetEasyTitle",
    descKey: "memorySetup.presetEasyDesc",
    color: "bg-grass",
    params: { pairs: 4, mode: "image" },
  },
  {
    emoji: "🙂",
    titleKey: "memorySetup.presetNormalTitle",
    descKey: "memorySetup.presetNormalDesc",
    color: "bg-sky",
    params: { pairs: 6, mode: "image" },
  },
  {
    emoji: "🔥",
    titleKey: "memorySetup.presetHardTitle",
    descKey: "memorySetup.presetHardDesc",
    color: "bg-brand",
    params: { pairs: 8, mode: "image" },
  },
  {
    emoji: "🔤",
    titleKey: "memorySetup.presetWordsTitle",
    descKey: "memorySetup.presetWordsDesc",
    color: "bg-grape",
    params: { pairs: 6, mode: "translation" },
  },
];

export default function MemorySetup() {
  const { t: translate } = useTranslation();
  const navigate = useNavigate();

  const play = (params) =>
    navigate(`/games/memory/play?${new URLSearchParams(params)}`);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">
          {translate("memorySetup.title")}
        </h1>
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
          onClick={() => navigate("/games/memory/custom")}
        />
      </div>
    </div>
  );
}
