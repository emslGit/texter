// Converts straight ASCII quotes to typographic curly quotes.
// Curly quotes already in the source (e.g. from ODT migration) are left untouched
// because they don't match the ASCII code points this targets.
function smartQuotes(text: string): string {
  return (
    text
      // Opening double: after whitespace, start of string, or opening bracket
      .replace(/(^|[\s([{>])"(?=\S)/g, "$1\u201c")
      // Closing double: before whitespace, end of string, or punctuation
      .replace(/"(?=[\s)\]}.,:;!?]|$)/g, "\u201d")
      // Any remaining straight double quote after a non-space = closing
      .replace(/(\S)"/g, "$1\u201d")
      // Opening single: after whitespace or start (not apostrophe mid-word)
      .replace(/(^|[\s([{>])'(?=\S)/g, "$1\u2018")
      // Apostrophe between word characters
      .replace(/(\w)'(\w)/g, "$1\u2019$2")
      // Closing single: before whitespace, punctuation, or end
      .replace(/'(?=[\s)\]}.,:;!?]|$)/g, "\u2019")
  );
}

export type Block =
  | { type: "heading"; level: 1 | 2; text: string }
  | { type: "blockquote"; lines: string[] }
  | { type: "author"; lines: string[] }
  | { type: "poem"; lines: string[] }
  | { type: "paragraph"; text: string };

export function parseMarkdown(raw: string): { title: string; quote: string; quoteAuthor: string; blocks: Block[] } {
  const lines = raw.split("\n");
  const blocks: Block[] = [];
  let i = 0;
  let title = "";

  while (i < lines.length) {
    const line = lines[i];

    // Quote fenced block
    if (line.trimEnd() === "```quote") {
      const quoteLines: string[] = [];
      i++;
      while (i < lines.length && lines[i].trimEnd() !== "```") {
        quoteLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      if (quoteLines.some((l) => l.trim())) {
        blocks.push({ type: "blockquote", lines: quoteLines.map(smartQuotes) });
      }
      continue;
    }

    // Poem fenced block
    if (line.trimEnd() === "```poem") {
      const poemLines: string[] = [];
      i++;
      while (i < lines.length && lines[i].trimEnd() !== "```") {
        poemLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      if (poemLines.some((l) => l.trim())) {
        blocks.push({ type: "poem", lines: poemLines.map(smartQuotes) });
      }
      continue;
    }

    // H1 — first one becomes the document title (not rendered in body)
    if (line.startsWith("# ") && !line.startsWith("## ")) {
      const text = line.slice(2).trim();
      if (!title) {
        title = text;
      } else {
        blocks.push({ type: "heading", level: 1, text });
      }
      i++;
      continue;
    }

    // H2
    if (line.startsWith("## ")) {
      blocks.push({ type: "heading", level: 2, text: line.slice(3).trim() });
      i++;
      continue;
    }

    // Author attribution (> lines)
    if (line.startsWith("> ") || line === ">") {
      const authorLines: string[] = [];
      while (i < lines.length && (lines[i].startsWith("> ") || lines[i] === ">")) {
        authorLines.push(lines[i] === ">" ? "" : lines[i].slice(2));
        i++;
      }
      if (authorLines.some((l) => l.trim())) {
        blocks.push({ type: "author", lines: authorLines.map(smartQuotes) });
      }
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Paragraph — collect lines, preserving blank lines between content as \n\n
    const paraLines: string[] = [];
    while (i < lines.length) {
      const cur = lines[i];
      if (cur.startsWith("#") || cur.startsWith(">") || cur.startsWith("```")) break;
      if (cur.trim() === "") {
        // Look ahead: if more paragraph content follows, keep blank lines
        let j = i + 1;
        while (j < lines.length && lines[j].trim() === "") j++;
        if (j >= lines.length || lines[j].startsWith("#") || lines[j].startsWith(">") || lines[j].startsWith("```")) break;
        paraLines.push("");
        i = j;
      } else {
        paraLines.push(cur);
        i++;
      }
    }
    if (paraLines.length > 0) {
      blocks.push({ type: "paragraph", text: smartQuotes(paraLines.join("\n")) });
    }
  }

  return { title, quote: "", quoteAuthor: "", blocks };
}
