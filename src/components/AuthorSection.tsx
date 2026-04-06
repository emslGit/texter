"use client";

import { useState } from "react";

interface AuthorProps {
  name: string;
  bio: string;
  role?: string;
}

export default function AuthorSection({ name, bio, role }: AuthorProps) {
  if (!name && !bio) return null;

  const paragraphs = bio.split("\n\n");
  const [expanded, setExpanded] = useState(false);

  return (
    <aside className="mt-12 sm:mt-16 -mx-4 sm:mx-0">
      <div className="bg-[#c8aa82]/[0.06] border-y sm:border border-accent/10 sm:rounded-sm px-6 sm:px-8 py-10 sm:py-12">
        <div className="flex items-center gap-6 mb-6">
          <img
            src="/ingegerd.jpeg"
            alt={name}
            className="w-24 h-28 object-cover object-top flex-shrink-0"
          />
          <div>
            <h3 className="font-sans font-medium text-sm uppercase tracking-widest text-ink-muted mb-2">
              Om författaren
            </h3>
            {name && (
              <p className="text-xl sm:text-2xl font-medium text-ink mb-1">{name}</p>
            )}
            {role && (
              <p className="text-sm font-sans text-ink-muted">{role}</p>
            )}
          </div>
        </div>
        {bio && (
          <div className="space-y-4">
            <div
              className="relative overflow-hidden transition-[max-height] duration-500 ease-in-out"
              style={{ maxHeight: expanded ? "60rem" : "6rem" }}
            >
              <div className="text-base sm:text-lg text-ink-light space-y-4">
                {paragraphs.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
              <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-500"
                style={{
                  opacity: expanded ? 0 : 1,
                  background: "linear-gradient(to bottom, transparent 30%, #f7f3ed 100%)",
                }}
              />
            </div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-sm font-sans text-ink-muted hover:text-ink transition-colors underline cursor-pointer"
            >
              {expanded ? "Läs mindre" : "Läs mer"}
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
