import { readFileSync } from "fs";
import { join } from "path";

const CACHE_DIR = join(process.cwd(), "cache");

export interface Section {
  heading: string;
  slug: string;
  paragraphs: string[];
}

export interface Essay {
  title: string;
  source: string;
  slug: string;
  sections: Section[];
}

export interface SiteIntro {
  epigraph: string[];
  intro: string[];
}

interface SiteData {
  intro: SiteIntro;
  texts: Essay[];
}

function loadSite(): SiteData {
  return JSON.parse(readFileSync(join(CACHE_DIR, "site.json"), "utf-8"));
}

export function getSiteIntro(): SiteIntro {
  return loadSite().intro;
}

export function getAllEssays(): Essay[] {
  return loadSite().texts;
}

export function getEssay(slug: string): Essay | null {
  return loadSite().texts.find((e) => e.slug === slug) ?? null;
}

export function getManifest() {
  return loadSite().texts.map((e) => ({ title: e.title, slug: e.slug, source: e.source }));
}

export function getExcerpt(essay: Essay, maxLen = 300): string {
  const paras = essay.sections.flatMap((s) => s.paragraphs);
  let text = "";
  for (const p of paras) {
    if (text.length + p.length + 1 > maxLen) {
      // Add partial next paragraph, cut at last sentence boundary
      const remaining = maxLen - text.length;
      const partial = p.slice(0, remaining);
      const lastDot = partial.lastIndexOf(". ");
      if (lastDot > 0) {
        text += (text ? " " : "") + partial.slice(0, lastDot + 1);
      } else {
        text += (text ? " " : "") + partial + "\u2026";
      }
      break;
    }
    text += (text ? " " : "") + p;
  }
  return text;
}
