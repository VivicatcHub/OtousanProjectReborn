import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Play, ArrowLeft } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { useCustomSettings } from "@/hooks/useCustomSettings";
import { useGameCategories } from "@/hooks/useGameCategories";
import {
  Field,
  Select,
  PictureFilter,
  GRID_OPTIONS,
} from "@/pages/games/ImagierSetup";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const DEFAULTS = {
  mode: "classic",
  grid: 12,
  pics: "both",
  category: "all",
  prompt: "voice",
};

export default function ImagierCustom() {
  const { t: translate } = useTranslation();
  const navigate = useNavigate();
  const { voice } = useSettings();
  const [values, set] = useCustomSettings("imagier", DEFAULTS);
  const { categories, canPlay, ready } = useGameCategories("imagier", {
    pictures: values.pics,
    min: values.grid,
  });

  useEffect(() => {
    if (!ready) return;
    if (
      values.category !== "all" &&
      !categories.some((c) => c.id === values.category)
    )
      set("category", "all");
  }, [ready, categories]);

  useEffect(() => {
    if (!voice && values.prompt !== "text") set("prompt", "text");
  }, [voice]);

  const prompt = voice ? values.prompt : "text";

  const play = () =>
    navigate(
      `/games/imagier/play?${new URLSearchParams({
        grid: values.grid,
        category: values.category,
        pics: values.pics,
        prompt,
        ...(values.mode === "endless" ? { inf: 1 } : {}),
      })}`,
    );

  return (
    <div className="space-y-6">
      <BackLink to="/games/imagier" label={translate("common.back")} />
      <div>
        <h1 className="text-3xl font-black">
          {translate("imagierSetup.title")} — {translate("common.custom")}
        </h1>
        <p className="text-muted-foreground">
          {translate("common.customDesc")}
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={translate("common.mode")}>
              <Select
                value={values.mode}
                onChange={(e) => set("mode", e.target.value)}
              >
                <option value="classic">
                  🎯 {translate("common.modeClassic")}
                </option>
                <option value="endless">
                  ♾️ {translate("common.modeEndless")}
                </option>
              </Select>
            </Field>
            <Field label={translate("imagierSetup.promptTitle")}>
              <Select
                value={prompt}
                disabled={!voice}
                onChange={(e) => set("prompt", e.target.value)}
              >
                <option value="voice">
                  🔊 {translate("imagierSetup.promptVoice")}
                </option>
                <option value="text">
                  📖 {translate("imagierSetup.promptRead")}
                </option>
              </Select>
            </Field>
            <Field label={translate("imagierSetup.field")}>
              <Select
                value={values.grid}
                onChange={(e) => set("grid", Number(e.target.value))}
              >
                {GRID_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {translate("imagierSetup.imageCount", { count: n })}
                  </option>
                ))}
              </Select>
            </Field>
            <PictureFilter
              value={values.pics}
              onChange={(e) => set("pics", e.target.value)}
            />
            <Field label={translate("common.category")}>
              <Select
                value={values.category}
                onChange={(e) => set("category", e.target.value)}
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
          {!voice && (
            <p className="rounded-xl bg-sun/40 p-3 text-sm font-semibold">
              {translate("imagierSetup.voiceOffNote")}
            </p>
          )}
          {!canPlay && (
            <p className="rounded-xl bg-sun/40 p-3 text-sm font-semibold">
              {translate("common.notEnoughWords")}
            </p>
          )}
          <Button size="lg" variant="grass" disabled={!canPlay} onClick={play}>
            <Play className="h-5 w-5" /> {translate("common.play")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function BackLink({ to, label }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1 text-sm font-bold text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" /> {label}
    </Link>
  );
}
