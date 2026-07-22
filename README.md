# Otousan Project — Reborn 🌸

A small, colourful, **kid-friendly website to learn vocabulary** in French, English and Japanese through little games. This is a modern rebuild of the old "Mamonaku Games" site.

Built to be **easy to read and easy to extend** — no backend yet (data lives in JSON files), but structured so a real backend can be added later without a rewrite.

---

## 🚀 Getting started

```bash
npm install     # install dependencies (once)
npm run dev     # start the dev server, then open the printed URL
npm run build   # build the production version into dist/
npm run preview # preview the production build locally
```

---

## ✏️ How to change things

- **Add a word:** add an object to [src/data/words.json](src/data/words.json) (copy an existing one). Its pronunciation is generated automatically the first time it's played — nothing else to do.
- **Add a category:** add it under the right language in [src/data/categories.json](src/data/categories.json), then tag words with it.
- **Add a language:** add it to [src/data/languages.json](src/data/languages.json), then add that language's `text` to each word's `translations` and its own list in `categories.json`.
- **Change the colours / look:** edit the `@theme` block in [src/index.css](src/index.css).
- **Add a new game:** create a page in `src/pages/games/`, add a `<Route>` in [src/App.jsx](src/App.jsx), and add a tile in [src/pages/Games.jsx](src/pages/Games.jsx). Multiple-choice games can reuse [useGameRound](src/hooks/useGameRound.js) + [GameBoard](src/components/GameBoard.jsx).
