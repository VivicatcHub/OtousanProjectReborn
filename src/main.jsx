import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import "./i18n";
import App from "./App.jsx";
import { SettingsProvider } from "./context/SettingsContext.jsx";
import { StatsProvider } from "./context/StatsContext.jsx";
import { WordStatsProvider } from "./context/WordStatsContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        <StatsProvider>
          <WordStatsProvider>
            <App />
          </WordStatsProvider>
        </StatsProvider>
      </SettingsProvider>
    </BrowserRouter>
  </StrictMode>,
);
