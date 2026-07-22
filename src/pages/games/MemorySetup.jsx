import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Play } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { dataProvider } from "@/services/dataProvider";
import { PresetCard } from "@/components/PresetCard";
import { Field, Select } from "@/pages/games/ImagierSetup";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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

const PAIR_OPTIONS = [3, 4, 5, 6, 7, 8, 9, 10, 12];

export default function MemorySetup() {
  const { t: translate } = useTranslation();
  const navigate = useNavigate();
  const { learn } = useSettings();
  const [categories, setCategories] = useState([]);
  const [pairs, setPairs] = useState(6);
  const [mode, setMode] = useState("image");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    dataProvider.getCategories(learn).then(setCategories);
    setCategory("all");
  }, [learn]);

  const play = (params) =>
    navigate(`/games/memory/play?${new URLSearchParams(params)}`);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">{translate("memorySetup.title")}</h1>
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

        {/* Custom card */}
        <Card className="sm:col-span-2">
          <CardContent className="space-y-4 p-5">
            <p className="text-xl font-black">
              🎛️ {translate("common.custom")}
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label={translate("memorySetup.mode")}>
                <Select value={mode} onChange={(e) => setMode(e.target.value)}>
                  <option value="image">
                    🖼️ {translate("memorySetup.modeImage")}
                  </option>
                  <option value="translation">
                    🔤 {translate("memorySetup.modeWords")}
                  </option>
                </Select>
              </Field>
              <Field label={translate("memorySetup.pairs")}>
                <Select
                  value={pairs}
                  onChange={(e) => setPairs(Number(e.target.value))}
                >
                  {PAIR_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {translate("memorySetup.pairCount", { count: n })}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={translate("common.category")}>
                <Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="all">🌈 {translate("common.all")}</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.emoji} {c.label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <Button
              size="lg"
              variant="grass"
              onClick={() => play({ pairs, mode, category })}
            >
              <Play className="h-5 w-5" /> {translate("common.play")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
