"use client";

import { useRef, useState } from "react";
import { preloader } from "@/data/content";
import { EASE, gsap, MQ, useGSAP } from "@/lib/gsap";
import { lockScroll } from "@/lib/lenis";
import { booted } from "@/lib/signal";

/*
 * BOOT — flatline draws, waits for fonts + window load, one heartbeat spike,
 * then the screen splits open along the line to reveal the hero.
 *
 * Line geometry is built in real pixels (viewBox width = viewport width) so the
 * spike keeps its shape on every screen and DrawSVG can measure it.
 * Baseline y=120 is aligned to the seam between the two curtain halves.
 */
const H = 160;
function segments(w: number): string[] {
  const o = w / 2 - 510; // spike's R-peak sits at the horizontal centre
  const x = (n: number) => +(n + o).toFixed(1);
  return [
    `M0 120 H${x(430)} C${x(438)} 120 ${x(442)} 112 ${x(450)} 112 C${x(458)} 112 ${x(462)} 120 ${x(470)} 120 H${x(478)}`,
    `M${x(478)} 120 L${x(486)} 132 L${x(498)} 18 L${x(510)} 150 L${x(518)} 120 H${x(534)} C${x(546)} 120 ${x(550)} 104 ${x(562)} 104 C${x(574)} 104 ${x(578)} 120 ${x(590)} 120`,
    `M${x(590)} 120 H${w}`,
  ];
}
const SSR_W = 1000;

/** Set once the boot has played; layout.tsx's inline script reads it before first paint. */
export const SESSION_KEY = "signal:booted";
function seenThisSession() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

function pageLoaded() {
  const load =
    document.readyState === "complete"
      ? Promise.resolve()
      : new Promise<void>((r) => window.addEventListener("load", () => r(), { once: true }));
  const timeout = new Promise<void>((r) => setTimeout(r, 4000));
  return Promise.race([Promise.all([document.fonts.ready, load]), timeout]);
}

