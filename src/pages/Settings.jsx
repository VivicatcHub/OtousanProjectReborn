import { useTranslation } from "react-i18next";
import { useData } from "@/hooks/useData";
import { useSettings } from "@/context/SettingsContext";
import { LanguagePicker } from "@/components/LanguagePicker";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { t: translate } = useTranslation();
  const { languages, loading } = useData();
  const { known, learn, sound, setKnown, setLearn, setSound } = useSettings();

  if (loading) return <p>{translate("common.loading")}</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black">{translate("settings.title")}</h1>
      <LanguagePicker
        title={translate("settings.known")}
        languages={languages}
        value={known}
        onChange={setKnown}
      />
      <LanguagePicker
        title={translate("settings.learn")}
        languages={languages}
        value={learn}
        onChange={setLearn}
      />
      {known === learn && (
        <p className="rounded-xl bg-sun/40 p-3 font-semibold">
          {translate("settings.sameLanguage")}
        </p>
      )}

      <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border-2 border-border bg-card p-4">
        <span>
          <span className="block text-lg font-black">
            {translate("settings.sound")}
          </span>
          <span className="block text-sm font-semibold text-muted-foreground">
            {translate("settings.soundHint")}
          </span>
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={sound}
          onClick={() => setSound(!sound)}
          className={cn(
            "relative h-8 w-14 shrink-0 rounded-full transition-colors",
            sound ? "bg-grass" : "bg-muted",
          )}
        >
          <span
            className={cn(
              "absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-transform left-1",
              sound ? "translate-x-6" : "translate-x-0",
            )}
          />
        </button>
      </label>
    </div>
  );
}
