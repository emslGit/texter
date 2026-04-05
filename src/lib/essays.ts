import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { parseMarkdown, Block } from "./markdown";

const CONTENT_DIR = join(process.cwd(), "content");
const TEXTS_DIR = join(CONTENT_DIR, "texts");

export type { Block };

export interface Essay {
  title: string;
  slug: string;
  quote: string;
  quoteAuthor: string;
  blocks: Block[];
}

export interface TextConfig {
  slug: string;
  quote?: string;
  quoteAuthor?: string;
  excerptLength?: number;
}

export function getConfig() {
  try {
    return JSON.parse(readFileSync(join(CONTENT_DIR, "config.json"), "utf-8"));
  } catch {
    return { site: {}, author: {}, texts: [] };
  }
}

export function getSiteIntro(): Block[] {
  const path = join(CONTENT_DIR, "intro.md");
  if (!existsSync(path)) return [];
  const { blocks } = parseMarkdown(readFileSync(path, "utf-8"));
  return blocks;
}

function loadEssay(slug: string): Essay | null {
  const path = join(TEXTS_DIR, `${slug}.md`);
  if (!existsSync(path)) return null;
  const raw = readFileSync(path, "utf-8");
  const { title, quote, quoteAuthor, blocks } = parseMarkdown(raw);
  return { title, slug, quote, quoteAuthor, blocks };
}

export function getAllEssays(): Essay[] {
  const entries = getConfig().texts as TextConfig[];
  return entries.map((e) => loadEssay(e.slug)).filter((e): e is Essay => e !== null);
}

export function getEssay(slug: string): Essay | null {
  return loadEssay(slug);
}

export function getManifest() {
  const entries = getConfig().texts as TextConfig[];
  return entries
    .map((e) => {
      const essay = loadEssay(e.slug);
      return essay ? { title: essay.title, slug: e.slug } : null;
    })
    .filter((e): e is { title: string; slug: string } => e !== null);
}

export function getExcerpt(essay: Essay, maxLen: number): string {
  const text = essay.blocks
    .filter((b): b is { type: "paragraph"; text: string } => b.type === "paragraph")
    .map((b) => b.text)
    .join(" ");
  if (text.length <= maxLen) return text;
  const partial = text.slice(0, maxLen);
  const lastDot = partial.lastIndexOf(". ");
  if (lastDot > maxLen * 0.5) return partial.slice(0, lastDot) + "\u2026";
  return partial.slice(0, partial.lastIndexOf(" ")) + "\u2026";
}
