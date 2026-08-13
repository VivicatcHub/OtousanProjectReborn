import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/context/SettingsContext";
import { playWord } from "@/lib/audio";

export function SpeakButton({ word, langCode, speechCode, className }) {
  const { voice } = useSettings();
  if (!voice) return null;

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label="Écouter"
      className={className}
      onClick={() => playWord(word, langCode, speechCode)}
    >
      <Volume2 className="h-5 w-5" />
    </Button>
  );
}
