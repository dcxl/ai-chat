import * as pdfParse from "pdf-parse";
import * as cheerio from "cheerio";

const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 50;

export function chunkText(text: string): string[] {
  const paragraphs = text.split(/\n{2,}/).filter((p) => p.trim().length > 0);
  const chunks: string[] = [];
  let current = "";

  for (const para of paragraphs) {
    if ((current + "\n\n" + para).length > CHUNK_SIZE && current.length > 0) {
      chunks.push(current.trim());
      const words = current.split("");
      current = words.slice(-CHUNK_OVERLAP).join("") + "\n\n" + para;
    } else {
      current = current ? current + "\n\n" + para : para;
    }
  }
  if (current.trim()) chunks.push(current.trim());

  const finalChunks: string[] = [];
  for (const chunk of chunks) {
    if (chunk.length <= CHUNK_SIZE) {
      finalChunks.push(chunk);
    } else {
      const sentences = chunk.split(/(?<=[。！？.!?\n])/g);
      let sub = "";
      for (const s of sentences) {
        if ((sub + s).length > CHUNK_SIZE && sub.length > 0) {
          finalChunks.push(sub.trim());
          sub = s;
        } else {
          sub += s;
        }
      }
      if (sub.trim()) finalChunks.push(sub.trim());
    }
  }

  return finalChunks.filter((c) => c.length > 10);
}

export async function parsePDF(buffer: Buffer): Promise<string> {
  const data = await (pdfParse as any).default(buffer);
  return data.text;
}

export async function parseHTML(html: string): Promise<string> {
  const $ = cheerio.load(html);
  $("script, style, nav, footer, header, noscript").remove();
  const main = $("main, article, .content, #content, .post-body").first();
  const text = main.length ? main.text() : $("body").text();
  return text.replace(/\s{3,}/g, "\n\n").trim();
}

export async function fetchURL(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; AIChatBot/1.0)" },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Failed to fetch URL: ${res.status}`);
  const html = await res.text();
  return parseHTML(html);
}
