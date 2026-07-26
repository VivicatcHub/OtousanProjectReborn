import wordsData from "@/data/words.json";
import categoriesData from "@/data/categories.json";
import languagesData from "@/data/languages.json";

export class JsonDataProvider {
  async getWords() {
    return wordsData;
  }

  async getCategories(langCode) {
    return categoriesData
      .filter((c) => !c.languages || c.languages.includes(langCode))
      .map((c) => ({
        id: c.id,
        emoji: c.emoji,
        label: c.labels?.[langCode] ?? c.id,
      }));
  }

  async getLanguages() {
    return languagesData;
  }
}

export const dataProvider = new JsonDataProvider();
