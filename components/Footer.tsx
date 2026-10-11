"use client";

import { useRef } from "react";
import { connect } from "@/data/content";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { deferSetup } from "@/lib/schedule";
import { navigate } from "@/lib/navigate";

const REPEAT = 4;

export default function Footer() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    (_, contextSafe) =>
      // Built in its own task after hydration (see lib/schedule.ts).
      deferSetup(
        contextSafe!(() => {
          const mm = gsap.matchMedia();
          mm.add("(prefers-reduced-motion: no-preference)", () => {
            const track = root.current!.querySelector<HTMLElement>(".ft-track")!;
            const loop = gsap.to(track, { xPercent: -50, ease: "none", duration: track.scrollWidth / 2 / 60, repeat: -1, paused: true });
            ScrollTrigger.create({
              trigger: root.current,
              start: "top bottom",
              end: "bottom top",
              onToggle: (self) => loop.paused(!self.isActive),
            });
          });
        }),
      ),
    { scope: root },
  );

  const half = Array.from({ length: REPEAT }, (_, i) => i);

  return (
    <footer ref={root} className="relative border-t border-fog/10">
      <p className="sr-only">{connect.marquee}</p>
      <div aria-hidden="true" className="overflow-hidden py-8 md:py-10">
        <div className="ft-track flex w-max">
          {[0, 1].map((h) => (
            <div key={h} className="flex shrink-0 items-center">
              {half.map((i) => (
                <span key={i} className="flex items-center">
                  <span
                    className={`px-[0.4em] font-display text-[clamp(2rem,6vw,5rem)] font-extrabold tracking-[-0.03em] whitespace-nowrap ${
                      i % 2 ? "text-outline" : "text-mist"
                    }`}
                  >
                    {connect.marquee}
                  </span>
                  <span className="size-2 shrink-0 rounded-full bg-cyan md:size-3" style={{ boxShadow: "var(--glow-cyan)" }} />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="shell flex flex-col gap-4 border-t border-fog/10 py-8 md:flex-row md:items-center md:justify-between">
        <p className="label text-fog/70">{connect.footer}</p>
        <button
          type="button"
          onClick={() => navigate("#prologue")}
          className="label self-start text-fog transition-colors duration-300 hover:text-cyan md:self-auto"
        >
          <span className="link-draw">Back to the first signal</span> ↑
        </button>
      </div>
    </footer>
  );
}
