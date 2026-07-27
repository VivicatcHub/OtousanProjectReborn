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
    id: "hundredGames",
    emoji: "🚀",
    color: "grape",
    unlock: (s) => s.totalPlays >= 100,
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
    id: "allGames",
    emoji: "🗺️",
    color: "grass",
    unlock: (s) =>
      ["quiz", "imagier", "writing", "memory", "article"].every(
        (g) => (s.games[g]?.plays ?? 0) >= 1,
      ),
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
    id: "firstArticle",
    emoji: "🔤",
    color: "sky",
    unlock: (s) => (s.games.article?.plays ?? 0) >= 1,
  },
  {
    id: "perfectArticle",
    emoji: "👑",
    color: "brand",
    unlock: (s) => (s.games.article?.perfect ?? 0) >= 1,
  },
  {
    id: "quizMaster",
    emoji: "🎓",
    color: "sky",
    unlock: (s) => s.games.quiz.perfect >= 5,
  },
  {
    id: "imagierMaster",
    emoji: "👀",
    color: "grass",
    unlock: (s) => s.games.imagier.perfect >= 5,
  },
  {
    id: "writingMaster",
    emoji: "📝",
    color: "grape",
    unlock: (s) => s.games.writing.perfect >= 5,
  },
  {
    id: "memoryMaster",
    emoji: "🃏",
    color: "sky",
    unlock: (s) => (s.games.memory?.perfect ?? 0) >= 5,
  },
  {
    id: "articleMaster",
    emoji: "🏛️",
    color: "grape",
    unlock: (s) => (s.games.article?.perfect ?? 0) >= 5,
  },
  {
    id: "articleStreak10",
    emoji: "🌊",
    color: "sun",
    unlock: (s) => (s.games.article?.bestStreak ?? 0) >= 10,
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
    id: "streak50",
    emoji: "☄️",
    color: "sun",
    unlock: (s) => s.bestStreak >= 50,
  },
  {
    id: "hundredCorrect",
    emoji: "💯",
    color: "sky",
    unlock: (s) => s.totalCorrect >= 100,
  },
  {
    id: "fiveHundredCorrect",
    emoji: "🎯",
    color: "sky",
    unlock: (s) => s.totalCorrect >= 500,
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
  {
    id: "weekWarrior",
    emoji: "🗓️",
    color: "grass",
    unlock: (s) => Object.keys(s.history).length >= 7,
  },
];
