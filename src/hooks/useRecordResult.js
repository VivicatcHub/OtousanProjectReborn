import { useEffect, useRef } from "react";
import { useStats } from "@/context/StatsContext";

export function useRecordResult(active, build) {
  const { recordGame } = useStats();
  const done = useRef(false);

  useEffect(() => {
    if (active && !done.current) {
      done.current = true;
      recordGame(build());
    } else if (!active) {
      done.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
}
