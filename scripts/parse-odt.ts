/**
 * ODT parser: reads .odt files from content/ and outputs structured JSON to generated/
 * Copy generated/site.json to content/site.json to use as the source of truth.
 */

import { createHash } from "crypto";
import { readFileSync, writeFileSync, readdirSync, unlinkSync, existsSync, mkdirSync } from "fs";
import { join, basename, dirname } from "path";
import { execSync } from "child_process";
import { tmpdir } from "os";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, "..");
const CONTENT_DIR = join(ROOT, "content");
const CACHE_DIR = join(ROOT, "generated");

interface Paragraph {
  text: string;
  heading: boolean;
}

interface Section {
  heading: string;
  slug: string;
  paragraphs: string[];
  type?: string;
}

interface Essay {
  title: string;
  slug: string;
  sections: Section[];
}

interface ParseResult {
  siteIntro: { epigraph: string[]; intro: string[] };
  essays: Essay[];
}

function fileHash(path: string): string {
  const data = readFileSync(path);
  return createHash("sha256").update(data).digest("hex");
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/å/g, "a")
    .replace(/ä/g, "a")
    .replace(/ö/g, "o")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function extractContentXml(odtPath: string): string {
  const tmp = join(tmpdir(), `odt-${Date.now()}`);
  mkdirSync(tmp, { recursive: true });
  execSync(`unzip -o -q "${odtPath}" content.xml -d "${tmp}"`);
  const xml = readFileSync(join(tmp, "content.xml"), "utf-8");
  execSync(`rm -rf "${tmp}"`);
  return xml;
}

