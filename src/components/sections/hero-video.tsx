"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";

export type HeroClip = {
  src: string;
  poster: string;
  /** Second in the source clip where our segment starts. */
  start: number;
  /** How long the segment plays before crossfading to the next clip. */
  length: number;
};

const FADE_MS = 1200;

/**
 * Background film for the homepage hero: short segments from several clips,
 * played in order with crossfades so the hospital "story" moves from
 * reception to corridor to consultation.
 *
 * Only the current and next clips load. Phones, data-saver users and anyone
 * who prefers reduced motion get the first still frame instead.
 */
export function HeroVideo({ clips }: { clips: HeroClip[] }) {
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [mode, setMode] = useState<"pending" | "video" | "still">("pending");
  const frame = useRef<HTMLDivElement>(null);
  // The film runs continuously while the hero is on screen, and rests once
  // the visitor scrolls past it so it costs nothing in the background.
  const [offscreen, setOffscreen] = useState(false);

  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setOffscreen(!entry.isIntersecting), { threshold: 0 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (mode !== "video") return;
    const current = videos.current[active];
    if (!current) return;
    if (offscreen) current.pause();
    else current.play().catch(() => {});
    // Only react to visibility changes; clip changes are handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offscreen, mode]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.matchMedia("(max-width: 767px)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    // Browser capabilities are only known after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMode(reduced || small || saveData ? "still" : "video");
  }, []);

  // Start the first clip once we know video is wanted.
  useEffect(() => {
    if (mode !== "video") return;
    const first = videos.current[0];
    if (!first) return;
    first.currentTime = clips[0].start;
    first.play().catch(() => setMode("still"));
  }, [mode, clips]);

  // Watch the active clip; preload the next one, then crossfade.
  useEffect(() => {
    if (mode !== "video" || offscreen) return;
    const current = videos.current[active];
    const nextIndex = (active + 1) % clips.length;
    const next = videos.current[nextIndex];
    if (!current || !next) return;
    const clip = clips[active];

    const onTime = () => {
      const elapsed = current.currentTime - clip.start;
      if (elapsed > clip.length - 3 && next.preload !== "auto") {
        next.preload = "auto";
        next.load();
      }
      if (elapsed >= clip.length || current.ended) {
        current.removeEventListener("timeupdate", onTime);
        next.currentTime = clips[nextIndex].start;
        next.play().catch(() => {});
        setActive(nextIndex);
        window.setTimeout(() => current.pause(), FADE_MS);
      }
    };
    current.addEventListener("timeupdate", onTime);
    current.addEventListener("ended", onTime);
    return () => {
      current.removeEventListener("timeupdate", onTime);
      current.removeEventListener("ended", onTime);
    };
  }, [active, mode, offscreen, clips]);

  return (
    <div ref={frame} aria-hidden="true" className="absolute inset-0 overflow-hidden bg-teal-950">
      {mode === "video" ? (
        clips.map((clip, i) => (
          <video
            key={clip.src}
            ref={(el) => {
              videos.current[i] = el;
            }}
            src={clip.src}
            poster={clip.poster}
            muted
            playsInline
            preload={i === 0 ? "auto" : "none"}
            className={cn(
              "absolute inset-0 size-full object-cover transition-opacity ease-out",
              i === active ? "opacity-100" : "opacity-0",
            )}
            style={{ transitionDuration: `${FADE_MS}ms` }}
          />
        ))
      ) : (
        // Still frame: used before hydration and whenever video is skipped.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={clips[0].poster} alt="" className="absolute inset-0 size-full object-cover" fetchPriority="high" />
      )}
    </div>
  );
}
