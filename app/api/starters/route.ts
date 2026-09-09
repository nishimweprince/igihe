import { NextResponse } from "next/server";
import { getGeneral, getSummaries } from "@/lib/articles-data";

// Dynamic tap-to-ask chips for the assistant: 2 flash questions scoped to the
// article the reader is on (when ?articleId= matches), plus 2 broad questions
// spanning the latest headlines. All generated at seed time by
// scripts/questions.mjs — never hardcoded.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const articleId = searchParams.get("articleId");
  const summaries = getSummaries();
  const scoped =
    (articleId ? summaries.get(articleId)?.questions : undefined) ?? [];
  const broad = getGeneral().questions ?? [];
  return NextResponse.json({
    scoped: scoped.slice(0, 2),
    broad: broad.slice(0, 2),
  });
}
