import type { Block } from "@/lib/essays";

export function renderWithInnerQuotes(text: string) {
  const parts = text.split(/(\u2018[^\u2019]+\u2019|´[^´]+´|'[^']+')/)
  return parts.map((part, i) => {
    const inner = part.match(/^[\u2018´'](.+)[\u2019´']$/)
    if (inner) return <q key={i}>{inner[1]}</q>
    return part
  })
}

export function renderBlock(block: Block, idx: number, prevBlock?: Block, nextBlock?: Block) {
  switch (block.type) {
    case "heading":
      return block.level === 1 ? (
        <h2
          key={idx}
          className="font-serif text-2xl sm:text-3xl font-medium text-ink mt-14"
        >
          {block.text}
        </h2>
      ) : (
        <h3
          key={idx}
          className="font-serif text-xl sm:text-2xl font-medium text-ink mt-10 mb-4"
        >
          {block.text}
        </h3>
      );

    case "blockquote":
      if (block.align === "left") {
        return (
          <div key={idx} className={`${nextBlock?.type === "author" ? "mt-8" : "my-8"} flex justify-center`}>
            <blockquote className="text-left">
              {block.lines.map((line, li) => (
                <p key={li} className="type-quote">{renderWithInnerQuotes(line)}</p>
              ))}
            </blockquote>
          </div>
        );
      }
      return (
        <blockquote key={idx} className={`${nextBlock?.type === "author" ? "mt-8" : "my-8"} text-center`}>
          {block.lines.map((line, li) => (
            <p key={li} className="type-quote">{renderWithInnerQuotes(line)}</p>
          ))}
        </blockquote>
      );

    case "author": {
      const afterQuoteOrPoem = prevBlock?.type === "blockquote" || prevBlock?.type === "poem";
      const isLeftAligned = prevBlock?.type === "blockquote" && prevBlock.align === "left";
      const formatLine = (line: string) => {
        const text = line.startsWith("\u2014 ") ? line.slice(2) : line;
        return `(${text})`;
      };
      if (isLeftAligned) {
        return (
          <div key={idx} className="mb-8 flex justify-center">
            <div className="text-left">
              {block.lines.map((line, li) => (
                <p key={li} className="type-quote-author">{formatLine(line)}</p>
              ))}
            </div>
          </div>
        );
      }
      return (
        <div key={idx} className={afterQuoteOrPoem ? "mb-8 text-center" : "mb-8"}>
          {block.lines.map((line, li) => (
            <p key={li} className="type-quote-author">{formatLine(line)}</p>
          ))}
        </div>
      );
    }

    case "excerpt-end":
      return null;

    case "poem":
      return (
        <blockquote
          key={idx}
          className={`${nextBlock?.type === "author" ? "mt-8" : "my-8"} py-5 px-5 sm:py-6 sm:px-8 border-l-2 border-accent bg-accent/5`}
        >
          {block.lines.map((line, li) => (
            <p key={li} className="italic text-ink-light leading-relaxed last:mb-0">
              {line}
            </p>
          ))}
        </blockquote>
      );

    case "paragraph": {
      const parts = block.text.split("\n");
      return (
        <p key={idx}>
          {parts.map((part, pi) => {
            const match = part.match(/^([\t ]*)([\s\S]*)$/);
            const leading = match?.[1] ?? "";
            const rest = match?.[2] ?? part;
            const indent = leading.replace(/\t/g, "\u00a0\u00a0\u00a0\u00a0").replace(/ /g, "\u00a0");
            return (
              <span key={pi} className="block">
                {indent}{rest || "\u00a0"}
              </span>
            );
          })}
        </p>
      );
    }
  }
}
