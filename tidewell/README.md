# Tidewell Dental — AI support assistant concept

A fictional family dental clinic in Brunswick, Melbourne, with an **AI support chat widget** built in. It is a **concept project by [Codemade Studio](https://codemade.studio)**. The clinic, team, reviews and prices are made up. Nothing you type in the chat is sent anywhere.

> **Honest by design:** the demo answers from a local knowledge base (`src/data/kb.json`) using a small retrieval scorer written for this project. It makes no LLM or paid API calls and needs no API keys. A production build would connect the same widget to an LLM grounded on the client's FAQ.

## Features
- **Clinic website (`/`):** hero, services, pricing, patient reviews, an FAQ drawn from the same knowledge base as the bot, contact details, hours and a map.
- **How it works (`/how-it-works`):** an explainer for agencies covering the script-tag embed, training on the client's FAQ, human handoff and a demo-vs-production comparison. It also has a live **retrieval playground** that shows match scores for any question.
- **Chat widget** (bottom-right, on every page):
  - A launcher with an unread badge and a teaser bubble, plus an animated open and close
  - A greeting with quick-reply chips, a typing indicator and replies that stream in
  - Answers from 34 Q&As (prices, hours, booking, location, health funds, policies), each labelled with its source and match score
  - Rich replies with links and buttons. **Book a slot** shows demo times and lets you hold one.
  - A low-confidence path: under 50% it asks "Did you mean…?", and under 30% it offers a human
  - **Talk to a human:** collects a name and email in the chat with validation and a cancel option, then shows a handoff card (demo only, nothing is sent)
  - The conversation is saved in `localStorage`, and a restart button clears it
  - Accessibility: a `role="log"` live region, Esc to close, focus moved to the input and back to the launcher, a mobile bottom sheet, and support for reduced motion

## How the retrieval works (`src/lib/retrieval.js`)
1. Text is tokenised, stop words are removed, words are lightly stemmed, and everyday words are mapped to knowledge-base terms with a synonym table (e.g. *cost → price*, *braces → aligner*).
2. A TF-IDF index is built over each entry's question, alternative phrasings, keywords and answer, with a weight for each field.
3. Unknown words are matched against the vocabulary by prefix or edit distance, which handles typos like "invisalgn" and "insurence".
4. Each entry gets a score that blends cosine similarity with query coverage. `src/lib/bot.js` then decides whether to answer, suggest options or hand off.

## Stack
React 19, Vite, Tailwind CSS 4, React Router, lucide-react. Font: Plus Jakarta Sans (Google Fonts). There are no images to license; all visuals are CSS and SVG.

```bash
npm install
npm run dev      # local dev
npm run build    # production build -> dist/
```

**Deploy (Vercel):** import the repo and use the Vite preset (build `npm run build`, output `dist`). `vercel.json` rewrites every route to `index.html` so `/how-it-works` works on refresh.

**Edit the bot's knowledge:** add or change entries in `src/data/kb.json`. Each entry has `q`, `alt`, `keywords`, `topic`, `a` (supports `**bold**` and `[link](url)`) and optional `actions` (`book`, `human`, `ask`, `link`).
