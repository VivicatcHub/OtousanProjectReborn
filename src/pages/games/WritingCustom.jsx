import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Play } from "lucide-react";
import { useData } from "@/hooks/useData";
import { useSettings } from "@/context/SettingsContext";
import { useCustomSettings } from "@/hooks/useCustomSettings";
import { useGameCategories } from "@/hooks/useGameCategories";
import { Field, Select, PictureFilter } from "@/pages/games/ImagierSetup";
import { BackLink } from "@/pages/games/ImagierCustom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const DEFAULTS = {
  mode: "classic",
  hint: "underscores",
  forgiving: 1,
  dir: "known-learn",
  image: 1,
  pics: "both",
  category: "all",
};

export default function WritingCustom() {
  const { t: translate } = useTranslation();
  const navigate = useNavigate();
  const { languages } = useData();
  const { known, learn } = useSettings();
  const [values, set] = useCustomSettings("writing", DEFAULTS);
  const { categories, canPlay, ready } = useGameCategories("writing", {
    pictures: values.pics,
  });

  useEffect(() => {
    if (!ready) return;
    if (
      values.category !== "all" &&
      !categories.some((c) => c.id === values.category)
    )
      set("category", "all"); // saved category has no playable word left
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, categories]);

  const label = (code) => languages.find((l) => l.code === code)?.label ?? code;
  const directions = useMemo(
    () => [
      { value: "known-learn", label: `${label(known)} → ${label(learn)}` },
      { value: "learn-known", label: `${label(learn)} → ${label(known)}` },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [languages, known, learn],
  );

  const play = () =>
    navigate(
      `/games/writing/play?${new URLSearchParams({
        dir: values.dir,
        hint: values.hint,
        forgiving: values.forgiving,
        image: values.image,
        category: values.category,
        pics: values.pics,
        ...(values.mode === "endless" ? { inf: 1 } : {}),
      })}`,
    );

  return (
    <div className="space-y-6">
      <BackLink to="/games/writing" label={translate("common.back")} />
      <div>
        <h1 className="text-3xl font-black">
          {translate("writingSetup.title")} — {translate("common.custom")}
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
            <Field label={translate("writingSetup.hint")}>
              <Select
                value={values.hint}
                onChange={(e) => set("hint", e.target.value)}
              >
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
                value={values.forgiving}
                onChange={(e) => set("forgiving", Number(e.target.value))}
              >
                <option value={1}>🧸 {translate("writingSetup.easy")}</option>
                <option value={0}>💪 {translate("writingSetup.hard")}</option>
              </Select>
            </Field>
            <Field label={translate("quizSetup.direction")}>
              <Select
                value={values.dir}
                onChange={(e) => set("dir", e.target.value)}
              >
                {directions.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={translate("quizSetup.image")}>
              <Select
                value={values.image}
                onChange={(e) => set("image", Number(e.target.value))}
              >
                <option value={1}>{translate("quizSetup.withImage")}</option>
                <option value={0}>{translate("quizSetup.withoutImage")}</option>
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
