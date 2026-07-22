import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Play } from "lucide-react";
import { useData } from "@/hooks/useData";
import { useSettings } from "@/context/SettingsContext";
import { dataProvider } from "@/services/dataProvider";
import { PresetCard } from "@/components/PresetCard";
import { Field, Select } from "@/pages/games/ImagierSetup";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
  const { languages } = useData();
  const { known, learn } = useSettings();
  const [categories, setCategories] = useState([]);
  const [dir, setDir] = useState("known-learn");
  const [hint, setHint] = useState("underscores");
  const [forgiving, setForgiving] = useState(1);
  const [image, setImage] = useState(1);
  const [category, setCategory] = useState("all");
  const [mode, setMode] = useState("classic");

  useEffect(() => {
    dataProvider.getCategories(learn).then(setCategories);
    setCategory("all");
  }, [learn]);

  const label = (code) => languages.find((l) => l.code === code)?.label ?? code;
  const directions = useMemo(
    () => [
      { value: "known-learn", label: `${label(known)} → ${label(learn)}` },
      { value: "learn-known", label: `${label(learn)} → ${label(known)}` },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [languages, known, learn],
  );

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

        {/* Custom card */}
        <Card className="sm:col-span-2">
          <CardContent className="space-y-4 p-5">
            <p className="text-xl font-black">
              🎛️ {translate("common.custom")}
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label={translate("common.mode")}>
                <Select value={mode} onChange={(e) => setMode(e.target.value)}>
                  <option value="classic">
                    🎯 {translate("common.modeClassic")}
                  </option>
                  <option value="endless">
                    ♾️ {translate("common.modeEndless")}
                  </option>
                </Select>
              </Field>
              <Field label={translate("writingSetup.hint")}>
                <Select value={hint} onChange={(e) => setHint(e.target.value)}>
                  <option value="underscores">
                    ➖ {translate("writingSetup.hintUnderscores")}
                  </option>
                  <option value="hidden">
                    🙈 {translate("writingSetup.hintHidden")}
                  </option>
                </Select>
              </Field>
              <Field label={translate("writingSetup.difficulty")}>
                <Select
                  value={forgiving}
                  onChange={(e) => setForgiving(Number(e.target.value))}
                >
                  <option value={1}>🧸 {translate("writingSetup.easy")}</option>
                  <option value={0}>💪 {translate("writingSetup.hard")}</option>
                </Select>
              </Field>
              <Field label={translate("quizSetup.direction")}>
                <Select value={dir} onChange={(e) => setDir(e.target.value)}>
                  {directions.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={translate("quizSetup.image")}>
                <Select
                  value={image}
                  onChange={(e) => setImage(Number(e.target.value))}
                >
                  <option value={1}>{translate("quizSetup.withImage")}</option>
                  <option value={0}>
                    {translate("quizSetup.withoutImage")}
                  </option>
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
              onClick={() =>
                play({
                  dir,
                  hint,
                  forgiving,
                  image,
                  category,
                  ...(mode === "endless" ? { inf: 1 } : {}),
                })
              }
            >
              <Play className="h-5 w-5" /> {translate("common.play")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
