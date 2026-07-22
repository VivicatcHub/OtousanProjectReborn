import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Play, Volume2, BookOpen } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { dataProvider } from "@/services/dataProvider";
import { PresetCard } from "@/components/PresetCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const PRESETS = [
  {
    emoji: "🐣",
    titleKey: "imagierSetup.presetEasy",
    count: 6,
    color: "bg-grass",
    params: { grid: 6 },
  },
  {
    emoji: "🙂",
    titleKey: "imagierSetup.presetNormal",
    count: 12,
    color: "bg-sky",
    params: { grid: 12 },
  },
  {
    emoji: "🔥",
    titleKey: "imagierSetup.presetHard",
    count: 16,
    color: "bg-brand",
    params: { grid: 16 },
  },
  {
    emoji: "😈",
    titleKey: "imagierSetup.presetVeryHard",
    count: 32,
    color: "bg-grape",
    params: { grid: 32 },
  },
  {
    emoji: "♾️",
    titleKey: "imagierSetup.presetEndless",
    descKey: "imagierSetup.presetEndlessDesc",
    color: "bg-sun text-foreground",
    params: { grid: 12, inf: 1 },
  },
];

const GRID_OPTIONS = [
  4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 26, 27, 28, 30, 32,
];

export default function ImagierSetup() {
  const { t: translate } = useTranslation();
  const navigate = useNavigate();
  const { learn, voice } = useSettings();
  const [categories, setCategories] = useState([]);
  const [grid, setGrid] = useState(12);
  const [category, setCategory] = useState("all");
  const [mode, setMode] = useState("classic");
  const [prompt, setPrompt] = useState(voice ? "voice" : "text"); // hear it vs. read it

  useEffect(() => {
    dataProvider.getCategories(learn).then(setCategories);
    setCategory("all");
  }, [learn]);

  useEffect(() => {
    if (!voice) setPrompt("text"); // no robot voice → only the reading version works
  }, [voice]);

  const play = (params) =>
    navigate(
      `/games/imagier/play?${new URLSearchParams({ ...params, prompt })}`,
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">
          {translate("imagierSetup.title")}
        </h1>
        <p className="text-muted-foreground">{translate("games.chooseHow")}</p>
      </div>

      {/* Which version: hear the word (voice) or read it in the learned language. */}
      <div>
        <p className="mb-2 text-sm font-bold text-muted-foreground">
          {translate("imagierSetup.promptTitle")}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <ModeButton
            active={prompt === "voice"}
            disabled={!voice}
            icon={<Volume2 className="h-6 w-6" />}
            label={translate("imagierSetup.promptVoice")}
            onClick={() => setPrompt("voice")}
          />
          <ModeButton
            active={prompt === "text"}
            icon={<BookOpen className="h-6 w-6" />}
            label={translate("imagierSetup.promptRead")}
            onClick={() => setPrompt("text")}
          />
        </div>
        {!voice && (
          <p className="mt-2 rounded-xl bg-sun/40 p-3 text-sm font-semibold">
            {translate("imagierSetup.voiceOffNote")}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {PRESETS.map((p) => (
          <PresetCard
            key={p.titleKey}
            emoji={p.emoji}
            title={translate(p.titleKey)}
            description={
              p.descKey
                ? translate(p.descKey)
                : translate("imagierSetup.imageCount", { count: p.count })
            }
            color={p.color}
            onClick={() => play(p.params)}
          />
        ))}

        <Card className="sm:col-span-2">
          <CardContent className="space-y-4 p-5">
            <p className="text-xl font-black">
              🎛️ {translate("common.custom")}
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
              <Field label={translate("imagierSetup.field")}>
                <Select
                  value={grid}
                  onChange={(e) => setGrid(Number(e.target.value))}
                >
                  {GRID_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {translate("imagierSetup.imageCount", { count: n })}
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
              onClick={() =>
                play({
                  grid,
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

function ModeButton({ active, disabled, icon, label, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-2 rounded-2xl border-2 p-4 text-lg font-black transition-transform active:scale-95",
        active
          ? "border-brand bg-brand text-white"
          : "border-border bg-card hover:bg-muted",
        disabled && "cursor-not-allowed opacity-40 hover:bg-card",
      )}
    >
      {icon} {label}
    </button>
  );
}

export function Field({ label, children }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-bold text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export function Select({ children, ...props }) {
  return (
    <select
      {...props}
      className="w-full rounded-xl border-2 border-border bg-card px-4 py-3 text-lg font-bold focus:border-brand"
    >
      {children}
    </select>
  );
}
