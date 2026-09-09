// Ingest real Igihe articles: RSS (SPIP backend) -> article pages -> data/articles.json
// Pure fetch + regex parsing, no headless browser, no dependencies.
import { writeFileSync, mkdirSync } from "node:fs";

const FEEDS = [
  // Main Kinyarwanda SPIP backend (~147 recent items as RSS).
  { url: "https://igihe.com/spip.php?page=backend", locale: "rw", limit: 55 },
  // EN/FR editions have migrated off SPIP (serve Next.js HTML now); attempted
  // best-effort, tolerated at 0 items.
  { url: "https://en.igihe.com/spip.php?page=backend", locale: "en", limit: 20 },
  { url: "https://fr.igihe.com/spip.php?page=backend", locale: "fr", limit: 20 },
];
const CONCURRENCY = 4;
const UA = "Mozilla/5.0 (compatible; IgiheAIReaderDemo/0.1; interview-demo)";

const SECTION_LABELS = {
  politiki: "Politiki",
  ubuzima: "Ubuzima",
  imikino: "Imikino",
  imyidagaduro: "Imyidagaduro",
  ikoranabuhanga: "Ikoranabuhanga",
  diaspora: "Diaspora",
  ubukerarugendo: "Ubukerarugendo",
  ubukungu: "Ubukungu",
  abantu: "Abantu",
  fashion: "Fashion",
  imyubakire: "Imyubakire",
  amakuru: "Amakuru",
  ibidukikije: "Ibidukikije",
  umuco: "Umuco",
  iyobokamana: "Iyobokamana",
};

function decodeEntities(s) {
  return s
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&(amp|lt|gt|quot|apos|nbsp);/g, (_, e) =>
      ({ amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " })[e]
    );
}

function stripTags(s) {
  return decodeEntities(s.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function tagContent(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  return m ? decodeEntities(m[1]).trim() : "";
}

async function fetchText(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return await res.text();
}

function parseFeed(xml, locale) {
  const items = [...xml.matchAll(/<item[\s>][\s\S]*?<\/item>/g)].map((m) => m[0]);
  return items.map((item) => ({
    title: stripTags(tagContent(item, "title")),
    link: tagContent(item, "link"),
    description: stripTags(tagContent(item, "description")),
    pubDate: tagContent(item, "pubDate"),
    author: stripTags(tagContent(item, "dc:creator") || tagContent(item, "author")),
    locale,
  })).filter((a) => a.title && a.link.includes("igihe.com"));
}

function extractJsonLd(html) {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((m) => m[1]);
  for (const raw of blocks) {
    try {
      const d = JSON.parse(raw, (k, v) => v);
      if (d && d["@type"] === "NewsArticle") return d;
    } catch {
      try {
        const d = JSON.parse(raw.replace(/[\x00-\x1f]/g, " "));
        if (d && d["@type"] === "NewsArticle") return d;
      } catch { /* next block */ }
    }
  }
  return null;
}

function og(html, prop) {
  const m = html.match(new RegExp(`property="og:${prop}" content="([^"]*)"`));
  return m ? decodeEntities(m[1]) : "";
}

function extractBody(html) {
  const m = html.match(/<div[^>]*class="[^"]*fulltext[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<(?:div|footer|section)/);
  const inner = m ? m[1] : (() => {
    const all = [...html.matchAll(/<div[^>]*class="[^"]*fulltext[^"]*"[^>]*>([\s\S]*?)<\/div>/g)];
    let best = "";
    for (const a of all) if (a[1].length > best.length) best = a[1];
    return best;
  })();
  if (!inner) return "";
  const paras = [...inner.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)]
    .map((p) => stripTags(p[1]))
    .filter((t) => t.length > 40);
  return paras.join("\n\n");
}

function prettySlug(slug) {
  const cleaned = slug.replace(/-\d+$/, "").replace(/-/g, " ").trim();
  return cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : "Amakuru";
}

function categoryFromUrl(link) {
  try {
    const parts = new URL(link).pathname.split("/").filter(Boolean);
    const section = SECTION_LABELS[parts[0]];
    if (section) return section;
    if (parts[0] === "serivisi") return "Amakuru";
    return prettySlug(parts[0]);
  } catch {
    return "Amakuru";
  }
}

function slugFromUrl(link, i) {
  try {
    const parts = new URL(link).pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1] || `article-${i}`;
    return last.slice(0, 100);
  } catch {
    return `article-${i}`;
  }
}

async function enrich(item, i) {
  const html = await fetchText(item.link);
  const ld = extractJsonLd(html);
  const body = extractBody(html);
  const image = (ld?.image?.[0] ?? og(html, "image") ?? null) || null;
  const title = ld?.headline ?? og(html, "title") ?? item.title;
  const author = ld?.author?.name ?? item.author ?? "";
  const date = ld?.datePublished ?? item.pubDate ?? new Date().toISOString();
  const excerpt = ld?.description
    ? stripTags(ld.description).slice(0, 220)
    : item.description.slice(0, 220);
  return {
    id: `${item.locale}-${slugFromUrl(item.link, i)}`.slice(0, 120),
    slug: `${item.locale}-${slugFromUrl(item.link, i)}`.slice(0, 120),
    title,
    excerpt,
    body: body || item.description,
    image,
    date,
    author,
    category: categoryFromUrl(item.link),
    sourceUrl: item.link,
    locale: item.locale,
  };
}

async function mapPool(items, fn, size) {
  const out = new Array(items.length);
  let idx = 0;
  await Promise.all(
    Array.from({ length: size }, async () => {
      while (idx < items.length) {
        const i = idx++;
        try {
          out[i] = await fn(items[i], i);
        } catch (e) {
          console.warn(`skip ${items[i].link}: ${e.message}`);
          out[i] = null;
        }
      }
    })
  );
  return out.filter(Boolean);
}

const seen = new Set();
const all = [];
for (const feed of FEEDS) {
  console.log(`fetching ${feed.url}`);
  const xml = await fetchText(feed.url);
  const items = parseFeed(xml, feed.locale).slice(0, feed.limit);
  console.log(`  ${items.length} items`);
  const enriched = await mapPool(items, enrich, CONCURRENCY);
  for (const a of enriched) {
    if (seen.has(a.sourceUrl)) continue;
    seen.add(a.sourceUrl);
    all.push(a);
  }
}

// Newest first
all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

mkdirSync("data", { recursive: true });
writeFileSync("data/articles.json", JSON.stringify(all, null, 2));
const withImages = all.filter((a) => a.image).length;
const withBody = all.filter((a) => a.body && a.body.length > 300).length;
console.log(`wrote ${all.length} articles (${withImages} with images, ${withBody} with full body)`);
if (all.length < 40) {
  console.error("FAIL: fewer than 40 articles ingested");
  process.exit(1);
}
