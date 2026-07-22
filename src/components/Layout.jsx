import { Link, useLocation } from "react-router-dom";
import { Home, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { LanguageBadge } from "@/components/LanguageBadge";
import { AchievementToast } from "@/components/AchievementToast";

export function Layout({ children }) {
  const { pathname } = useLocation();
  const { t: translate } = useTranslation();
  const onHome = pathname === "/";

  return (
    <div className="min-h-screen">
      {/* Global: pops up whenever a badge is unlocked, on any screen. */}
      <AchievementToast />
      <header className="sticky top-0 z-10 border-b-2 border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-4 py-3">
          <div className="flex items-center gap-2">
            {!onHome && (
              <Button
                asChild
                variant="ghost"
                size="icon"
                aria-label={translate("nav.home")}
              >
                <Link to="/">
                  <Home className="h-5 w-5" />
                </Link>
              </Button>
            )}
            <Link to="/" className="text-lg font-extrabold tracking-tight">
              🌸 Otousan
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <LanguageBadge />
            <Button
              asChild
              variant="ghost"
              size="icon"
              aria-label={translate("nav.settings")}
            >
              <Link to="/settings">
                <Settings className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
    </div>
  );
}
