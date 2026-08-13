import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Volume2, BookOpen } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { PresetCard } from "@/components/PresetCard";
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

export const GRID_OPTIONS = [
  4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 26, 27, 28, 30, 32,
];

export default function ImagierSetup() {
  const { t: translate } = useTranslation();
  const navigate = useNavigate();
  const { voice } = useSettings();
  const [prompt, setPrompt] = useState(voice ? "voice" : "text");

  useEffect(() => {
    if (!voice) setPrompt("text");
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
        {PRESETS.map((p, i) => (
          <PresetCard
            key={p.titleKey}
            delay={i * 70}
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

        <PresetCard
          emoji="🎛️"
          title={translate("common.custom")}
          description={translate("common.customDesc")}
          onClick={() => navigate("/games/imagier/custom")}
        />
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

export function PictureFilter({ value, onChange }) {
  const { t: translate } = useTranslation();
  return (
    <Field label={translate("common.pictures")}>
      <Select value={value} onChange={onChange}>
        <option value="both">{translate("common.picBoth")}</option>
        <option value="emoji">{translate("common.picEmoji")}</option>
        <option value="text">{translate("common.picText")}</option>
      </Select>
    </Field>
  );
}
