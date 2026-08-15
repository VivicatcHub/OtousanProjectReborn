import { Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { WelcomeSettings } from "@/components/WelcomeSettings";
import { useSettings } from "@/context/SettingsContext";
import Home from "@/pages/Home";
import Games from "@/pages/Games";
import Dictionary from "@/pages/Dictionary";
import WordDetail from "@/pages/WordDetail";
import Achievements from "@/pages/Achievements";
import SettingsPage from "@/pages/Settings";
import ImagierSetup from "@/pages/games/ImagierSetup";
import ImagierCustom from "@/pages/games/ImagierCustom";
import Imagier from "@/pages/games/Imagier";
import QuizSetup from "@/pages/games/QuizSetup";
import QuizCustom from "@/pages/games/QuizCustom";
import Quiz from "@/pages/games/Quiz";
import ArticleSetup from "@/pages/games/ArticleSetup";
import ArticleCustom from "@/pages/games/ArticleCustom";
import Article from "@/pages/games/Article";
import WritingSetup from "@/pages/games/WritingSetup";
import WritingCustom from "@/pages/games/WritingCustom";
import Writing from "@/pages/games/Writing";
import MemorySetup from "@/pages/games/MemorySetup";
import MemoryCustom from "@/pages/games/MemoryCustom";
import Memory from "@/pages/games/Memory";
import FlashcardsSetup from "@/pages/games/FlashcardsSetup";
import FlashcardsCustom from "@/pages/games/FlashcardsCustom";
import Flashcards from "@/pages/games/Flashcards";

export default function App() {
  const { configured } = useSettings();

  if (!configured) return <WelcomeSettings />;

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/games" element={<Games />} />
        <Route path="/games/imagier" element={<ImagierSetup />} />
        <Route path="/games/imagier/custom" element={<ImagierCustom />} />
        <Route path="/games/imagier/play" element={<Imagier />} />
        <Route path="/games/quiz" element={<QuizSetup />} />
        <Route path="/games/quiz/custom" element={<QuizCustom />} />
        <Route path="/games/quiz/play" element={<Quiz />} />
        <Route path="/games/article" element={<ArticleSetup />} />
        <Route path="/games/article/custom" element={<ArticleCustom />} />
        <Route path="/games/article/play" element={<Article />} />
        <Route path="/games/writing" element={<WritingSetup />} />
        <Route path="/games/writing/custom" element={<WritingCustom />} />
        <Route path="/games/writing/play" element={<Writing />} />
        <Route path="/games/memory" element={<MemorySetup />} />
        <Route path="/games/memory/custom" element={<MemoryCustom />} />
        <Route path="/games/memory/play" element={<Memory />} />
        <Route path="/games/flashcards" element={<FlashcardsSetup />} />
        <Route path="/games/flashcards/custom" element={<FlashcardsCustom />} />
        <Route path="/games/flashcards/play" element={<Flashcards />} />
        <Route path="/dictionary" element={<Dictionary />} />
        <Route path="/dictionary/:wordId" element={<WordDetail />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Layout>
  );
}
