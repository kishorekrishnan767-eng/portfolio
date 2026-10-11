"use client";

import { useRef, useState } from "react";
import Magnetic from "@/components/ui/Magnetic";
import { chapters, connect } from "@/data/content";
import { DUR, EASE, gsap, MQ, type MQConditions, ScrollTrigger, SplitText, STAGGER, useGSAP } from "@/lib/gsap";
import { deferSetup } from "@/lib/schedule";
import { fadeIn } from "@/lib/reveal";
import Art from "@/components/ui/Art";
import Seam from "@/components/Seam";
import Kicker from "./Kicker";

const chapter = chapters[6];
const ECG_H = 96;
const BASE = 64;
const BEAT_EVERY = 260;

/** A steady rhythm across the full width, built in real pixels so DrawSVG can measure it. */
function ecgPath(w: number) {
  let d = `M0 ${BASE}`;
  for (let x = 90; x + 60 < w; x += BEAT_EVERY) {
    d +=
      ` H${x} Q${x + 7} ${BASE - 8} ${x + 14} ${BASE} H${x + 20}` +
      ` L${x + 25} ${BASE + 8} L${x + 32} ${BASE - 56} L${x + 39} ${BASE + 22} L${x + 44} ${BASE}` +
      ` H${x + 54} Q${x + 63} ${BASE - 12} ${x + 72} ${BASE}`;
  }
  return `${d} H${w}`;
}

