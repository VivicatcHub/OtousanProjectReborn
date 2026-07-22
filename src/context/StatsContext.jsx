import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { ACHIEVEMENTS } from "@/data/achievements";

const STORAGE_KEY = "otousan.stats";

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function blankGame() {
  return { plays: 0, perfect: 0, bestStreak: 0, correct: 0 };
}

function blankStats() {
  return {
    totalPlays: 0,
    totalCorrect: 0,
    perfectCount: 0,
    bestStreak: 0,
    games: {
      quiz: blankGame(),
      imagier: blankGame(),
      writing: blankGame(),
      memory: blankGame(),
    },
    history: {}, // { "YYYY-MM-DD": number of games that day }
    firstPlay: null,
    lastPlay: null,
    unlocked: {}, // { achievementId: "YYYY-MM-DD" it was earned }
  };
}

function loadStats() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const base = blankStats();
    return {
      ...base,
      ...saved,
      games: { ...base.games, ...(saved?.games ?? {}) },
      history: { ...(saved?.history ?? {}) },
      unlocked: { ...(saved?.unlocked ?? {}) },
    };
  } catch {
    return blankStats();
  }
}

function applyResult(stats, result) {
  const { game, perfect = false, streak = 0, correct = 0 } = result;
  const day = today();
  const g = stats.games[game] ?? blankGame();

  return {
    ...stats,
    totalPlays: stats.totalPlays + 1,
    totalCorrect: stats.totalCorrect + correct,
    perfectCount: stats.perfectCount + (perfect ? 1 : 0),
    bestStreak: Math.max(stats.bestStreak, streak),
    games: {
      ...stats.games,
      [game]: {
        plays: g.plays + 1,
        perfect: g.perfect + (perfect ? 1 : 0),
        bestStreak: Math.max(g.bestStreak, streak),
        correct: g.correct + correct,
      },
    },
    history: { ...stats.history, [day]: (stats.history[day] ?? 0) + 1 },
    firstPlay: stats.firstPlay ?? day,
    lastPlay: day,
  };
}

const StatsContext = createContext(null);

export function StatsProvider({ children }) {
  const [stats, setStats] = useState(loadStats);
  const [queue, setQueue] = useState([]);

  const statsRef = useRef(stats);

  const persist = useCallback((next) => {
    statsRef.current = next;
    setStats(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const recordGame = useCallback(
    (result) => {
      const updated = applyResult(statsRef.current, result);

      const day = today();
      const unlocked = { ...updated.unlocked };
      const fresh = [];
      for (const a of ACHIEVEMENTS) {
        if (!unlocked[a.id] && a.unlock(updated)) {
          unlocked[a.id] = day;
          fresh.push(a.id);
        }
      }
      persist({ ...updated, unlocked });
      if (fresh.length) setQueue((q) => [...q, ...fresh]);
    },
    [persist],
  );

  const dequeue = useCallback(() => setQueue((q) => q.slice(1)), []);

  const resetStats = useCallback(() => {
    persist(blankStats());
    setQueue([]);
  }, [persist]);

  const value = useMemo(
    () => ({ stats, recordGame, queue, dequeue, resetStats }),
    [stats, recordGame, queue, dequeue, resetStats],
  );

  return (
    <StatsContext.Provider value={value}>{children}</StatsContext.Provider>
  );
}

export function useStats() {
  const ctx = useContext(StatsContext);
  if (!ctx) throw new Error("useStats must be used inside <StatsProvider>");
  return ctx;
}
