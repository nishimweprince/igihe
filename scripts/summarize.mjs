// Seed-time AI summaries: 3 bullets per article, Kinyarwanda-first.
// Reads OPENAI_API_KEY from .env. Skips articles already summarized.
// Usage: npm run summarize
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import "dotenv/config";
import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY missing — add it to .env");
  process.exit(1);
}

const CONCURRENCY = 3;
const MODEL = "gpt-4o-mini";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const articles = JSON.parse(readFileSync("data/articles.json", "utf8"));
const outPath = "data/summaries.json";
const existing = existsSync(outPath)
  ? Object.fromEntries(
      JSON.parse(readFileSync(outPath, "utf8")).map((s) => [s.articleId, s])
    )
  : {};

async function summarize(article) {
  const text = `${article.title}\n\n${article.body}`.slice(0, 6000);
  const res = await client.chat.completions.create({
    model: MODEL,
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content:
          "You summarize Rwandan news. Reply with EXACTLY 3 short bullets, each on its own line starting with '- '. " +
          "Write in Kinyarwanda if the article is Kinyarwanda, otherwise match the article language. " +
          "No intro, no numbering, no extra lines.",
      },
      { role: "user", content: text },
    ],
  });
  const bullets = (res.choices[0]?.message?.content ?? "")
    .split("\n")
    .map((l) => l.replace(/^[-•\d.)\s]+/, "").trim())
    .filter(Boolean)
    .slice(0, 3);
  return { articleId: article.id, bullets, language: article.locale };
}

const pending = articles.filter((a) => !existing[a.id]);
console.log(`${articles.length} articles, ${pending.length} to summarize`);
let done = 0;
const results = [];
for (let i = 0; i < pending.length; i += CONCURRENCY) {
  const batch = await Promise.all(
    pending.slice(i, i + CONCURRENCY).map(async (a) => {
      try {
        const s = await summarize(a);
        done++;
        console.log(`  [${done}/${pending.length}] ${a.id}`);
        return s;
      } catch (e) {
        console.warn(`  skip ${a.id}: ${e.message}`);
        return null;
      }
    })
  );
  results.push(...batch.filter(Boolean));
}

mkdirSync("data", { recursive: true });
writeFileSync(
  outPath,
  JSON.stringify([...Object.values(existing), ...results], null, 2)
);
console.log(`wrote ${results.length} new summaries`);