export default function Epilogue({ art }: { art: string | null }) {
  const root = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(connect.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      window.location.href = `mailto:${connect.email}`;
    }
  };

  useGSAP(
    (_, contextSafe) =>
      // Built in its own task after hydration (see lib/schedule.ts).
      deferSetup(
        contextSafe!(() => {
          const section = root.current!;
          const svg = section.querySelector<SVGSVGElement>(".ep-ecg")!;
          const paths = svg.querySelectorAll<SVGPathElement>("path");

          const layout = () => {
            const w = Math.max(320, Math.round(svg.clientWidth));
            svg.setAttribute("viewBox", `0 0 ${w} ${ECG_H}`);
            const d = ecgPath(w);
            paths.forEach((p) => p.setAttribute("d", d));
            return w;
          };

          const mm = gsap.matchMedia();
          mm.add(MQ, (ctx) => {
            if ((ctx.conditions as MQConditions).reduced) {
              layout();
              gsap.set(paths, { drawSVG: "100%" });
              fadeIn(".ep-reveal", { trigger: section });
              return;
            }

            // Giant headline: chars rise out of line masks.
            SplitText.create(".ep-title", {
              type: "chars,lines",
              mask: "lines",
              linesClass: "split-mask",
              autoSplit: true,
              onSplit: (self) =>
                gsap.from(self.chars, {
                  yPercent: 115,
                  duration: DUR.hero,
                  ease: EASE.hero,
                  stagger: 0.035,
                  scrollTrigger: { trigger: section, start: "top 65%", toggleActions: "play none none reverse" },
                }),
            });

            gsap.from(".ep-reveal", {
              y: 28,
              opacity: 0,
              duration: DUR.base,
              ease: EASE.enter,
              stagger: STAGGER.item,
              scrollTrigger: { trigger: section, start: "top 45%", toggleActions: "play none none reverse" },
            });

            // Steady heartbeat: constant-speed monitor sweep, only while visible. Rebuilt on resize.
            let loop: gsap.core.Timeline | undefined;
            const pace = { v: 1 };
            let visible = false;
            const build = () => {
              loop?.kill();
              const w = layout();
              const lit = paths[1];
              loop = gsap
                .timeline({ repeat: -1, paused: !visible })
                .fromTo(lit, { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", duration: w / 340, ease: "none" })
                .to(lit, { drawSVG: "100% 100%", duration: 0.7, ease: "none" });
              loop.timeScale(pace.v);
            };
            build();
            ScrollTrigger.addEventListener("refresh", build);

            // Reaching for the email makes the heart race; it settles when you let go.
            const email = section.querySelector<HTMLElement>(".ep-email")!;
            const setPace = (v: number) =>
              gsap.to(pace, { v, duration: 0.8, ease: EASE.move, overwrite: true, onUpdate: () => loop?.timeScale(pace.v) });
            const race = () => setPace(2.6);
            const settle = () => setPace(1);
            const events: [string, () => void][] = [
              ["pointerenter", race],
              ["pointerleave", settle],
              ["focus", race],
              ["blur", settle],
            ];
            events.forEach(([type, fn]) => email.addEventListener(type, fn));

            ScrollTrigger.create({
              trigger: svg,
              start: "top bottom",
              end: "bottom top",
              onToggle: (self) => {
                visible = self.isActive;
                loop?.paused(!visible);
              },
            });

            return () => {
              ScrollTrigger.removeEventListener("refresh", build);
              events.forEach(([type, fn]) => email.removeEventListener(type, fn));
              loop?.kill();
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
      data-chapter="6"
      aria-labelledby="connect-title"
      className="relative flex min-h-svh flex-col justify-center overflow-hidden pb-16"
    >
      <Seam from={chapters[5]} to={chapter} />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: "radial-gradient(60% 50% at 50% 60%, rgb(61 245 214 / 0.06), transparent 70%)" }}
      />
      <Art src={art} slot="connect-globe" reveal className="art-screen art-fade absolute inset-0 opacity-35" />

      <div className="shell relative">
        <Kicker chapter={chapter} className="ep-reveal" />
        <h2
          id="connect-title"
          className="ep-title mt-8 font-display text-[clamp(3.5rem,14.5vw,16rem)] font-extrabold leading-[0.86] tracking-[-0.05em] text-mist"
        >
          {connect.heading.before}
          <em className="font-serif font-normal tracking-[-0.02em] text-cyan glow-cyan">{connect.heading.accent}</em>
        </h2>
        <p className="ep-reveal mt-8 max-w-md text-lead text-fog">{connect.sub}</p>
      </div>

      <svg aria-hidden="true" className="ep-ecg relative mt-12 block h-24 w-full overflow-visible md:mt-16" viewBox={`0 0 1200 ${ECG_H}`} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path className="stroke-fog/15" strokeWidth={1.25} d={ecgPath(1200)} />
        <path className="stroke-cyan" strokeWidth={2} d={ecgPath(1200)} style={{ strokeDasharray: "0 100000", filter: "drop-shadow(0 0 6px rgb(61 245 214 / 0.75))" }} />
      </svg>

      <div className="ep-cta shell relative mt-12 flex flex-col gap-10 md:mt-16 md:flex-row md:items-end md:justify-between">
        <div className="ep-reveal flex flex-wrap items-center gap-3">
          <Magnetic strength={0.25}>
            <a
              href={`mailto:${connect.email}`}
              data-cursor="link"
              className="ep-email btn-lift group inline-flex items-center gap-4 rounded-full border border-cyan/60 bg-cyan/10 px-6 py-4 text-mist transition-colors duration-500 ease-enter hover:bg-cyan hover:text-abyss md:px-9 md:py-6"
            >
              <span data-magnetic-inner className="inline-flex items-center gap-4">
                <span className="font-display text-[clamp(0.95rem,2.6vw,1.875rem)] font-bold tracking-[-0.01em]">{connect.email}</span>
                <span aria-hidden="true" className="transition-transform duration-500 ease-enter group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                  ↗
                </span>
              </span>
            </a>
          </Magnetic>
          <button
            type="button"
            onClick={copy}
            className="label rounded-full border border-fog/25 px-4 py-3 text-fog transition-colors duration-300 hover:border-mist hover:text-mist"
          >
            {copied ? "Copied" : "Copy"}
            <span className="sr-only" aria-live="polite">
              {copied ? " — email address copied to clipboard" : ""}
            </span>
          </button>
        </div>

        <ul className="ep-reveal flex flex-wrap gap-x-10 gap-y-4">
          {connect.links
            .filter((l) => l.href)
            .map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="link"
                className="group flex flex-col gap-1"
              >
                <span className="label text-fog/70">{l.label}</span>
                <span className="link-draw font-sans font-semibold text-mist transition-colors duration-300 group-hover:text-cyan">
                  {l.handle} <span aria-hidden="true">↗</span>
                  <span className="sr-only"> (opens in a new tab)</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
