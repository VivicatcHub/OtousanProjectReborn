import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

const STORAGE_KEY = "otousan.wordStats";

const ERROR_WEIGHT = 4;

export function errorRate(stat) {
  const correct = stat?.correct ?? 0;
  const wrong = stat?.wrong ?? 0;
  return (wrong + 0.5) / (correct + wrong + 1);
}

export function weightForStat(stat) {
  return 1 + ERROR_WEIGHT * errorRate(stat);
}

function loadWordStats() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

const WordStatsContext = createContext(null);

export function WordStatsProvider({ children }) {
  const [stats, setStats] = useState(loadWordStats);

  const statsRef = useRef(stats);

  const persist = useCallback((next) => {
    statsRef.current = next;
    setStats(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const recordWord = useCallback(
    (learnLang, wordId, correct) => {
      if (!learnLang || !wordId) return;
      const cur = statsRef.current;
      const langMap = cur[learnLang] ?? {};
      const s = langMap[wordId] ?? { correct: 0, wrong: 0 };
      const nextStat = {
        correct: s.correct + (correct ? 1 : 0),
        wrong: s.wrong + (correct ? 0 : 1),
      };
      persist({ ...cur, [learnLang]: { ...langMap, [wordId]: nextStat } });
    },
    [persist],
  );

  const getWordStat = useCallback(
    (learnLang, wordId) => stats[learnLang]?.[wordId] ?? null,
    [stats],
  );

  const wordErrorRate = useCallback(
    (learnLang, wordId) => errorRate(stats[learnLang]?.[wordId]),
    [stats],
  );

  const wordWeight = useCallback(
    (learnLang, wordId) => weightForStat(statsRef.current[learnLang]?.[wordId]),
    [],
  );

  const resetWordStats = useCallback(() => persist({}), [persist]);

  const value = useMemo(
    () => ({
      stats,
      recordWord,
      getWordStat,
      wordErrorRate,
      wordWeight,
      resetWordStats,
    }),
    [stats, recordWord, getWordStat, wordErrorRate, wordWeight, resetWordStats],
  );

  return (
    <WordStatsContext.Provider value={value}>
      {children}
    </WordStatsContext.Provider>
  );
}

export function useWordStats() {
  const ctx = useContext(WordStatsContext);
  if (!ctx)
    throw new Error("useWordStats must be used inside <WordStatsProvider>");
  return ctx;
}