function parseXml(xml: string): Essay {
  // Minimal XML parsing using regex — ODT content.xml is well-structured
  // Extract automatic style definitions
  const styleProps = new Map<string, Record<string, string>>();

  // Parse style definitions
  const styleRegex =
    /<style:style style:name="([^"]+)"[^>]*>([\s\S]*?)<\/style:style>/g;
  let match;
  while ((match = styleRegex.exec(xml)) !== null) {
    const name = match[1];
    const body = match[2];
    const props: Record<string, string> = {};
    const propRegex = /fo:font-size="([^"]+)"/g;
    let pm;
    while ((pm = propRegex.exec(body)) !== null) {
      props["font-size"] = pm[1];
    }
    styleProps.set(name, props);
  }

  function hasLargeFont(styleName: string): boolean {
    const props = styleProps.get(styleName);
    if (!props?.["font-size"]) return false;
    const size = parseFloat(props["font-size"].replace("pt", ""));
    return size >= 14;
  }

  // Extract paragraphs from body
  const bodyMatch = xml.match(/<office:text[^>]*>([\s\S]*)<\/office:text>/);
  if (!bodyMatch) throw new Error("No office:text found");
  const bodyXml = bodyMatch[1];

  const paragraphs: Paragraph[] = [];

  // Match each text:p element
  const pRegex = /<text:p\s+text:style-name="([^"]*)"[^>]*>([\s\S]*?)<\/text:p>|<text:p\s+text:style-name="([^"]*)"[^\/]*\/>/g;
  while ((match = pRegex.exec(bodyXml)) !== null) {
    const styleName = match[1] || match[3] || "";
    const innerXml = match[2] || "";

    // Extract text content, stripping XML tags but handling line breaks
    let text = innerXml
      .replace(/<text:line-break\/>/g, "\n")
      .replace(/<text:tab\/>/g, "")
      .replace(/<text:s\s[^/]*\/>/g, " ")
      .replace(/<text:s\/>/g, " ")
      .replace(/<[^>]+>/g, "")
      .trim();

    // Check if this is a heading
    const startsWithQuote = /^[\u201c\u201d"'(\u2018\u2019]/.test(text);
    const endsWithQuote = /[\u201d"'\u2019)]$/.test(text.trimEnd());
    let isHeading = false;
    if (hasLargeFont(styleName) && text.length > 0 && text.length < 80 && !startsWithQuote && !endsWithQuote) {
      isHeading = true;
    }
    // Check span styles within this paragraph — only if ALL spans are large font
    if (!isHeading && text.length > 0 && text.length < 80 && !startsWithQuote && !endsWithQuote) {
      const spanStyleRegex = /text:style-name="(T\d+)"/g;
      let sm;
      let allLarge = false;
      let hasSpans = false;
      while ((sm = spanStyleRegex.exec(innerXml)) !== null) {
        hasSpans = true;
        if (hasLargeFont(sm[1])) {
          allLarge = true;
        } else {
          allLarge = false;
          break;
        }
      }
      if (hasSpans && allLarge) {
        isHeading = true;
      }
    }

    paragraphs.push({ text, heading: isHeading });
  }

  // Split into separate essays — each heading becomes its own text
  // Pre-heading content becomes site-level intro
  const preHeadingLines: string[] = [];
  const essayChunks: { heading: string; paragraphs: string[] }[] = [];
  let currentChunk: { heading: string; paragraphs: string[] } | null = null;

  for (const p of paragraphs) {
    if (!p.text) continue;

    if (p.heading) {
      if (currentChunk) essayChunks.push(currentChunk);
      currentChunk = { heading: p.text, paragraphs: [] };
      continue;
    }

    if (!currentChunk) {
      preHeadingLines.push(p.text);
    } else {
      currentChunk.paragraphs.push(p.text);
    }
  }
  if (currentChunk) essayChunks.push(currentChunk);

  // Split pre-heading into epigraph + intro
  const epigraphLines: string[] = [];
  const introLines: string[] = [];
  let epigraphDone = false;
  for (const line of preHeadingLines) {
    const isQuoteLine = /^[\u201c\u201d"(]/.test(line) || /[\u201d")]$/.test(line.trimEnd());
    if (!epigraphDone && isQuoteLine) {
      epigraphLines.push(line);
      if (line.startsWith("(") || line.startsWith("\uFF08")) epigraphDone = true;
    } else {
      epigraphDone = true;
      introLines.push(line);
    }
  }

  // Build essays — one per heading
  const essays: Essay[] = essayChunks.map((chunk) => ({
    title: chunk.heading,
    source: "",
    slug: slugify(chunk.heading),
    sections: [{ heading: "", slug: "body", paragraphs: chunk.paragraphs }],
  }));

  return {
    siteIntro: { epigraph: epigraphLines, intro: introLines },
    essays,
  };
}

function main() {
  mkdirSync(CACHE_DIR, { recursive: true });

  const odtFiles = readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".odt"));
  if (odtFiles.length === 0) {
    console.log("No .odt files found in content/");
    return;
  }

  const cacheFile = join(CACHE_DIR, "site.json");

  // Check if any source file changed
  const allHashes = odtFiles.map((f) => fileHash(join(CONTENT_DIR, f))).join(",");
  const hashFile = join(CACHE_DIR, ".hash");
  if (existsSync(hashFile) && readFileSync(hashFile, "utf-8") === allHashes && existsSync(cacheFile)) {
    console.log("  cached (no changes)");
    const site = JSON.parse(readFileSync(cacheFile, "utf-8"));
    console.log(`\nDone! ${site.texts.length} text(s) → cache/site.json`);
    return;
  }

  let intro = { epigraph: [] as string[], intro: [] as string[] };
  const allTexts: Essay[] = [];

  for (const filename of odtFiles) {
    console.log(`  parsing: ${filename}`);
    const xml = extractContentXml(join(CONTENT_DIR, filename));
    const result = parseXml(xml);
    intro = result.siteIntro;
    for (const essay of result.essays) {
allTexts.push(essay);
    }
  }

  const site = { intro, texts: allTexts };
  writeFileSync(cacheFile, JSON.stringify(site, null, 2));
  writeFileSync(hashFile, allHashes);

  console.log(`\nDone! ${allTexts.length} text(s) → cache/site.json`);
}

main();
