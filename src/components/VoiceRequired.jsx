import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export function VoiceRequired() {
  const { t: translate } = useTranslation();
  return (
    <div className="space-y-6 text-center">
      <p className="text-6xl">🔇</p>
      <h1 className="text-3xl font-black">
        {translate("voice.requiredTitle")}
      </h1>
      <p className="text-lg text-muted-foreground">
        {translate("voice.requiredHint")}
      </p>
      <Button asChild size="lg" variant="grass">
        <Link to="/settings">{translate("voice.goToSettings")}</Link>
      </Button>
    </div>
  );
}
