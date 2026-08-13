import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const TILES = [
  { to: "/games", key: "home.games", emoji: "🎮", color: "bg-brand" },
  { to: "/dictionary", key: "home.dictionary", emoji: "📖", color: "bg-sky" },
  {
    to: "/achievements",
    key: "home.achievements",
    emoji: "🏆",
    color: "bg-sun",
  },
  { to: "/settings", key: "home.settings", emoji: "⚙️", color: "bg-grape" },
];

export default function Home() {
  const { t: translate } = useTranslation();

  return (
    <div className="space-y-6">
      <section className="animate-fade-up text-center">
        <h1 className="text-2xl font-black sm:text-4xl">
          {translate("home.title")}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {translate("home.subtitle")}
        </p>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {TILES.map((tile, i) => (
          <Link
            key={tile.to}
            to={tile.to}
            style={{ animationDelay: `${i * 80}ms` }}
            className={`animate-pop-in group flex flex-col items-center justify-center gap-2 rounded-2xl ${tile.color} p-8 text-white shadow-lg transition-transform hover:-translate-y-1 hover:rotate-1 active:scale-95`}
          >
            <span className="animate-float text-6xl transition-transform group-hover:scale-125">
              {tile.emoji}
            </span>
            <span className="text-2xl font-black">{translate(tile.key)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
