import { useCallback, useState } from "react";

const PREFIX = "otousan.custom."; // one saved custom setup per game

export function useCustomSettings(gameKey, defaults) {
  const storageKey = PREFIX + gameKey;

  const [values, setValues] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      return { ...defaults, ...saved };
    } catch {
      return defaults;
    }
  });

  const set = useCallback(
    (key, value) => {
      setValues((prev) => {
        const next = { ...prev, [key]: value };
        localStorage.setItem(storageKey, JSON.stringify(next));
        return next;
      });
    },
    [storageKey],
  );

  return [values, set];
}
