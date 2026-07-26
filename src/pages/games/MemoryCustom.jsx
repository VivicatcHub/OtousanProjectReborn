import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Play } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { dataProvider } from "@/services/dataProvider";
import { useCustomSettings } from "@/hooks/useCustomSettings";
import { Field, Select, PictureFilter } from "@/pages/games/ImagierSetup";
import { BackLink } from "@/pages/games/ImagierCustom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const PAIR_OPTIONS = [3, 4, 5, 6, 7, 8, 9, 10, 12];

const DEFAULTS = { mode: "image", pairs: 6, pics: "both", category: "all" };

export default function MemoryCustom() {
  const { t: translate } = useTranslation();
  const navigate = useNavigate();
  const { learn } = useSettings();
  const [values, set] = useCustomSettings("memory", DEFAULTS);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    dataProvider.getCategories(learn).then((cats) => {
      setCategories(cats);
      if (
        values.category !== "all" &&
        !cats.some((c) => c.id === values.category)
      )
        set("category", "all");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [learn]);

  const play = () =>
    navigate(
      `/games/memory/play?${new URLSearchParams({
        pairs: values.pairs,
        mode: values.mode,
        category: values.category,
        pics: values.pics,
      })}`,
    );

  return (
    <div className="space-y-6">
      <BackLink to="/games/memory" label={translate("common.back")} />
      <div>
        <h1 className="text-3xl font-black">
          {translate("memorySetup.title")} — {translate("common.custom")}
        </h1>
        <p className="text-muted-foreground">
          {translate("common.customDesc")}
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={translate("memorySetup.mode")}>
              <Select
                value={values.mode}
                onChange={(e) => set("mode", e.target.value)}
              >
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
                value={values.pairs}
                onChange={(e) => set("pairs", Number(e.target.value))}
              >
                {PAIR_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {translate("memorySetup.pairCount", { count: n })}
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
          <Button size="lg" variant="grass" onClick={play}>
            <Play className="h-5 w-5" /> {translate("common.play")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
