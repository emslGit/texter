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

export function getExcerpt(essay: Essay, maxLen: number): string {
  const paras = essay.sections.flatMap((s) => s.paragraphs);
  // Concatenate all paragraphs, then cut at maxLen
  const full = paras.join(" ");
  if (full.length <= maxLen) return full;
  // Cut and find last sentence end before the limit
  const partial = full.slice(0, maxLen);
  const lastDot = partial.lastIndexOf(". ");
  if (lastDot > maxLen * 0.5) {
    return partial.slice(0, lastDot + 1) + "\u2026";
  }
  // Fall back to word boundary
  const lastSpace = partial.lastIndexOf(" ");
  return partial.slice(0, lastSpace) + "\u2026";
}
