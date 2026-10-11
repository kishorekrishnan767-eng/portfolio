"use client";

import { useRef } from "react";
import Art from "@/components/ui/Art";
import Magnetic from "@/components/ui/Magnetic";
import { hero } from "@/data/content";
import { DUR, EASE, gsap, MQ, ScrollTrigger, SplitText, STAGGER, useGSAP } from "@/lib/gsap";
import { navigate } from "@/lib/navigate";
import { whenBooted } from "@/lib/signal";
import Plankton from "./Plankton";

/* Live circuit (right side): traces run in from the edge; comets travel them and light the end nodes. */
const TRACES: [string, [number, number]][] = [
  ["M600 90 H460 L420 130 H300", [300, 130]],
  ["M600 175 H500 L470 205 V260 L440 290 H360", [360, 290]],
  ["M600 330 H520 L480 370 H390", [390, 370]],
  ["M600 440 H470 L430 400 H330", [330, 400]],
  ["M600 520 H540 L500 480 V440 L470 410", [470, 410]],
  ["M520 0 V60 L480 100 V170", [480, 170]],
];

function HeroCircuit() {
  return (
    <div aria-hidden="true" className="hero-circuit pointer-events-none absolute right-0 top-1/2 hidden w-[44vw] max-w-[44rem] -translate-y-1/2 md:block">
      <svg viewBox="0 0 600 600" fill="none" strokeLinecap="round" strokeLinejoin="round" className="block w-full overflow-visible">
        <g className="stroke-fog/15" strokeWidth={1.25}>
          {TRACES.map(([d]) => (
            <path key={d} d={d} />
          ))}
        </g>
        {TRACES.map(([d]) => (
          <path key={d} className="hc-comet stroke-cyan" d={d} strokeWidth={2} opacity={0} style={{ filter: "drop-shadow(0 0 4px rgb(61 245 214 / 0.9))" }} />
        ))}
        {TRACES.map(([d, [x, y]]) => (
          <g key={d}>
            <circle cx={x} cy={y} r={6} className="fill-abyss stroke-fog/40" strokeWidth={1.25} />
            <circle className="hc-node fill-cyan" cx={x} cy={y} r={3.5} opacity={0} />
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function Hero({ hasResume, art }: { hasResume: boolean; art: string | null }) {
  const root = useRef<HTMLElement>(null);
  const [first, ...rest] = hero.name.split(" ");

  useGSAP(
    () => {
      const section = root.current!;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", (ctx) => {
        let cancelled = false;
        let intro: gsap.core.Timeline | undefined;
        let isBooted = false;

        // Built only once webfonts are in, so SplitText measures the real glyph widths.
        const build = () =>
          ctx.add(() => {
            // Split the inner words; the outer .hero-part wrappers stay free for the scroll exit.
            const name = SplitText.create(".hero-word", { type: "chars,lines", mask: "lines", linesClass: "split-mask" });
            const line = SplitText.create(".hero-line-text", { type: "words", mask: "words", wordsClass: "split-mask" });

            intro = gsap
              .timeline({
                paused: true,
                defaults: { ease: EASE.hero, duration: DUR.hero },
                // Hand the DOM back as plain text: accessible and free to reflow on resize.
                onComplete: () => {
                  name.revert();
                  line.revert();
                },
              })
              .from(".hero-bg", { opacity: 0, duration: 2.4, ease: EASE.enter }, 0)
              .from(".hero-eyebrow", { yPercent: 100, opacity: 0, duration: 1, ease: EASE.enter }, 0.1)
              .from(name.chars, { yPercent: 110, stagger: 0.035 }, 0.15)
              .from(line.words, { yPercent: 110, stagger: STAGGER.text * 2, duration: 1.2 }, 0.6)
              .to(".hero-accent", { "--draw": "100%", duration: 0.9, ease: EASE.move }, 1.25)
              .from(".hero-disciplines > li", { opacity: 0, y: 12, stagger: STAGGER.item, duration: 0.8, ease: EASE.enter }, 1.0)
              .from(".hero-cta", { opacity: 0, y: 24, stagger: 0.1, duration: 0.9, ease: EASE.enter }, 1.15)
              .from(".hero-cue", { opacity: 0, duration: 1, ease: EASE.enter }, 1.7)
              .from(".hero-circuit", { opacity: 0, duration: 1.6, ease: EASE.enter }, 0.9);

            if (isBooted) intro.play();
          });

        document.fonts.ready.then(() => {
          if (!cancelled) build();
        });
        const unsub = whenBooted(() => {
          isBooted = true;
          intro?.play();
        });

        // Live circuit: comets travel in from the edge, each lighting its node on arrival.
        const comets = gsap.utils.toArray<SVGPathElement>(".hc-comet");
        const nodes = gsap.utils.toArray<SVGCircleElement>(".hc-node");
        const pulse = gsap.timeline({ repeat: -1, repeatDelay: 0.6, paused: true });
        comets.forEach((comet, i) => {
          const at = i * 0.42;
          pulse
            .fromTo(comet, { drawSVG: "0% 14%", opacity: 0 }, { drawSVG: "86% 100%", opacity: 1, duration: 1.1, ease: "power1.in" }, at)
            .to(comet, { opacity: 0, duration: 0.2 }, at + 1.0)
            .fromTo(nodes[i], { opacity: 1, scale: 1.8, transformOrigin: "50% 50%" }, { opacity: 0.35, scale: 1, duration: 0.9, ease: EASE.enter }, at + 1.1);
        });
        ScrollTrigger.create({
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => pulse.paused(!self.isActive),
        });

        // Exit — "parting signal": the name parts, the copy lifts away, the plankton rushes up
        // (you're descending) and the artwork zooms in. Scrubbed, so fully reversible.
        // The hero holds (pins) for most of a screen while this plays, so the parting happens in view.
        const exit = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: section, start: "top top", end: "+=85%", pin: true, scrub: true, anticipatePin: 1 },
        });
        const parts = gsap.utils.toArray<HTMLElement>(".hero-part");
        exit
          .to(parts[0], { xPercent: -55, opacity: 0, ease: "power2.in" }, 0)
          .to(parts.slice(1), { xPercent: 55, opacity: 0, ease: "power2.in" }, 0)
          .to(".hero-cue-wrap", { opacity: 0, duration: 0.12 }, 0)
          .to(".hero-eyebrow", { opacity: 0, duration: 0.3 }, 0)
          .to([".hero-line", ".hero-disciplines", ".hero-ctas"], { y: -90, opacity: 0, duration: 0.5, stagger: 0.05 }, 0)
          .to(".hero-bg-layer", { yPercent: -20, scale: 1.4 }, 0)
          .to(".hero-circuit", { xPercent: 30, opacity: 0, duration: 0.6 }, 0);
        // Artwork is optional (public/images/hero-abyss.*) — only tween it when present.
        const artEl = section.querySelector(".hero-art");
        if (artEl) exit.to(artEl, { scale: 1.3, opacity: 0.15 }, 0);

        return () => {
          cancelled = true;
          unsub();
        };
      });

      // Decorative pieces drift with the pointer; the heading stays put.
      mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
        const cx = gsap.quickTo(".hero-circuit-drift", "x", { duration: 1.4, ease: EASE.enter });
        const cy = gsap.quickTo(".hero-circuit-drift", "y", { duration: 1.4, ease: EASE.enter });
        const ax = gsap.quickTo(".hero-art-drift", "x", { duration: 1.8, ease: EASE.enter });
        const ay = gsap.quickTo(".hero-art-drift", "y", { duration: 1.8, ease: EASE.enter });
        const move = (e: PointerEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          cx(nx * 36);
          cy(ny * 28);
          ax(nx * -18);
          ay(ny * -14);
        };
        window.addEventListener("pointermove", move, { passive: true });
        return () => window.removeEventListener("pointermove", move);
      });

      mm.add(MQ.reduced, () => {
        gsap.set(".hero-accent", { "--draw": "100%" });
        gsap.set(".hc-node", { opacity: 0.6 });
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="prologue"
      aria-labelledby="prologue-title"
      data-chapter="0"
      // No overflow clipping on the pinned section itself (Chrome reports a pinned, overflow-clipped
      // element as a layout shift); the decorative layers clip themselves.
      className="relative flex min-h-svh flex-col"
    >
      <div className="hero-bg absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="hero-art-drift absolute -inset-6">
          <Art src={art} slot="hero-abyss" priority className="hero-art art-screen absolute inset-0 opacity-45" />
        </div>
        <div className="hero-bg-layer absolute inset-0">
          <Plankton />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_110%,rgb(61_245_214/0.07),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,transparent_40%,rgb(4_7_13/0.85))]" />
      </div>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="hero-circuit-drift absolute inset-0">
          <HeroCircuit />
        </div>
      </div>

      <div className="hero-inner shell relative flex flex-1 flex-col justify-center pb-36 pt-32">
        <p className="hero-eyebrow label text-fog">
          <span className="text-cyan">00</span>&ensp;—&ensp;{hero.eyebrow}
        </p>

        <h1 id="prologue-title" className="hero-name mt-6 font-display text-hero font-extrabold text-mist">
          <span className="hero-part inline-block">
            <span className="hero-word inline-block">{first}</span>
          </span>{" "}
          <span className="hero-part inline-block">
            <span className="hero-word inline-block">{rest.join(" ")}</span>
          </span>
        </h1>

        <p className="hero-line mt-6 max-w-4xl font-display text-title font-bold text-mist md:mt-8">
          <span className="hero-line-text">
            {hero.line.before}
            <em className="hero-accent pulse-accent font-serif font-normal text-cyan glow-cyan">{hero.line.accent}</em>
            {hero.line.after}
          </span>
        </p>

        <ul className="hero-disciplines label mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-fog" aria-label="Disciplines">
          {hero.disciplines.map((d, i) => (
            <li key={d} className="flex items-center gap-3">
              {i > 0 && <span aria-hidden="true" className="size-1 rounded-full bg-fog/50" />}
              {d}
            </li>
          ))}
        </ul>

        <div className="hero-ctas mt-12 flex flex-wrap items-center gap-4">
          <Magnetic>
            <a
              href={hero.ctas.primary.href}
              data-cursor="link"
              onClick={(e) => {
                e.preventDefault();
                navigate(hero.ctas.primary.href);
              }}
              className="hero-cta btn-lift group inline-flex items-center gap-3 rounded-full border border-cyan/60 bg-cyan/10 px-7 py-4 text-mist transition-colors duration-500 ease-enter hover:bg-cyan hover:text-abyss"
            >
              <span data-magnetic-inner className="inline-flex items-center gap-3">
                <span className="font-sans text-sm font-semibold tracking-wide">{hero.ctas.primary.label}</span>
                <span aria-hidden="true" className="transition-transform duration-500 ease-enter group-hover:translate-x-1">
                  →
                </span>
              </span>
            </a>
          </Magnetic>
          {hasResume && (
            <Magnetic>
              <a
                href={hero.ctas.secondary.href}
                download
                data-cursor="link"
                className="hero-cta btn-lift group inline-flex items-center gap-3 rounded-full border border-fog/30 px-7 py-4 text-fog transition-colors duration-500 ease-enter hover:border-mist hover:text-mist"
              >
                <span data-magnetic-inner className="inline-flex items-center gap-3">
                  <span className="font-sans text-sm font-semibold tracking-wide">{hero.ctas.secondary.label}</span>
                  <span aria-hidden="true" className="transition-transform duration-500 ease-enter group-hover:translate-y-0.5">
                    ↓
                  </span>
                </span>
              </a>
            </Magnetic>
          )}
        </div>
      </div>

      <div className="hero-cue-wrap absolute inset-x-0 bottom-8 flex justify-center">
        <a
          href="#curiosity"
          data-cursor="link"
          onClick={(e) => {
            e.preventDefault();
            navigate("#curiosity");
          }}
          className="hero-cue flex flex-col items-center gap-3 p-2 text-fog transition-colors duration-500 hover:text-mist"
        >
          <span className="label">{hero.scrollCue}</span>
          <span aria-hidden="true" className="relative h-12 w-px overflow-hidden bg-fog/20">
            <span className="scroll-cue-dot absolute inset-x-0 top-0 h-1/3 bg-cyan" />
          </span>
        </a>
      </div>
    </section>
  );
}
