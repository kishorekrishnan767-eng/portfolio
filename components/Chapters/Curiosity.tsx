"use client";

import { useRef } from "react";
import { about, chapters } from "@/data/content";
import { DUR, EASE, gsap, MQ, type MQConditions, SplitText, STAGGER, useGSAP } from "@/lib/gsap";
import { deferSetup } from "@/lib/schedule";
import { fadeIn, revealText } from "@/lib/reveal";
import Art from "@/components/ui/Art";
import Seam from "@/components/Seam";
import Kicker from "./Kicker";

const chapter = chapters[1];

/** PCB traces behind the manifesto: [path, end-pad]. viewBox 800×520. */
const TRACES: [string, [number, number]][] = [
  ["M0 40 H170 L210 80 H420 L450 50 H640", [640, 50]],
  ["M800 110 H660 L620 150 H480", [480, 150]],
  ["M0 170 H90 L130 210 H330", [330, 210]],
  ["M800 250 H700 L660 290 H560 L530 260 H420", [420, 260]],
  ["M0 330 H150 L190 290 H300", [300, 290]],
  ["M800 380 H620 L580 420 H400", [400, 420]],
  ["M0 470 H230 L270 430 H360", [360, 430]],
  ["M800 500 H520 L490 470 H440", [440, 470]],
];

function Circuit() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute -inset-x-6 -inset-y-10 opacity-45 will-change-transform md:-inset-x-12 md:-inset-y-14">
      <svg className="size-full" viewBox="0 0 800 520" preserveAspectRatio="xMidYMid slice" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <g className="stroke-fog/10" strokeWidth={1.25}>
          {TRACES.map(([d, [x, y]]) => (
            <g key={d}>
              <path d={d} />
              <circle cx={x} cy={y} r={5} />
            </g>
          ))}
        </g>
        <g className="stroke-cyan/80" strokeWidth={1.5}>
          {TRACES.map(([d]) => (
            <path key={d} className="cu-trace" d={d} style={{ strokeDasharray: "0 100000" }} />
          ))}
        </g>
        {TRACES.map(([d, [x, y]]) => (
          <circle key={d} className="cu-pad fill-cyan" cx={x} cy={y} r={3.5} opacity={0} />
        ))}
      </svg>
    </div>
  );
}

function Paragraph() {
  const i = about.paragraph.lastIndexOf(about.accent);
  if (i < 0) return <>{about.paragraph}</>;
  return (
    <>
      {about.paragraph.slice(0, i)}
      <em className="font-serif font-normal text-cyan glow-cyan">{about.accent}</em>
      {about.paragraph.slice(i + about.accent.length)}
    </>
  );
}

