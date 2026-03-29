interface EpigraphProps {
  lines: string[];
}

export default function Epigraph({ lines }: EpigraphProps) {
  if (lines.length === 0) return null;

  return (
    <blockquote className="text-center">
      {lines.map((line, i) =>
        line.startsWith("(") ? (
          <cite key={i} className="type-quote-author">
            {line.replace(/^\(\s*/, "\u2014 ").replace(/\s*\)$/, "")}
          </cite>
        ) : (
          <p key={i} className="type-quote">
            {line}
          </p>
        )
      )}
    </blockquote>
  );
}
