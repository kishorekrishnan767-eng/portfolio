"use client";

import { useRef } from "react";
import { achievements, chapters } from "@/data/content";
import { DUR, EASE, gsap, MQ, type MQConditions, ScrollTrigger, STAGGER, useGSAP } from "@/lib/gsap";
import { deferSetup } from "@/lib/schedule";
import { fadeIn, revealText } from "@/lib/reveal";
import Seam from "@/components/Seam";
import Kicker from "./Kicker";

const chapter = chapters[4];

export default function Proof() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    (_, contextSafe) =>
      // Built in its own task after hydration (see lib/schedule.ts).
      deferSetup(
        contextSafe!(() => {
          const mm = gsap.matchMedia();

          mm.add(MQ, (ctx) => {
            const { desktop, reduced } = ctx.conditions as MQConditions;

            if (reduced) {
              fadeIn(".pf-head");
              gsap.utils.toArray<HTMLElement>(".pf-card").forEach((card) => fadeIn(card));
              gsap.set(".pf-progress", { scaleY: 1 });
              gsap.set(".pf-node-lit", { opacity: 1 });
              gsap.set(".pf-tip", { autoAlpha: 0 });
              return;
            }

            revealText(".pf-title");

            // Local spine: draws (scaleY) with scroll; its head rides the tip.
            const list = root.current!.querySelector<HTMLElement>(".pf-list")!;
            const scrub = { trigger: list, start: "top 60%", end: "bottom 60%", scrub: true };
            gsap.fromTo(".pf-progress", { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: scrub });
            gsap.fromTo(
              ".pf-tip",
              { y: 0 },
              { y: () => list.offsetHeight, ease: "none", scrollTrigger: { ...scrub, invalidateOnRefresh: true } },
            );

            const cleanups: (() => void)[] = [];

            gsap.utils.toArray<HTMLElement>(".pf-item").forEach((item, i) => {
              const card = item.querySelector<HTMLElement>(".pf-card")!;
              const fromLeft = desktop && i % 2 === 0;

              // Sonar: two rings pulse out of the node — when the spine reaches it, and on card hover.
              const rings = item.querySelectorAll(".pf-ring");
              const ping = () =>
                gsap.fromTo(
                  rings,
                  { scale: 1, opacity: 0.9 },
                  { scale: 7, opacity: 0, duration: 1.6, ease: "power2.out", stagger: 0.35, overwrite: true },
                );

              // Node lights when the spine reaches it, dims again on the way back up.
              const lit = item.querySelector(".pf-node-lit");
              ScrollTrigger.create({
                trigger: item,
                start: "top 60%",
                onEnter: () => {
                  gsap.to(lit, { opacity: 1, scale: 1, duration: DUR.fast, ease: EASE.enter });
                  ping();
                },
                onLeaveBack: () => gsap.to(lit, { opacity: 0, scale: 0.4, duration: DUR.fast, ease: EASE.enter }),
              });
              card.addEventListener("pointerenter", ping);
              cleanups.push(() => card.removeEventListener("pointerenter", ping));
              gsap.set(lit, { opacity: 0, scale: 0.4 });

              gsap
                .timeline({ scrollTrigger: { trigger: item, start: "top 82%", toggleActions: "play none none reverse" } })
                .from(card, { x: fromLeft ? -90 : 90, opacity: 0, duration: DUR.slow, ease: EASE.enter })
                .from(card.querySelectorAll(".pf-bit"), { y: 16, opacity: 0, duration: DUR.base, ease: EASE.enter, stagger: STAGGER.item }, 0.15);
            });

            return () => cleanups.forEach((fn) => fn());
          });

          // 3D tilt + glare on hover — fine pointers only. Rotation composes with the reveal's x/opacity.
          mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
            const offs = gsap.utils.toArray<HTMLElement>(".pf-card").map((card) => {
              gsap.set(card, { transformPerspective: 900 });
              const rx = gsap.quickTo(card, "rotationX", { duration: 0.6, ease: EASE.enter });
              const ry = gsap.quickTo(card, "rotationY", { duration: 0.6, ease: EASE.enter });
              const move = (e: PointerEvent) => {
                const r = card.getBoundingClientRect();
                const px = (e.clientX - r.left) / r.width;
                const py = (e.clientY - r.top) / r.height;
                ry((px - 0.5) * 14);
                rx((0.5 - py) * 12);
                card.style.setProperty("--gx", `${px * 100}%`);
                card.style.setProperty("--gy", `${py * 100}%`);
              };
              const leave = () => {
                rx(0);
                ry(0);
              };
              card.addEventListener("pointermove", move);
              card.addEventListener("pointerleave", leave);
              return () => {
                card.removeEventListener("pointermove", move);
                card.removeEventListener("pointerleave", leave);
              };
            });
            return () => offs.forEach((fn) => fn());
          });
        }),
      ),
    { scope: root },
  );

  return (
    <section
      ref={root}
      id={chapter.id}
      data-chapter="4"
      aria-labelledby="proof-title"
      // Cards start ±90px off-axis; clip so they never widen the page (mobile layout viewport).
      className="relative overflow-x-clip pb-32 md:pb-48"
    >
      <Seam from={chapters[3]} to={chapter} />
      <div className="pf-head shell grid gap-8 md:grid-cols-12 md:gap-10">
        <Kicker chapter={chapter} className="md:col-span-3 md:pt-4" />
        <h2 id="proof-title" className="pf-title font-display text-display font-extrabold text-mist md:col-span-9">
          {achievements.heading}
        </h2>
      </div>

      <div className="shell mt-20 md:mt-28">
        <ol className="pf-list relative mx-auto max-w-6xl">
          {/* Track + drawn signal */}
          <span aria-hidden="true" className="absolute inset-y-0 left-3 w-px -translate-x-1/2 bg-fog/15 md:left-1/2" />
          <span
            aria-hidden="true"
            className="pf-progress absolute inset-y-0 left-3 w-px origin-top -translate-x-1/2 bg-cyan md:left-1/2"
            style={{ boxShadow: "var(--glow-cyan)" }}
          />
          <span
            aria-hidden="true"
            className="pf-tip absolute left-3 top-0 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-mist md:left-1/2"
            style={{ boxShadow: "var(--glow-cyan)" }}
          />

          {achievements.list.map((a, i) => {
            const left = i % 2 === 0;
            return (
              <li
                key={a.title}
                className="pf-item relative grid grid-cols-[1.5rem_1fr] gap-x-5 pb-10 last:pb-0 md:grid-cols-[1fr_4rem_1fr] md:gap-x-0 md:pb-14"
              >
                <span aria-hidden="true" className="relative col-start-1 row-start-1 mt-8 size-3 justify-self-center rounded-full border border-fog/40 bg-abyss md:col-start-2">
                  <span className="pf-ring absolute -inset-px rounded-full border border-cyan/70 opacity-0" />
                  <span className="pf-ring absolute -inset-px rounded-full border border-cyan/70 opacity-0" />
                  <span className="pf-node-lit absolute -inset-px rounded-full bg-cyan" style={{ boxShadow: "var(--glow-cyan)" }} />
                </span>

                <article
                  className={`pf-card group relative col-start-2 row-start-1 overflow-hidden rounded-2xl border border-fog/15 bg-navy/50 p-6 transition-colors duration-500 hover:border-cyan/40 md:p-8 ${
                    left ? "md:col-start-1 md:text-right" : "md:col-start-3"
                  }`}
                >
                  <span aria-hidden="true" className="pf-glare pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className={`pf-bit relative flex flex-wrap items-center gap-3 ${left ? "md:justify-end" : ""}`}>
                    <span className="label text-cyan">{a.year}</span>
                    {a.tag && <span className="label rounded-full border border-fog/25 px-2.5 py-1.5 text-[0.625rem] text-fog">{a.tag}</span>}
                  </div>
                  <h3 className="pf-bit relative mt-4 font-display text-[clamp(1.375rem,2.4vw,2rem)] font-bold leading-tight text-mist">
                    {a.title}
                  </h3>
                  <p className="pf-bit relative mt-2 text-fog">{a.org}</p>
                </article>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
