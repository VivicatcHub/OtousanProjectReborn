import { useTranslation } from "react-i18next";
import { useData } from "@/hooks/useData";
import { useSettings } from "@/context/SettingsContext";
import { LanguagePicker } from "@/components/LanguagePicker";
import { Button } from "@/components/ui/button";

export function WelcomeSettings() {
  const { t: translate } = useTranslation();
  const { languages, loading } = useData();
  const { known, learn, setKnown, setLearn, confirmSettings } = useSettings();

  const sameLanguage = known === learn;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background/95 backdrop-blur">
      <div className="mx-auto flex min-h-full max-w-3xl flex-col gap-6 px-4 py-8">
        <header className="text-center">
          <h1 className="text-3xl font-black sm:text-4xl">
            {translate("welcome.title")}
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            {translate("welcome.subtitle")}
          </p>
        </header>

        {loading ? (
          <p>{translate("common.loading")}</p>
        ) : (
          <>
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
            {sameLanguage && (
              <p className="rounded-xl bg-sun/40 p-3 text-center font-semibold">
                {translate("settings.sameLanguage")}
              </p>
            )}
            <Button
              size="lg"
              className="self-center"
              disabled={sameLanguage}
              onClick={confirmSettings}
            >
              {translate("welcome.confirm")}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