export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useGSAP(
    () => {
      const el = root.current!;
      const mm = gsap.matchMedia();

      mm.add({ motion: "(prefers-reduced-motion: no-preference)", reduced: MQ.reduced }, (ctx) => {
        // Already booted (HMR, reduced motion, or a repeat visit this tab session): never replay.
        if (booted.get() || ctx.conditions!.reduced || seenThisSession()) {
          gsap.set(el, { display: "none" });
          booted.set(true);
          setDone(true);
          return;
        }

        window.scrollTo(0, 0);
        lockScroll(true);

        const q = gsap.utils.selector(el);
        const counter = q(".pl-count")[0] as HTMLElement;
        const status = q(".pl-status")[0] as HTMLElement;
        const count = { v: 0 };
        const renderCount = () => {
          counter.textContent = String(Math.round(count.v)).padStart(3, "0");
        };
        const setStatus = (i: number) => () => {
          status.textContent = preloader.status[i];
        };

        let ready = false;
        const readyPromise = pageLoaded().then(() => {
          ready = true;
        });

        const svg = el.querySelector<SVGSVGElement>("svg")!;
        const w = Math.round(svg.clientWidth) || window.innerWidth;
        svg.setAttribute("viewBox", `0 0 ${w} ${H}`);
        segments(w).forEach((d, i) => q(`.pl-seg-${i}`).forEach((p) => p.setAttribute("d", d)));
        const seg = (i: number) => q(`.pl-seg-${i}`);

        const tl = gsap.timeline({ defaults: { ease: "none" } });
        tl.set(q(".pl-lit"), { opacity: 0 })
          .call(setStatus(0))
          .fromTo(seg(0), { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.55, ease: "power1.inOut" }, 0)
          .to(count, { v: 72, duration: 0.55, ease: "power1.inOut", onUpdate: renderCount }, 0)
          .call(setStatus(1), [], 0.3)
          // Hold the flatline until the page can actually render the story.
          .call(() => {
            if (ready) return;
            tl.pause();
            readyPromise.then(() => tl.play());
          })
          .addLabel("beat")
          .fromTo(seg(1), { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.22, ease: "power2.in" }, "beat")
          .to(count, { v: 100, duration: 0.22, ease: "power2.in", onUpdate: renderCount }, "beat")
          // The first signal: line comes alive in cyan, a soft flash at the R-peak.
          .to(q(".pl-lit"), { opacity: 1, duration: 0.1, ease: EASE.enter }, "beat+=0.12")
          .to(q(".pl-flash"), { opacity: 1, duration: 0.06 }, "beat+=0.12")
          .to(q(".pl-flash"), { opacity: 0, duration: 0.7, ease: EASE.enter }, ">")
          .call(setStatus(2), [], "beat+=0.12")
          .fromTo(seg(2), { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.28, ease: "power2.out" }, "beat+=0.22")
          .addLabel("split", ">+0.1")
          .call(
            () => {
              booted.set(true);
              lockScroll(false);
              try {
                sessionStorage.setItem(SESSION_KEY, "1");
              } catch {}
            },
            [],
            "split",
          )
          .to(q(".pl-hud"), { opacity: 0, duration: 0.2, ease: EASE.move }, "split")
          .to(q(".pl-seam"), { opacity: 1, duration: 0.15 }, "split")
          .to(q(".pl-top"), { yPercent: -100, duration: 0.8, ease: EASE.move }, "split")
          .to(q(".pl-bottom"), { yPercent: 100, duration: 0.8, ease: EASE.move }, "split")
          .set(el, { display: "none" })
          .call(() => setDone(true));

        return () => lockScroll(false);
      });
    },
    { scope: root },
  );

  // Hidden until DrawSVG takes over, so the full line never flashes before hydration.
  const lines = segments(SSR_W).map((d, i) => (
    <path key={i} className={`pl-seg-${i}`} d={d} style={{ strokeDasharray: "0 100000" }} />
  ));

  return (
    <>
      <div
        ref={root}
        className="preloader fixed inset-0 overflow-hidden"
        style={{ zIndex: "var(--z-preloader)" }}
        aria-hidden="true"
      >
        {/* Lower curtain (behind) */}
        <div className="pl-bottom absolute inset-x-0 bottom-0 h-1/2 bg-abyss">
          <div className="pl-seam absolute inset-x-0 top-0 h-px bg-cyan/60 opacity-0" />
          <div className="pl-hud shell flex items-start justify-between pt-6">
            <p className="label text-fog">
              <span className="text-cyan">●</span> <span className="pl-status">{preloader.status[0]}</span>
            </p>
            <p className="font-mono text-title leading-none tabular-nums text-mist">
              <span className="pl-count">000</span>
            </p>
          </div>
        </div>

        {/* Upper curtain (in front) — carries the heartbeat */}
        <div className="pl-top absolute inset-x-0 top-0 z-10 h-1/2 bg-abyss">
          <div className="pl-flash pointer-events-none absolute inset-x-0 -bottom-1/2 h-full bg-[radial-gradient(ellipse_at_50%_50%,rgb(61_245_214/0.14),transparent_60%)] opacity-0" />
          <p className="pl-hud label shell absolute inset-x-0 top-6 text-fog">Every system starts with a signal</p>
          <svg
            className="absolute inset-x-0 -bottom-10 h-40 w-full overflow-visible"
            viewBox={`0 0 ${SSR_W} ${H}`}
            preserveAspectRatio="xMidYMax slice"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <g className="stroke-fog/40" strokeWidth={1.5}>
              {lines}
            </g>
            <g className="pl-lit stroke-cyan" strokeWidth={2} style={{ filter: "drop-shadow(0 0 6px rgb(61 245 214 / 0.7))" }}>
              {lines}
            </g>
          </svg>
        </div>
      </div>

      <p role="status" className="sr-only">
        {done ? preloader.doneAnnouncement : "Loading"}
      </p>
    </>
  );
}
