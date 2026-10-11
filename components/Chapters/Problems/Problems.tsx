"use client";

import { useRef } from "react";
import { chapters, projects } from "@/data/content";
import { DUR, EASE, gsap, MQ, type MQConditions, ScrollTrigger, STAGGER, useGSAP } from "@/lib/gsap";
import { deferSetup } from "@/lib/schedule";
import { fadeIn, revealText } from "@/lib/reveal";
import Seam from "@/components/Seam";
import Kicker from "../Kicker";
import Scene from "./Scene";
import { VISUALS } from "./visuals";

const chapter = chapters[3];
const TOTAL = projects.list.length;
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Chapter III — the centrepiece.
 * Desktop: the viewport pins and the track scrolls horizontally; every inner trigger
 * (copy reveals, parallax, story scrubs, ambient loops) rides the horizontal tween via
 * containerAnimation. Mobile: the same scenes stacked vertically. Reduced motion: static.
 */
export default function Problems({ art }: { art: Record<string, string | null> }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    (_, contextSafe) =>
      // Built in its own task after hydration (see lib/schedule.ts).
      deferSetup(
        contextSafe!(() => {
          const section = root.current!;
          const viewport = section.querySelector<HTMLElement>(".pr-viewport")!;
          const track = section.querySelector<HTMLElement>(".pr-track")!;
          const scenes = gsap.utils.toArray<HTMLElement>(".pr-scene", section);
          const mm = gsap.matchMedia();

          mm.add(MQ, (ctx) => {
            const { desktop, reduced } = ctx.conditions as MQConditions;
            const stories = scenes.map((scene) => VISUALS[scene.dataset.project!].build(scene));

            // Signal path (sensor → MCU → backend → app) rides along with each story.
            stories.forEach(({ story }, i) => {
              const flow = scenes[i].querySelector(".pr-flow");
              if (!flow) return;
              const d = story.duration();
              story
                .fromTo(flow.querySelector(".pr-flow-run"), { xPercent: -100 }, { xPercent: 0, ease: "none", duration: d }, 0)
                .fromTo(flow.querySelector(".pr-flow-lit"), { scaleX: 0 }, { scaleX: 1, ease: "none", duration: d }, 0);
              flow.querySelectorAll(".pr-flow-node").forEach((node, k) => {
                story.fromTo(node, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.06, ease: EASE.enter }, (d * k) / 3);
              });
            });

            if (reduced) {
              stories.forEach((s) => s.still());
              fadeIn(".pr-intro");
              scenes.forEach((scene) => fadeIn(scene.querySelectorAll(".pr-reveal"), { trigger: scene }));
              return;
            }

            revealText(".pr-title");
            gsap.from(".pr-intro-fade", {
              opacity: 0,
              y: 20,
              duration: DUR.base,
              ease: EASE.enter,
              stagger: STAGGER.item,
              scrollTrigger: { trigger: ".pr-intro", start: "top 70%", toggleActions: "play none none reverse" },
            });

            if (!desktop) {
              // Mobile: vertical scenes, ordinary triggers.
              scenes.forEach((scene, i) => {
                gsap.from(scene.querySelectorAll(".pr-reveal"), {
                  y: 32,
                  opacity: 0,
                  duration: DUR.base,
                  ease: EASE.enter,
                  stagger: STAGGER.item,
                  scrollTrigger: { trigger: scene, start: "top 65%", toggleActions: "play none none reverse" },
                });
                ScrollTrigger.create({
                  trigger: scene,
                  start: "top 75%",
                  end: "center 35%",
                  scrub: true,
                  animation: stories[i].story,
                });
                const loop = stories[i].loop;
                if (loop) {
                  ScrollTrigger.create({
                    trigger: scene,
                    start: "top bottom",
                    end: "bottom top",
                    onToggle: (self) => loop.paused(!self.isActive),
                  });
                }
              });
              return;
            }

            // ── Desktop: pinned horizontal scroll ──
            // Scenes are exactly one viewport wide (excluding the scrollbar gutter) via --pr-w.
            // A measured px width instead of container queries: containment made Chrome
            // report the pin switching to position:fixed as a layout shift.
            const setWidth = () => viewport.style.setProperty("--pr-w", `${section.clientWidth}px`);
            setWidth();
            ScrollTrigger.addEventListener("refreshInit", setWidth);
            const distance = () => track.scrollWidth - section.clientWidth;
            const bar = section.querySelector<HTMLElement>(".pr-bar")!;
            const setBar = gsap.quickSetter(bar, "scaleX");

            const horizontal = gsap.to(track, {
              x: () => -distance(),
              ease: "none",
              scrollTrigger: {
                trigger: viewport,
                start: "top top",
                end: () => `+=${distance()}`,
                pin: true,
                scrub: true,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                onUpdate: (self) => setBar(self.progress),
              },
            });

            // Scene counter (01/03) rolls like the nav odometer.
            const roll = section.querySelector<HTMLElement>(".pr-roll")!;
            const setScene = (i: number) =>
              gsap.to(roll, { yPercent: (-100 * i) / TOTAL, duration: DUR.base, ease: EASE.move, overwrite: true });

            scenes.forEach((scene, i) => {
              const along = { trigger: scene, containerAnimation: horizontal };

              ScrollTrigger.create({
                ...along,
                start: "left center",
                end: "right center",
                onToggle: (self) => self.isActive && setScene(i),
              });

              // Copy arrives as the scene slides in.
              gsap.from(scene.querySelectorAll(".pr-reveal"), {
                y: 40,
                opacity: 0,
                duration: DUR.base,
                ease: EASE.enter,
                stagger: STAGGER.item,
                scrollTrigger: { ...along, start: "left 65%", toggleActions: "play none none reverse" },
              });

              // Parallax: negative depth lags behind the track, positive leads it. Zero offset at centre.
              scene.querySelectorAll<HTMLElement>("[data-depth]").forEach((layer) => {
                const d = Number(layer.dataset.depth);
                gsap.fromTo(
                  layer,
                  { x: () => d * section.clientWidth * 0.5 },
                  {
                    x: () => -d * section.clientWidth * 0.5,
                    ease: "none",
                    scrollTrigger: { ...along, start: "left right", end: "right left", scrub: true, invalidateOnRefresh: true },
                  },
                );
              });

              // The micro-story plays out as the scene settles into view.
              ScrollTrigger.create({ ...along, start: "left 80%", end: "left 5%", scrub: true, animation: stories[i].story });

              const loop = stories[i].loop;
              if (loop) {
                ScrollTrigger.create({
                  ...along,
                  start: "left right",
                  end: "right left",
                  onToggle: (self) => loop.paused(!self.isActive),
                });
              }
            });

            return () => {
              ScrollTrigger.removeEventListener("refreshInit", setWidth);
              viewport.style.removeProperty("--pr-w");
            };
          });
        }),
      ),
    { scope: root },
  );

  return (
    <section
      ref={root}
      id={chapter.id}
      data-chapter="3"
      aria-labelledby="problems-title"
      // Clips the unpinned track; the pinned (fixed) viewport escapes ancestor clipping, so no layout shift.
      className="relative overflow-x-clip"
    >
      <Seam from={chapters[2]} to={chapter} />
      <div className="pr-viewport relative">
        <div className="pr-track" data-cursor="drag" data-cursor-label="Scroll">
          <div className="pr-intro">
            <div className="shell">
              <Kicker chapter={chapter} className="pr-intro-fade" />
              <h2 id="problems-title" className="pr-title mt-6 max-w-[12ch] font-display text-display font-extrabold text-mist">
                {projects.heading}
              </h2>
              <p className="pr-intro-fade mt-8 max-w-md text-lead text-fog">{projects.sub}</p>
              <p aria-hidden="true" className="pr-intro-fade pr-hint label mt-12 items-center gap-3 text-fog/70">
                {projects.hint}
                <span className="pr-hint-arrow inline-block text-cyan">→</span>
              </p>
            </div>
          </div>

          {projects.list.map((p) => (
            <Scene key={p.id} project={p} total={TOTAL} art={art[`project-${p.id}`] ?? null} />
          ))}
        </div>

        <div aria-hidden="true" className="pr-hud pointer-events-none absolute inset-x-0 bottom-0 pb-7">
          <div className="shell flex items-center gap-6">
            <span className="label text-fog/70">
              {chapter.numeral} — {chapter.title}
            </span>
            <span className="relative h-px flex-1 bg-fog/20">
              <span className="pr-bar absolute inset-0 origin-left scale-x-0 bg-cyan" />
            </span>
            <span className="label flex items-center gap-1 text-fog">
              <span className="block h-[1em] overflow-hidden text-mist">
                <span className="pr-roll block">
                  {projects.list.map((p) => (
                    <span key={p.id} className="block h-[1em] tabular-nums">
                      {p.index}
                    </span>
                  ))}
                </span>
              </span>
              / {pad(TOTAL)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
