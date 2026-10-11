"use client";

import { useRef } from "react";
import { chapters, now } from "@/data/content";
import { DUR, EASE, gsap, MQ, type MQConditions, ScrollTrigger, STAGGER, useGSAP } from "@/lib/gsap";
import { deferSetup } from "@/lib/schedule";
import { fadeIn, revealText } from "@/lib/reveal";
import Seam from "@/components/Seam";
import Art from "@/components/ui/Art";
import Board from "./Board";
import Kicker from "./Kicker";

const chapter = chapters[5];

export default function Now({ art }: { art: string | null }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    (_, contextSafe) =>
      // Built in its own task after hydration (see lib/schedule.ts).
      deferSetup(
        contextSafe!(() => {
          // Board pulses/LED repaint every frame — only run them while the panel is visible.
          ScrollTrigger.create({
            trigger: ".nw-panel",
            start: "top bottom",
            end: "bottom top",
            toggleClass: { targets: ".nw-board-wrap", className: "is-live" },
          });

          const mm = gsap.matchMedia();
          mm.add(MQ, (ctx) => {
            if ((ctx.conditions as MQConditions).reduced) {
              fadeIn(".nw-panel");
              return;
            }

            revealText(".nw-title", { trigger: ".nw-panel", start: "top 70%", delay: 0.25 });
            revealText(".nw-blurb", { trigger: ".nw-panel", start: "top 70%", delay: 0.55 });

            gsap
              .timeline({ scrollTrigger: { trigger: ".nw-panel", start: "top 80%", toggleActions: "play none none reverse" } })
              .fromTo(
                ".nw-panel",
                { clipPath: "inset(18% 8% 18% 8% round 28px)", opacity: 0 },
                { clipPath: "inset(0% 0% 0% 0% round 28px)", opacity: 1, duration: DUR.slow, ease: EASE.move },
              )
              .from(".nw-bit", { y: 18, opacity: 0, duration: DUR.base, ease: EASE.enter, stagger: STAGGER.item }, 0.45)
              // The board draws itself in, then powers up.
              .fromTo(".bd-line", { drawSVG: "0%" }, { drawSVG: "100%", duration: 1.3, ease: EASE.move, stagger: 0.008 }, 0.35)
              .from([".bd-text", ".bd-flow"], { opacity: 0, duration: 0.6, ease: EASE.enter }, 1.3)
              .from(".bd-led-group", { opacity: 0, duration: 0.25 }, 1.5);
          });
        }),
      ),
    { scope: root },
  );

  return (
    <section ref={root} id={chapter.id} data-chapter="5" aria-labelledby="now-title" className="relative pb-32 md:pb-48">
      <Seam from={chapters[4]} to={chapter} />
      <div className="shell">
        <Kicker chapter={chapter} />

        <div className="nw-panel relative mt-10 overflow-hidden rounded-[28px] border border-fog/15 bg-trench/60 p-7 md:mt-14 md:p-14">
          <Art src={art} slot="now-board" sizes="(min-width: 1024px) 80vw, 100vw" className="art-screen art-fade absolute inset-0 opacity-15" />
          {/* Slow, low-opacity aura drifting behind the panel (transform-only, composited). */}
          <div
            aria-hidden="true"
            className="nw-aura pointer-events-none absolute -right-1/4 -top-1/3 size-[80%] rounded-full will-change-transform"
            style={{ background: "radial-gradient(closest-side, rgb(61 245 214 / 0.11), transparent)" }}
          />
          <div
            aria-hidden="true"
            className="nw-aura nw-aura-2 pointer-events-none absolute -bottom-1/3 -left-1/4 size-[70%] rounded-full will-change-transform"
            style={{ background: "radial-gradient(closest-side, rgb(139 92 255 / 0.08), transparent)" }}
          />

          <div className="nw-bit relative flex flex-wrap items-center justify-between gap-4">
            <p className="label flex items-center gap-3 text-cyan" role="status">
              <span aria-hidden="true" className="relative flex size-2.5">
                <span className="now-ping absolute inset-0 rounded-full bg-cyan" />
                <span className="now-blink relative size-2.5 rounded-full bg-cyan" style={{ boxShadow: "var(--glow-cyan)" }} />
              </span>
              {now.status}
            </p>
            <p className="label text-fog">{now.role}</p>
          </div>

          <div className="relative mt-10 grid gap-12 md:mt-14 lg:grid-cols-12 lg:items-center lg:gap-10">
            <div className="lg:col-span-7">
              <h2 id="now-title" className="nw-title max-w-[16ch] font-display text-[clamp(2.25rem,5.5vw,5.5rem)] font-extrabold leading-[0.95] tracking-[-0.035em] text-mist">
                {now.company}
              </h2>
              <p className="nw-blurb mt-8 max-w-2xl text-lead text-fog md:mt-10">{now.blurb}</p>
              <div className="nw-bit mt-8 flex items-end justify-between gap-6">
                <p className="label text-mist">{now.focus}</p>
                {/* Activity meter: something is always compiling. */}
                <span aria-hidden="true" className="flex h-8 items-end gap-1">
                  {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                    <span
                      key={i}
                      className="now-eq block h-full w-1 origin-bottom rounded-full bg-cyan/70"
                      style={{ animationDelay: `${i * -0.17}s` }}
                    />
                  ))}
                </span>
              </div>
            </div>
            <div className="nw-board-wrap mx-auto w-full max-w-md lg:col-span-5">
              <Board />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
