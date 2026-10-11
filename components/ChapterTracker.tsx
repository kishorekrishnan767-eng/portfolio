"use client";

import { useRef } from "react";
import { chapters } from "@/data/content";
import { DUR, EASE, gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { activeChapter } from "@/lib/signal";

/**
 * Watches every [data-chapter] section: publishes the active chapter and shifts the
 * world's depth (abyss ↔ navy) by fading a fixed navy layer — opacity only, no paint-heavy
 * background-color tweens. Fully reversible: driven by onToggle in both directions.
 */
export default function ChapterTracker() {
  const layer = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const sections = gsap.utils.toArray<HTMLElement>("[data-chapter]");
    sections.forEach((section) => {
      const index = Number(section.dataset.chapter);
      const depth = chapters[index]?.depth ?? "abyss";
      ScrollTrigger.create({
        trigger: section,
        start: "top 50%",
        end: "bottom 50%",
        // Measure after pinned chapters have inserted their spacing.
        refreshPriority: -1,
        onToggle: (self) => {
          if (!self.isActive) return;
          activeChapter.set(index);
          gsap.to(layer.current, {
            opacity: depth === "navy" ? 1 : 0,
            duration: DUR.slow,
            ease: EASE.move,
            overwrite: true,
          });
        },
      });
    });
  });

  return (
    <div
      ref={layer}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 bg-navy opacity-0"
      style={{
        backgroundImage: "radial-gradient(90% 60% at 50% 0%, rgb(16 27 46 / 0.9), transparent 70%)",
      }}
    />
  );
}
