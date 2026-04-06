"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";

interface Essay {
  title: string;
  slug: string;
}

function NavList({ essays, activeSlug }: { essays: Essay[]; activeSlug?: string }) {
  return (
    <>
      <h2 className="font-sans text-xs uppercase tracking-widest text-ink-muted mb-4">Innehåll</h2>
      <ol className="list-none space-y-2.5">
        {essays.map((essay, i) => (
          <li key={essay.slug}>
            <a
              href={`/${essay.slug}`}
              className={`block text-[13px] leading-snug font-sans transition-colors duration-300 ${
                activeSlug === essay.slug
                  ? "text-ink"
                  : "text-ink-muted/70 hover:text-ink"
              }`}
            >
              <span className="mr-2">{String(i + 1).padStart(2, "0")}</span>
              {essay.title}
            </a>
          </li>
        ))}
      </ol>
    </>
  );
}

export default function SidebarNav({ essays }: { essays: Essay[] }) {
  const [activeSlug, setActiveSlug] = useState("");
  const [mounted, setMounted] = useState(false);
  const intersecting = useState(() => new Set<string>())[0];

  const updateState = useCallback(() => {
    if (intersecting.size > 0) {
      const first = essays.find((e) => intersecting.has(e.slug));
      if (first) setActiveSlug(first.slug);
    } else {
      setActiveSlug("");
    }
  }, [essays, intersecting]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            intersecting.add(entry.target.id);
          } else {
            intersecting.delete(entry.target.id);
          }
        }
        updateState();
      },
      { rootMargin: "-20% 0px -60% 0px" },
    );

    for (const essay of essays) {
      const el = document.getElementById(essay.slug);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [essays, intersecting, updateState]);

  const visible = activeSlug !== "";

  return (
    <>
      {/* Inline on mobile */}
      <nav className="xl:hidden mb-2 -mx-4 sm:mx-0">
        <div className="bg-[#c8aa82]/[0.06] border-y sm:border border-accent/10 sm:rounded-sm px-6 sm:px-8 py-10 sm:py-12">
          <NavList essays={essays} />
        </div>
      </nav>

      {/* Fixed sidebar on desktop — portaled to body to escape transform context */}
      {mounted && createPortal(
        <nav className={`hidden xl:block fixed top-1/2 -translate-y-1/2 left-[calc(50vw+21rem+5rem)] w-64 transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          <NavList essays={essays} activeSlug={activeSlug} />
        </nav>,
        document.body,
      )}
    </>
  );
}
