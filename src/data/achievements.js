export const ACHIEVEMENTS = [
  {
    id: "firstGame",
    emoji: "🌱",
    color: "grass",
    unlock: (s) => s.totalPlays >= 1,
  },
  {
    id: "tenGames",
    emoji: "🎮",
    color: "sky",
    unlock: (s) => s.totalPlays >= 10,
  },
  {
    id: "fiftyGames",
    emoji: "🏅",
    color: "sun",
    unlock: (s) => s.totalPlays >= 50,
  },
  {
    id: "explorer",
    emoji: "🧭",
    color: "grape",
    unlock: (s) =>
      s.games.quiz.plays >= 1 &&
      s.games.imagier.plays >= 1 &&
      s.games.writing.plays >= 1,
  },
  {
    id: "perfectQuiz",
    emoji: "🧠",
    color: "brand",
    unlock: (s) => s.games.quiz.perfect >= 1,
  },
  {
    id: "perfectImagier",
    emoji: "🖼️",
    color: "brand",
    unlock: (s) => s.games.imagier.perfect >= 1,
  },
  {
    id: "perfectWriting",
    emoji: "✍️",
    color: "brand",
    unlock: (s) => s.games.writing.perfect >= 1,
  },
  {
    id: "perfectMemory",
    emoji: "🧩",
    color: "brand",
    unlock: (s) => (s.games.memory?.perfect ?? 0) >= 1,
  },
  {
    id: "streak10",
    emoji: "🔥",
    color: "sun",
    unlock: (s) => s.bestStreak >= 10,
  },
  {
    id: "streak25",
    emoji: "⚡",
    color: "sun",
    unlock: (s) => s.bestStreak >= 25,
  },
  {
    id: "hundredCorrect",
    emoji: "💯",
    color: "sky",
    unlock: (s) => s.totalCorrect >= 100,
  },
  {
    id: "perfectionist",
    emoji: "🌟",
    color: "grape",
    unlock: (s) => s.perfectCount >= 10,
  },
  {
    id: "dedicated",
    emoji: "📅",
    color: "grass",
    unlock: (s) => Object.keys(s.history).length >= 3,
  },
];
