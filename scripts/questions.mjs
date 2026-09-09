// Seed-time suggested questions (all dynamic, AI-generated — never hardcoded).
// - Per article: 2 short "flash" questions answerable from that article.
// - Site-wide: 2 broad questions spanning the latest headlines.
// Reads OPENAI_API_KEY from .env. Only fills gaps; safe to re-run.
// Usage: node scripts/questions.mjs
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import "dotenv/config";
import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY missing — add it to .env");
  process.exit(1);
}

const MODEL = "gpt-4o-mini";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const articles = JSON.parse(readFileSync("data/articles.json", "utf8"));
const sumPath = "data/summaries.json";
const summaries = JSON.parse(readFileSync(sumPath, "utf8"));
const byId = new Map(summaries.map((s) => [s.articleId, s]));

function parseQuestions(text) {
  return text
    .split("\n")
    .map((l) => l.replace(/^[-•\d.)\s]+/, "").trim())
    .filter((l) => l.length > 8 && l.length < 140)
    .slice(0, 2);
}

async function flashQuestions(article) {
  const text = `${article.title}\n\n${article.body}`.slice(0, 4000);
  const res = await client.chat.completions.create({
    model: MODEL,
    temperature: 0.7,
    messages: [
      {
        role: "system",
        content:
          "You write tap-to-ask suggestion chips for a news reader. Reply with EXACTLY 2 short questions a reader would tap, each on its own line starting with '- '. " +
          "Each must be answerable from the article. Same language as the article. Max 12 words each. No other text.",
      },
      { role: "user", content: text },
    ],
  });
  return parseQuestions(res.choices[0]?.message?.content ?? "");
}

const missing = articles.filter(
  (a) => !(byId.get(a.id)?.questions?.length >= 2)
);
console.log(`${missing.length} articles need flash questions`);
let n = 0;
for (const a of missing) {
  try {
    const q = await flashQuestions(a);
    if (q.length === 2) {
      const s = byId.get(a.id) ?? { articleId: a.id, bullets: [], language: a.locale };
      s.questions = q;
      byId.set(a.id, s);
      n++;
      console.log(`  [${n}/${missing.length}] ${a.id}`);
    } else {
      console.warn(`  skip ${a.id}: model returned ${q.length} questions`);
    }
  } catch (e) {
    console.warn(`  skip ${a.id}: ${e.message}`);
  }
}
writeFileSync(sumPath, JSON.stringify([...byId.values()], null, 2));

// Broad questions across the latest headlines.
const latest = [...articles]
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  .slice(0, 15);
const digest = latest.map((a) => `- ${a.title} (${a.category})`).join("\n");
const broadRes = await client.chat.completions.create({
  model: MODEL,
  temperature: 0.7,
  messages: [
    {
      role: "system",
      content:
        "You write tap-to-ask suggestion chips for a Rwandan news assistant covering today's headlines. Reply with EXACTLY 2 short broad questions spanning these stories, each on its own line starting with '- '. " +
        "Write in Kinyarwanda. Max 12 words each. No other text.",
    },
    { role: "user", content: digest },
  ],
});
const broad = parseQuestions(broadRes.choices[0]?.message?.content ?? "");
if (broad.length < 2) {
  console.error("FAIL: model returned fewer than 2 broad questions");
  process.exit(1);
}
writeFileSync(
  "data/general.json",
  JSON.stringify({ questions: broad, generatedAt: new Date().toISOString() }, null, 2)
);
console.log("broad questions:", broad);
console.log(`done: ${n} article question sets, 2 broad questions`);
