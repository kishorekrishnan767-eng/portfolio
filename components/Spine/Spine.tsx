"use client";

import { useRef } from "react";
import { EASE, gsap, MQ, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { chapters } from "@/data/content";
import { activeChapter, whenBooted } from "@/lib/signal";

type Pt = [number, number];

const PAD_TOP = 104; // clears the nav bar
const PAD_BOTTOM = 40;
const SVG_NS = "http://www.w3.org/2000/svg";

/** One vertical ECG complex (P, QRS, T), swinging right of the baseline by `a`. Returns points + height. */
function blip(cx: number, y: number, a: number, k: number): Pt[] {
  return [
    [cx, y],
    [cx + 0.3 * a, y + 4 * k],
    [cx, y + 8 * k],
    [cx, y + 11 * k],
    [cx - 0.35 * a, y + 13 * k],
    [cx + a, y + 18 * k],
    [cx - 0.6 * a, y + 24 * k],
    [cx, y + 27 * k],
    [cx, y + 31 * k],
    [cx + 0.35 * a, y + 36 * k],
    [cx, y + 41 * k],
  ];
}
const BLIP_UNITS = 41;

/**
 * The SIGNAL spine: a fixed ECG line in the left gutter whose drawn length tracks
 * total page progress. One blip per chapter ([data-chapter] sections), amplitude
 * growing as the story deepens; the dot rides the draw head via MotionPath.
 */
export default function Spine() {
  const root = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const svg = root.current!;
      const line = svg.querySelector<SVGPathElement>(".spine-line")!;
      const glow = svg.querySelector<SVGPathElement>(".spine-glow")!;
      const dot = svg.querySelector<SVGGElement>(".spine-dot")!;
      const dotScale = svg.querySelector<SVGGElement>(".spine-dot-scale")!;
      const nodeLayer = svg.querySelector<SVGGElement>(".spine-nodes")!;

      // Geometry, rebuilt on every ScrollTrigger refresh.
      let pts: Pt[] = [];
      let cum: number[] = [];
      let total = 1;
      let blipStart: number[] = []; // path length where each chapter blip begins
      let firstBlipEnd = 0;
      let yTop = PAD_TOP;
      let ySpan = 1;
      let nodes: SVGCircleElement[] = [];
      let lit: boolean[] = [];

      const build = () => {
        const w = svg.clientWidth;
        const h = svg.clientHeight;
        svg.setAttribute("viewBox", `0 0 ${w} ${h}`);

        const cx = w / 2;
        const aMin = w * 0.12;
        const aMax = w * 0.36;
        const k = w < 32 ? 0.75 : 1;
        const blipH = BLIP_UNITS * k;
        yTop = PAD_TOP;
        ySpan = Math.max(1, h - PAD_TOP - PAD_BOTTOM - blipH);

        const sections = gsap.utils.toArray<HTMLElement>("[data-chapter]");
        const max = ScrollTrigger.maxScroll(window) || 1;
        const n = sections.length;

        pts = [[cx, 0]];
        const starts: number[] = [];
        let floor = 0;
        sections.forEach((s, i) => {
          const prog = gsap.utils.clamp(0, 1, (s.getBoundingClientRect().top + window.scrollY) / max);
          const y = Math.max(yTop + prog * ySpan, floor);
          const a = aMin + (aMax - aMin) * (n > 1 ? i / (n - 1) : 0);
          starts.push(pts.length);
          pts.push(...blip(cx, y, a, k));
          floor = y + blipH + 6;
        });
        pts.push([cx, h]);

        // Cumulative polyline length — exact for straight segments, so it matches getTotalLength().
        cum = [0];
        for (let i = 1; i < pts.length; i++) {
          cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
        }
        total = cum[cum.length - 1] || 1;
        blipStart = starts.map((i) => cum[i]);
        firstBlipEnd = starts.length ? cum[starts[0] + 10] : 0;

        const d = "M" + pts.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join(" L");
        line.setAttribute("d", d);
        glow.setAttribute("d", d);

        // Chapter beads, sitting just above each blip.
        nodeLayer.replaceChildren();
        nodes = starts.map((i) => {
          const c = document.createElementNS(SVG_NS, "circle");
          c.setAttribute("cx", String(cx));
          c.setAttribute("cy", String(pts[i][1] - 7));
          c.setAttribute("r", w < 32 ? "1.75" : "2.5");
          c.setAttribute("class", "spine-node");
          nodeLayer.appendChild(c);
          return c;
        });
        lit = nodes.map(() => false);
      };

      /** Path length at which the polyline reaches viewport-y `y` (y is monotonic along the path). */
      const lengthAtY = (y: number) => {
        for (let i = 1; i < pts.length; i++) {
          if (pts[i][1] >= y) {
            const [, y0] = pts[i - 1];
            const [, y1] = pts[i];
            const t = y1 === y0 ? 1 : (y - y0) / (y1 - y0);
            return cum[i - 1] + (cum[i] - cum[i - 1]) * t;
          }
        }
        return total;
      };

      // Epilogue: the pulse stops climbing and settles into a steady beat.
      const unsubSteady = activeChapter.subscribe((i) => svg.classList.toggle("spine-steady", i === chapters.length - 1));

      const mm = gsap.matchMedia();

      mm.add({ motion: "(prefers-reduced-motion: no-preference)", reduced: MQ.reduced }, (ctx) => {
        build();

        if (ctx.conditions!.reduced) {
          // Static: the whole signal, softly lit. No scrub, no dot.
          gsap.set([line, glow], { drawSVG: "100%" });
          gsap.set(glow, { opacity: 0.3 });
          gsap.set(dot, { autoAlpha: 0 });
          const relayout = () => {
            build();
            gsap.set([line, glow], { drawSVG: "100%" });
          };
          ScrollTrigger.addEventListener("refresh", relayout);
          return () => ScrollTrigger.removeEventListener("refresh", relayout);
        }

        const intro = { v: 0 };
        let progress = 0;
        let dotPath: gsap.core.Tween;

        const makeDotPath = () => {
          dotPath?.kill();
          dotPath = gsap.to(dot, { motionPath: { path: line }, ease: "none", paused: true });
        };

        const render = () => {
          const head = intro.v * Math.max(firstBlipEnd, lengthAtY(yTop + progress * ySpan));
          const frac = head / total;
          gsap.set([line, glow], { drawSVG: `0 ${frac * 100}%` });
          dotPath.progress(frac);
          // Intensity rises as chapters complete.
          gsap.set(glow, { opacity: intro.v * (0.18 + 0.62 * progress) });
          gsap.set(dotScale, { scale: 1 + progress * 0.6 });
          nodes.forEach((node, i) => {
            const on = head >= blipStart[i] - 1;
            if (on !== lit[i]) {
              lit[i] = on;
              node.classList.toggle("is-lit", on);
            }
          });
        };

        makeDotPath();
        gsap.set(dot, { autoAlpha: 0 });
        gsap.set(dotScale, { transformOrigin: "50% 50%" });

        const st = ScrollTrigger.create({
          start: 0,
          end: "max",
          onUpdate: (self) => {
            progress = self.progress;
            render();
          },
        });

        const relayout = () => {
          build();
          makeDotPath();
          progress = st.progress;
          render();
        };
        ScrollTrigger.addEventListener("refresh", relayout);
        render();

        // Boot: the signal arrives from the top and settles into the hero's heartbeat.
        const unsub = whenBooted(() => {
          gsap.to(intro, { v: 1, duration: 1.8, delay: 0.5, ease: EASE.hero, onUpdate: render });
          gsap.to(dot, { autoAlpha: 1, duration: 0.6, delay: 0.9, ease: EASE.enter });
        });

        return () => {
          unsub();
          dotPath?.kill();
          ScrollTrigger.removeEventListener("refresh", relayout);
        };
      });

      return unsubSteady;
    },
    { scope: root },
  );

  return (
    <svg
      ref={root}
      aria-hidden="true"
      className="pointer-events-none fixed inset-y-0 left-0 h-full overflow-visible"
      style={{ width: "var(--gutter)", zIndex: "var(--z-spine)" }}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        <filter id="spine-blur" x="-200%" y="-10%" width="500%" height="120%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
      {/* Hidden until GSAP draws it, so the full path never flashes before hydration. */}
      <path className="spine-glow stroke-cyan" strokeWidth={4} filter="url(#spine-blur)" opacity={0} />
      <path className="spine-line stroke-cyan" strokeWidth={1.25} style={{ strokeDasharray: "0 100000" }} />
      <g className="spine-nodes" />
      <g className="spine-dot">
        <g className="spine-dot-scale">
          <circle className="spine-dot-halo fill-cyan" r={8} opacity={0.22} />
          <circle className="fill-mist" r={2.75} />
        </g>
      </g>
    </svg>
  );
}
