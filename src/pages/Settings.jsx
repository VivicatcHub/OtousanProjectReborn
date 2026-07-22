import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useData } from "@/hooks/useData";
import { useSettings } from "@/context/SettingsContext";
import { LanguagePicker } from "@/components/LanguagePicker";
import { Button } from "@/components/ui/button";
import { speak } from "@/lib/speech";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { t: translate } = useTranslation();
  const { languages, loading } = useData();
  const { known, learn, sound, voice, setKnown, setLearn, setSound, setVoice } =
    useSettings();
  const [asking, setAsking] = useState(false); // showing the "did you hear it?" step

  if (loading) return <p>{translate("common.loading")}</p>;

  const knownSpeech = languages.find((l) => l.code === known)?.speechCode;

  const testVoice = () => {
    speak(translate("settings.voiceTestSentence"), knownSpeech); // uses the same engine as the games
    setAsking(true);
  };

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

      <Toggle
        label={translate("settings.sound")}
        hint={translate("settings.soundHint")}
        checked={sound}
        onChange={() => setSound(!sound)}
      />

      {/* Robot voice: some devices have no text-to-speech, so let the child test it. */}
      <div className="space-y-3 rounded-2xl border-2 border-border bg-card p-4">
        <Toggle
          label={translate("settings.voice")}
          hint={translate("settings.voiceHint")}
          checked={voice}
          onChange={() => {
            setVoice(!voice);
            setAsking(false);
          }}
          bare
        />

        <Button type="button" variant="sky" onClick={testVoice}>
          🔊 {translate("settings.voiceTest")}
        </Button>

        {asking && (
          <div className="space-y-2 rounded-xl bg-muted p-3">
            <p className="font-bold">{translate("settings.voiceHeard")}</p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="grass"
                onClick={() => {
                  setVoice(true);
                  setAsking(false);
                }}
              >
                {translate("settings.voiceKeep")}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setVoice(false);
                  setAsking(false);
                }}
              >
                {translate("settings.voiceDisable")}
              </Button>
            </div>
          </div>
        )}

        {!voice && (
          <p className="rounded-xl bg-sun/40 p-3 text-sm font-semibold">
            {translate("settings.voiceOffNote")}
          </p>
        )}
      </div>
    </div>
  );
}

function Toggle({ label, hint, checked, onChange, bare }) {
  const inner = (
    <>
      <span>
        <span className="block text-lg font-black">{label}</span>
        <span className="block text-sm font-semibold text-muted-foreground">
          {hint}
        </span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={cn(
          "relative h-8 w-14 shrink-0 rounded-full transition-colors",
          checked ? "bg-grass" : "bg-muted",
        )}
      >
        <span
          className={cn(
            "absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-6" : "translate-x-0",
          )}
        />
      </button>
    </>
  );

  if (bare)
    return (
      <div className="flex items-center justify-between gap-4">{inner}</div>
    );

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border-2 border-border bg-card p-4">
      {inner}
    </div>
  );
}
