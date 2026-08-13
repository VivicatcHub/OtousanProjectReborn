import { useEffect, useState } from "react";

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => window.matchMedia?.(query).matches ?? false,
  );

  useEffect(() => {
    const list = window.matchMedia?.(query);
    if (!list) return;
    const onChange = (e) => setMatches(e.matches);
    setMatches(list.matches);
    list.addEventListener("change", onChange);
    return () => list.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

export function useIsPhone() {
  return useMediaQuery("(max-width: 639px)");
}

export function useIsTouch() {
  return useMediaQuery("(pointer: coarse)");
}
