import wordsData from "@/data/words.json";
import categoriesData from "@/data/categories.json";
import languagesData from "@/data/languages.json";

export class JsonDataProvider {
  async getWords() {
    return wordsData;
  }

  async getCategories(langCode) {
    return categoriesData[langCode] ?? [];
  }

  async getLanguages() {
    return languagesData;
  }
}

export const dataProvider = new JsonDataProvider();