export default function Curiosity({ art }: { art: string | null }) {
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
              gsap.set(".cu-trace", { drawSVG: "100%" });
              gsap.set(".cu-pad", { opacity: 1 });
              fadeIn(".cu-title");
              fadeIn(".cu-para");
              fadeIn(".cu-facts");
              return;
            }

            revealText(".cu-title");

            // Manifesto: words brighten fog → mist as you read. Pinned on desktop, free-scroll on mobile.
            const words = SplitText.create(".cu-para", { type: "words", tag: "span", aria: "none" }).words;
            const hud = root.current!.querySelector<HTMLElement>(".cu-progress")!;
            const read = gsap.timeline({
                scrollTrigger: desktop
                  ? {
                      trigger: ".cu-pin",
                      start: "top top",
                      end: "+=150%",
                      pin: true,
                      scrub: true,
                      anticipatePin: 1,
                      onUpdate: (self) => {
                        hud.textContent = String(Math.round(self.progress * 100)).padStart(3, "0");
                      },
                    }
                  : { trigger: ".cu-para", start: "top 75%", end: "bottom 50%", scrub: true },
              })
              .fromTo(words, { opacity: 0.16 }, { opacity: 1, ease: "none", stagger: 0.1, duration: 0.5 }, 0)
              // Short hold so the last words land before the pin releases.
              .to({}, { duration: 0.6 });

            // The board lights up with the reading: trace i draws across its share of the words,
            // then its pad switches on.
            const readSpan = (words.length - 1) * 0.1 + 0.5;
            const seg = readSpan / TRACES.length;
            read.fromTo(".cu-trace", { drawSVG: "0%" }, { drawSVG: "100%", ease: "none", duration: seg * 1.15, stagger: seg }, 0);
            read.fromTo(
              ".cu-pad",
              { opacity: 0, scale: 0.3, transformOrigin: "50% 50%" },
              { opacity: 1, scale: 1, ease: EASE.enter, duration: seg * 0.3, stagger: seg },
              seg * 1.15,
            );

            // Key words flash cyan as the reading reaches them, then settle back to mist.
            const emphasis = new Set<string>(about.emphasis);
            words.forEach((w, i) => {
              if (!emphasis.has((w.textContent ?? "").replace(/[^a-z]/gi, "").toLowerCase())) return;
              read
                .to(w, { color: "#3df5d6", duration: 0.12, ease: "none" }, i * 0.1 + 0.25)
                .to(w, { color: "#e8f1f5", duration: 0.5, ease: "none" }, i * 0.1 + 0.5);
            });

            // Facts: rules draw, cells rise, counters tick. Reverses on scroll-up.
            const stats = gsap.timeline({
              scrollTrigger: { trigger: ".cu-stats", start: "top 85%", toggleActions: "play none none reverse" },
            });
            stats
              .from(".cu-rule", { scaleX: 0, duration: DUR.slow, ease: EASE.move, stagger: STAGGER.item }, 0)
              .from(".cu-stat-body", { yPercent: 40, opacity: 0, duration: DUR.base, ease: EASE.enter, stagger: STAGGER.item }, 0.1);

            gsap.utils.toArray<HTMLElement>(".cu-num").forEach((el, i) => {
              const value = Number(el.dataset.value);
              const decimals = Number(el.dataset.decimals);
              const n = { v: 0 };
              const render = () => {
                el.textContent = n.v.toFixed(decimals);
              };
              render();
              const t = 0.15 + i * STAGGER.item;
              stats
                .to(n, { v: value, duration: 1.6, ease: "power2.out", onUpdate: render }, t)
                // The number lands: a brief cyan glow, then back to mist.
                .fromTo(
                  el,
                  { color: "#e8f1f5", textShadow: "0 0 0px rgba(61,245,214,0)" },
                  { color: "#3df5d6", textShadow: "0 0 28px rgba(61,245,214,0.75)", duration: 0.2, ease: "none" },
                  t + 1.4,
                )
                .to(el, { color: "#e8f1f5", textShadow: "0 0 0px rgba(61,245,214,0)", duration: 0.9, ease: EASE.enter }, t + 1.6);
            });

            gsap.from(".cu-edu > *", {
              y: 24,
              opacity: 0,
              duration: DUR.base,
              ease: EASE.enter,
              stagger: STAGGER.item,
              scrollTrigger: { trigger: ".cu-edu", start: "top 88%", toggleActions: "play none none reverse" },
            });

            return () => {
              // Restore final values if the media context flips (e.g. to reduced motion).
              gsap.utils.toArray<HTMLElement>(".cu-num").forEach((el) => {
                el.textContent = Number(el.dataset.value).toFixed(Number(el.dataset.decimals));
              });
            };
          });
        }),
      ),
    { scope: root },
  );

  return (
    <section ref={root} id={chapter.id} data-chapter="1" aria-labelledby="curiosity-title" className="relative">
      <Seam from={chapters[0]} to={chapter} />
      <div className="cu-pin relative flex min-h-svh flex-col justify-center py-28">
        <Art src={art} slot="curiosity-pcb" reveal className="art-screen art-fade absolute inset-0 opacity-25" />
        <div className="shell grid gap-8 md:grid-cols-12 md:gap-10">
          <div className="flex flex-col justify-between gap-6 md:col-span-3">
            <Kicker chapter={chapter} />
            <p aria-hidden="true" className="label hidden text-fog/70 md:block">
              signal read <span className="cu-progress text-cyan tabular-nums">000</span>%
            </p>
          </div>
          <div className="relative md:col-span-9">
            <Circuit />
            <h2 id="curiosity-title" className="cu-title relative font-display text-title font-extrabold text-mist">
              {about.heading}
            </h2>
            <p className="cu-para relative mt-8 max-w-[34ch] font-sans text-[clamp(1.375rem,2.7vw,2.6rem)] font-semibold leading-[1.28] tracking-[-0.015em] text-mist md:mt-10">
              <Paragraph />
            </p>
          </div>
        </div>
      </div>

      <div className="cu-facts shell pb-32 pt-8 md:pb-48">
        <dl className="cu-stats grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
          {about.stats.map((s) => (
            <div key={s.label} className="relative overflow-hidden pt-6">
              <span aria-hidden="true" className="cu-rule absolute inset-x-0 top-0 h-px origin-left bg-fog/25" />
              <div className="cu-stat-body flex flex-col-reverse gap-3">
                <dt className="label text-fog">{s.label}</dt>
                <dd className="font-display text-[clamp(3rem,7vw,6rem)] font-extrabold leading-none tracking-[-0.04em] text-mist">
                  <span className="cu-num" data-value={s.value} data-decimals={s.decimals}>
                    {s.value.toFixed(s.decimals)}
                  </span>
                </dd>
              </div>
            </div>
          ))}
        </dl>

        <div className="cu-edu mt-20 flex flex-col gap-3 border-t border-fog/15 pt-6 md:mt-28 md:flex-row md:items-baseline md:justify-between md:gap-10">
          <p className="label text-fog">Education</p>
          <p className="font-display text-[clamp(1.5rem,2.6vw,2.25rem)] font-bold leading-tight text-mist">
            {about.education.institution}
          </p>
          <p className="label text-fog">
            {about.education.degree} <span className="text-cyan">·</span> {about.education.year}
          </p>
        </div>
      </div>
    </section>
  );
}
