import { Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { WelcomeSettings } from "@/components/WelcomeSettings";
import { useSettings } from "@/context/SettingsContext";
import Home from "@/pages/Home";
import Games from "@/pages/Games";
import Dictionary from "@/pages/Dictionary";
import Achievements from "@/pages/Achievements";
import SettingsPage from "@/pages/Settings";
import ImagierSetup from "@/pages/games/ImagierSetup";
import Imagier from "@/pages/games/Imagier";
import QuizSetup from "@/pages/games/QuizSetup";
import Quiz from "@/pages/games/Quiz";
import WritingSetup from "@/pages/games/WritingSetup";
import Writing from "@/pages/games/Writing";
import MemorySetup from "@/pages/games/MemorySetup";
import Memory from "@/pages/games/Memory";

export default function App() {
  const { configured } = useSettings();

  if (!configured) return <WelcomeSettings />;

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/games" element={<Games />} />
        <Route path="/games/imagier" element={<ImagierSetup />} />
        <Route path="/games/imagier/play" element={<Imagier />} />
        <Route path="/games/quiz" element={<QuizSetup />} />
        <Route path="/games/quiz/play" element={<Quiz />} />
        <Route path="/games/writing" element={<WritingSetup />} />
        <Route path="/games/writing/play" element={<Writing />} />
        <Route path="/games/memory" element={<MemorySetup />} />
        <Route path="/games/memory/play" element={<Memory />} />
        <Route path="/dictionary" element={<Dictionary />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Layout>
  );
}
