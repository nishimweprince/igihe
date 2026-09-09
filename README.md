# Igihe AI Reader (interview demo)

An **AI engagement-layer concept for Igihe** — not a clone. Real Igihe stories
in a modern reader UI (inspired by the "Bace News Dashboard" design), each with
an AI summary plus a chat agent that answers questions **grounded in the
article**, with citations linking back to the original on igihe.com.

## Interview framing

Igihe monetizes attention on its own site. This demo shows how summaries + Q&A
keep readers in-app instead of losing them to ChatGPT/Grok — every answer cites
and links the original article, driving engagement and time-on-site.

## Commands

```bash
npm run ingest     # fetch latest Igihe articles (RSS + article pages) -> data/articles.json
npm run summarize  # 3-bullet Kinyarwanda-first summaries -> data/summaries.json (needs OPENAI_API_KEY)
npm run questions  # 2 AI flash questions per article + 2 broad ones -> summaries.json / data/general.json
npm run dev        # local dev server
npm run build      # production build
npm run lint       # typecheck (tsc --noEmit)
```

Requires `OPENAI_API_KEY` in `.env` for summaries + Q&A. Without it, the app
builds and renders, and the chat shows a graceful fallback message.

## Architecture (deliberately simple)

- **Content:** SPIP RSS backend (`igihe.com/spip.php?page=backend`) for
  discovery; article HTML parsed with pure fetch + regex (JSON-LD for
  meta, `div.fulltext` for body). EN/FR editions moved off SPIP, so content is
  Kinyarwanda-first; the agent still answers in EN/FR when asked.
- **No vector DB:** full article text ships in `data/articles.json` and goes
  straight into LLM context per question (gpt-4o-mini). Retrieval would add
  infra for zero demo benefit.
- **UI:** Next.js App Router; shadcn-style primitives consumed only through
  wrapped reusables in `components/ui/` + shared inputs in
  `components/inputs/`. DM Sans everywhere, default letter-spacing, branded
  `::selection` + highlight-to-explain toolbar on article pages.
- **SEO:** per-article metadata/OG/canonical, `sitemap.ts`, `robots.ts`,
  JSON-LD NewsArticle, semantic HTML.
