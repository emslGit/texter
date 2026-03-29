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

export function getExcerpt(essay: Essay, maxLen = 200): string {
  const first = essay.sections[0]?.paragraphs[0] ?? "";
  return first.length > maxLen ? first.slice(0, maxLen) + "\u2026" : first;
}
