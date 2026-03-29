interface EpigraphProps {
  lines: string[];
}

export default function Epigraph({ lines }: EpigraphProps) {
  if (lines.length === 0) return null;

  return (
    <blockquote className="text-center">
      {lines.map((line, i) =>
        line.startsWith("(") ? (
          <cite
            key={i}
            className="block mt-4 text-sm not-italic text-ink-muted tracking-wide"
          >
            {line}
          </cite>
        ) : (
          <p key={i} className="text-lg sm:text-xl italic text-ink-light leading-loose">
            {line}
          </p>
        )
      )}
    </blockquote>
  );
}
