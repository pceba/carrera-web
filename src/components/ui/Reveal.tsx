"use client";

import { createElement, useEffect, useRef, type ReactNode } from "react";

/**
 * Scroll reveal. Content is always in the server HTML and fully visible without JavaScript or
 * under `prefers-reduced-motion`. Only after hydration, an element that is still below the fold is
 * marked `data-reveal="out"` (see globals.css) and flipped to `"in"` once it scrolls into view.
 * Elements already on screen at load never hide, so there is no flash.
 */
export function useReveal<T extends HTMLElement>(delay = 0) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    if (delay) el.style.setProperty("--reveal-delay", `${delay}ms`);
    el.dataset.reveal = "out";
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        el.dataset.reveal = "in";
        io.disconnect();
      },
      { rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  return ref;
}

type Tag = "div" | "li" | "section" | "article" | "p" | "figure";

/** Wrapper that fades and lifts its children in once. `delay` (ms) staggers siblings. */
export function Reveal({
  as = "div",
  delay = 0,
  className,
  children,
}: {
  as?: Tag;
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  const ref = useReveal<HTMLElement>(delay);
  return createElement(as, { ref, className }, children);
}
