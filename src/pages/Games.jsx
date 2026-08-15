import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSettings } from "@/context/SettingsContext";

const GAMES = [
  {
    to: "/games/imagier",
    key: "games.imagier",
    emoji: "🖼️",
    color: "bg-grass",
  },
  {
    to: "/games/quiz",
    key: "games.quiz",
    emoji: "❓",
    color: "bg-sun text-foreground",
  },
  {
    to: "/games/article",
    key: "games.article",
    emoji: "😩",
    color: "bg-mint text-foreground",
  },
  {
    to: "/games/writing",
    key: "games.writing",
    emoji: "🖊",
    color: "bg-grape",
  },
  {
    to: "/games/flashcards",
    key: "games.flashcards",
    emoji: "🃏",
    color: "bg-brand text-foreground",
  },
  {
    to: "/games/memory",
    key: "games.memory",
    emoji: "🧩",
    color: "bg-sky",
  },
];

export default function Games() {
  const { t: translate } = useTranslation();
  const { articles } = useSettings();

  return (
    <div className="space-y-6">
      <h1 className="animate-fade-up text-3xl font-black">
        {translate("games.title")}
      </h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {GAMES.filter(
          (game) => game.key !== "games.article" || articles === true,
        ).map((g, i) => (
          <Link
            key={g.to}
            to={g.to}
            style={{ animationDelay: `${i * 70}ms` }}
            className={`animate-pop-in group flex items-center gap-4 rounded-2xl ${g.color} p-6 text-white shadow-lg transition-transform hover:-translate-y-1 hover:rotate-1 active:scale-95`}
          >
            <span className="animate-float text-5xl transition-transform group-hover:scale-125">
              {g.emoji}
            </span>
            <span>
              <span className="block text-2xl font-black">
                {translate(`${g.key}.title`)}
              </span>
              <span className="block text-sm font-semibold opacity-90">
                {translate(`${g.key}.description`)}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
