import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Play } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { useCustomSettings } from "@/hooks/useCustomSettings";
import { useGameCategories } from "@/hooks/useGameCategories";
import { Field, Select, PictureFilter } from "@/pages/games/ImagierSetup";
import { BackLink } from "@/pages/games/ImagierCustom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const COUNT_OPTIONS = [5, 10, 15, 20, 30, 0]; // 0 = the whole category

const DEFAULTS = {
  count: 10,
  front: "known",
  pics: "both",
  category: "all",
  say: "1",
};

export default function FlashcardsCustom() {
  const { t: translate } = useTranslation();
  const navigate = useNavigate();
  const { voice } = useSettings();
  const [values, set] = useCustomSettings("flashcards", DEFAULTS);
  const { categories, canPlay, ready } = useGameCategories("flashcards", {
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
      `/games/flashcards/play?${new URLSearchParams({
        count: values.count,
        front: values.front,
        category: values.category,
        pics: values.pics,
        say: voice ? values.say : "0",
      })}`,
    );

  return (
    <div className="space-y-6">
      <BackLink to="/games/flashcards" label={translate("common.back")} />
      <div>
        <h1 className="text-3xl font-black">
          {translate("flashcardsSetup.title")} — {translate("common.custom")}
        </h1>
        <p className="text-muted-foreground">
          {translate("common.customDesc")}
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={translate("flashcardsSetup.front")}>
              <Select
                value={values.front}
                onChange={(e) => set("front", e.target.value)}
              >
                <option value="known">
                  🏠 {translate("flashcardsSetup.frontKnown")}
                </option>
                <option value="learn">
                  🎓 {translate("flashcardsSetup.frontLearn")}
                </option>
                <option value="random">
                  🎲 {translate("flashcardsSetup.frontRandom")}
                </option>
              </Select>
            </Field>
            <Field label={translate("flashcardsSetup.cards")}>
              <Select
                value={values.count}
                onChange={(e) => set("count", Number(e.target.value))}
              >
                {COUNT_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n === 0
                      ? `🌈 ${translate("flashcardsSetup.allCards")}`
                      : translate("flashcardsSetup.cardCount", { count: n })}
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
            <Field label={translate("flashcardsSetup.autoVoice")}>
              <Select
                value={voice ? values.say : "0"}
                disabled={!voice}
                onChange={(e) => set("say", e.target.value)}
              >
                <option value="1">
                  🔊 {translate("flashcardsSetup.autoVoiceOn")}
                </option>
                <option value="0">
                  🔇 {translate("flashcardsSetup.autoVoiceOff")}
                </option>
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
