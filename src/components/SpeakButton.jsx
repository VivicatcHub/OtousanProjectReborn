import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { playWord } from "@/lib/audio";

export function SpeakButton({ word, langCode, speechCode, className }) {
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
