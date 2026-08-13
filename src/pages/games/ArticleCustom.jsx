import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Play } from "lucide-react";
import { useCustomSettings } from "@/hooks/useCustomSettings";
import { useGameCategories } from "@/hooks/useGameCategories";
import { Field, Select, PictureFilter } from "@/pages/games/ImagierSetup";
import { BackLink } from "@/pages/games/ImagierCustom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const DEFAULTS = {
  mode: "classic",
  image: 1,
  pics: "both",
  category: "all",
};

export default function ArticleCustom() {
  const { t: translate } = useTranslation();
  const navigate = useNavigate();
  const [values, set] = useCustomSettings("article", DEFAULTS);
  const { categories, canPlay, ready } = useGameCategories("article", {
    pictures: values.pics,
  });

  useEffect(() => {
    if (!ready) return;
    if (
      values.category !== "all" &&
      !categories.some((c) => c.id === values.category)
    )
      set("category", "all");
  }, [ready, categories]);

  const play = () =>
    navigate(
      `/games/article/play?${new URLSearchParams({
        image: values.image,
        category: values.category,
        pics: values.pics,
        ...(values.mode === "endless" ? { inf: 1 } : {}),
      })}`,
    );

  return (
    <div className="space-y-6">
      <BackLink to="/games/article" label={translate("common.back")} />
      <div>
        <h1 className="text-3xl font-black">
          {translate("articleSetup.title")} — {translate("common.custom")}
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
            <Field label={translate("articleSetup.image")}>
              <Select
                value={values.image}
                onChange={(e) => set("image", Number(e.target.value))}
              >
                <option value={1}>{translate("articleSetup.withImage")}</option>
                <option value={0}>
                  {translate("articleSetup.withoutImage")}
                </option>
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
