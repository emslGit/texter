interface QuoteProps {
  text: string;
}

export default function Quote({ text }: QuoteProps) {
  if (!text) return null;

  return (
    <p className="type-quote text-center">
      &ldquo;{text}&rdquo;
    </p>
  );
}
