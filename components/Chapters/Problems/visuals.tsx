"use client";

import type { Project } from "@/data/content";
import { EASE, gsap } from "@/lib/gsap";

/*
 * Micro-stories for Chapter III. Each visual is a 400×400 inline SVG; its `story` builder
 * returns a paused timeline that the chapter scrubs with scroll (fully reversible),
 * plus an optional ambient `loop` that only runs while the scene is on screen.
 */

export interface Story {
  story: gsap.core.Timeline;
  loop?: gsap.core.Timeline;
  /** Reduced motion: put the scene in its final, readable state. */
  still: () => void;
}

const svgProps = {
  viewBox: "0 0 400 400",
  fill: "none",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "pr-visual size-full overflow-visible",
  "aria-hidden": true,
};

/* ─────────────────────────── SPARKSENSE — risk gauge ─────────────────────────── */

const G = { cx: 200, cy: 215, r: 150, from: -120, to: 120, threshold: 60, end: 78 };

/** Degrees measured clockwise from 12 o'clock. */
function polar(r: number, deg: number): [number, number] {
  const rad = (deg * Math.PI) / 180;
  return [+(G.cx + r * Math.sin(rad)).toFixed(2), +(G.cy - r * Math.cos(rad)).toFixed(2)];
}
function arc(r: number, a0: number, a1: number) {
  const [x0, y0] = polar(r, a0);
  const [x1, y1] = polar(r, a1);
  return `M${x0} ${y0} A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`;
}
const TICKS = Array.from({ length: (G.to - G.from) / 10 + 1 }, (_, i) => G.from + i * 10);

function SparkGauge({ project }: { project: Project }) {
  const [tx, ty] = polar(G.r + 22, G.threshold);
  return (
    <svg {...svgProps}>
      <defs>
        <radialGradient id="sg-flash-grad">
          <stop offset="0%" stopColor="var(--color-amber)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--color-amber)" stopOpacity="0" />
        </radialGradient>
        <filter id="sg-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      <circle className="sg-flash" cx={G.cx} cy={G.cy} r={200} fill="url(#sg-flash-grad)" opacity={0} />

      <path d={arc(G.r, G.from, G.to)} className="stroke-fog/25" strokeWidth={2} />
      <path className="sg-danger-glow stroke-amber" d={arc(G.r, G.threshold, G.to)} strokeWidth={10} filter="url(#sg-blur)" opacity={0} />
      <path d={arc(G.r, G.threshold, G.to)} className="stroke-amber" strokeWidth={5} opacity={0.55} />

      {TICKS.map((a) => {
        const [x0, y0] = polar(G.r - 14, a);
        const [x1, y1] = polar(G.r - (a % 30 === 0 ? 28 : 21), a);
        return (
          <line
            key={a}
            x1={x0}
            y1={y0}
            x2={x1}
            y2={y1}
            className={a >= G.threshold ? "stroke-amber/70" : "stroke-fog/40"}
            strokeWidth={a % 30 === 0 ? 1.5 : 1}
          />
        );
      })}
      <text x={tx} y={ty} className="fill-amber font-mono text-[10px] tracking-[0.18em]">
        THRESHOLD
      </text>

      {[0, 1].map((i) => (
        <circle key={i} className="sg-ripple stroke-amber" cx={G.cx} cy={G.cy} r={G.r} strokeWidth={1.5} opacity={0} />
      ))}

      <g className="sg-needle">
        <line x1={G.cx} y1={G.cy + 18} x2={G.cx} y2={G.cy - 128} className="stroke-mist" strokeWidth={2.5} />
      </g>
      <circle cx={G.cx} cy={G.cy} r={8} className="fill-abyss stroke-mist" strokeWidth={2} />

      <text x={G.cx} y={292} textAnchor="middle" className="fill-fog font-mono text-[10px] tracking-[0.2em] uppercase">
        {project.scene.readout}
      </text>
      <text x={G.cx} y={332} textAnchor="middle" className="sg-value fill-mist font-display text-[36px] font-extrabold">
        0.00
      </text>

      <g className="sg-alert" opacity={0}>
        <rect x={70} y={22} width={260} height={30} rx={15} className="fill-amber/15 stroke-amber" strokeWidth={1} />
        <text x={200} y={41} textAnchor="middle" className="fill-amber font-mono text-[10px] tracking-[0.16em] uppercase">
          {project.scene.alert}
        </text>
      </g>
    </svg>
  );
}

function sparkStory(root: Element): Story {
  const q = gsap.utils.selector(root);
  const needle = q(".sg-needle");
  const value = q(".sg-value")[0];
  const origin = `${G.cx} ${G.cy}`;
  gsap.set(needle, { svgOrigin: origin, rotation: G.from });

  const readValue = () => {
    const rot = Number(gsap.getProperty(needle[0], "rotation"));
    value.textContent = ((rot - G.from) / (G.to - G.from)).toFixed(2);
  };

  // power1.in → the needle crawls, then accelerates into danger. Crossing time ≈ √(fraction).
  const cross = Math.sqrt((G.threshold - G.from) / (G.end - G.from));
  const story = gsap
    .timeline({ paused: true, defaults: { ease: EASE.enter } })
    .to(needle, { rotation: G.end, svgOrigin: origin, duration: 1, ease: "power1.in", onUpdate: readValue }, 0)
    .to(q(".sg-danger-glow"), { opacity: 0.9, duration: 0.08 }, cross)
    .fromTo(q(".sg-flash"), { opacity: 0 }, { opacity: 1, duration: 0.05 }, cross)
    .to(q(".sg-flash"), { opacity: 0, duration: 0.35 }, cross + 0.05)
    .fromTo(
      q(".sg-ripple"),
      { scale: 0.55, opacity: 0.9, transformOrigin: "50% 50%" },
      { scale: 1.45, opacity: 0, duration: 0.45, stagger: 0.12 },
      cross,
    )
    .to(value, { fill: "#ffb547", duration: 0.05 }, cross)
    .fromTo(q(".sg-alert"), { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.15 }, cross + 0.04);

  return { story, still: () => story.progress(1) };
}

/* ─────────────────────── WOMEN SAFETY BAND — live ECG ─────────────────────── */

const ECG =
  "M78 200 H122 L130 200 L136 192 L142 200 L150 200 L155 208 L162 148 L169 224 L175 200 L188 200 Q196 186 204 200 H230 L236 192 L242 200 L248 200 L253 208 L260 148 L267 224 L273 200 L286 200 Q294 186 302 200 H322";

function PulseBand({ project }: { project: Project }) {
  return (
    <svg {...svgProps}>
      <defs>
        <clipPath id="pb-face">
          <circle cx={200} cy={200} r={118} />
        </clipPath>
      </defs>

      {/* Strap */}
      <rect x={148} y={6} width={104} height={88} rx={22} className="fill-trench stroke-violet/30" />
      <rect x={148} y={306} width={104} height={88} rx={22} className="fill-trench stroke-violet/30" />

      {[0, 1, 2].map((i) => (
        <circle key={i} className="pb-ring stroke-cyan" cx={200} cy={200} r={132} strokeWidth={1.5} opacity={0} />
      ))}

      <circle cx={200} cy={200} r={132} className="fill-navy stroke-violet/60" strokeWidth={2} />
      <circle className="pb-sos fill-violet" cx={200} cy={92} r={4.5} opacity={0.35} />

      <text x={200} y={140} textAnchor="middle" className="fill-fog font-mono text-[10px] tracking-[0.2em] uppercase">
        {project.scene.readout}
      </text>

      <g clipPath="url(#pb-face)">
        <path d={ECG} className="stroke-violet/15" strokeWidth={2} />
        <path className="pb-ecg stroke-violet" d={ECG} strokeWidth={2.5} style={{ filter: "drop-shadow(0 0 5px rgb(139 92 255 / 0.8))" }} />
      </g>

      <text x={200} y={276} textAnchor="middle" className="fill-mist font-display text-[34px] font-extrabold">
        <tspan className="pb-bpm">72</tspan>
        <tspan dx={6} className="fill-fog font-mono text-[11px] font-normal tracking-[0.18em]">
          BPM
        </tspan>
      </text>

      <g className="pb-alert" opacity={0}>
        <rect x={80} y={358} width={240} height={30} rx={15} className="fill-cyan/15 stroke-cyan" strokeWidth={1} />
        <text x={200} y={377} textAnchor="middle" className="fill-cyan font-mono text-[10px] tracking-[0.16em] uppercase">
          {project.scene.alert}
        </text>
      </g>
    </svg>
  );
}

function bandStory(root: Element): Story {
  const q = gsap.utils.selector(root);
  const ecg = q(".pb-ecg");
  const bpmEl = q(".pb-bpm")[0];

  // Monitor sweep: draw left→right, then let the tail catch up. Runs while on screen.
  const loop = gsap
    .timeline({ repeat: -1, paused: true })
    .fromTo(ecg, { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", duration: 1.4, ease: "none" })
    .to(ecg, { drawSVG: "100% 100%", duration: 0.5, ease: "none" });

  const bpm = { v: 72 };
  const story = gsap
    .timeline({ paused: true, defaults: { ease: EASE.enter } })
    // Distress: heart rate climbs and the monitor speeds up with it.
    .to(bpm, {
      v: 128,
      duration: 0.65,
      ease: "power2.in",
      onUpdate: () => {
        bpmEl.textContent = String(Math.round(bpm.v));
        loop.timeScale(bpm.v / 72);
      },
    })
    .to(q(".pb-sos"), { opacity: 1, fill: "#3df5d6", duration: 0.05 }, 0.62)
    // Alert sent: rings ripple outward.
    .fromTo(
      q(".pb-ring"),
      { scale: 1, opacity: 0.9, transformOrigin: "50% 50%" },
      { scale: 2.1, opacity: 0, duration: 0.45, stagger: 0.1, ease: "power2.out" },
      0.65,
    )
    .fromTo(q(".pb-alert"), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.15 }, 0.72);

  return {
    story,
    loop,
    still: () => {
      story.progress(1);
      gsap.set(ecg, { drawSVG: "100%" });
    },
  };
}

/* ─────────────────────────── GREEN ATM — bottle → leaf ─────────────────────────── */

const BOTTLE =
  "M188 100 H212 V116 C212 124 218 130 225 138 C235 149 240 162 240 176 V284 C240 293 233 300 224 300 H176 C167 300 160 293 160 284 V176 C160 162 165 149 175 138 C182 130 188 124 188 116 Z";
const LEAF =
  "M200 300 C156 268 140 214 156 166 C170 126 198 104 246 96 C256 150 252 210 228 252 C218 272 208 288 200 300 Z";
const MIDRIB = "M200 300 C208 240 222 170 246 96";

function GreenAtm({ project }: { project: Project }) {
  return (
    <svg {...svgProps}>
      {/* Machine */}
      <rect x={110} y={56} width={180} height={284} rx={26} className="fill-navy/60 stroke-fog/20" strokeWidth={1.5} />
      <line x1={165} y1={78} x2={235} y2={78} className="stroke-leaf/60" strokeWidth={3} />

      <path className="ga-shape stroke-mist" d={BOTTLE} strokeWidth={2.5} fill="rgba(82,242,160,0)" />
      <path className="ga-midrib stroke-leaf" d={MIDRIB} strokeWidth={1.5} style={{ strokeDasharray: "0 100000" }} />
      <line className="ga-scan stroke-cyan" x1={140} y1={100} x2={260} y2={100} strokeWidth={1.5} opacity={0} style={{ filter: "drop-shadow(0 0 6px rgb(61 245 214 / 0.9))" }} />

      {[0, 1, 2].map((i) => (
        <text key={i} x={262 + i * 14} y={210 - i * 22} className="ga-plus fill-leaf font-mono text-[13px] font-medium" opacity={0}>
          +5
        </text>
      ))}

      <g className="ga-accepted" opacity={0}>
        <rect x={110} y={14} width={180} height={28} rx={14} className="fill-cyan/15 stroke-cyan" strokeWidth={1} />
        <text x={200} y={32} textAnchor="middle" className="fill-cyan font-mono text-[10px] tracking-[0.16em] uppercase">
          {project.scene.alert}
        </text>
      </g>

      <text x={200} y={366} textAnchor="middle" className="fill-fog font-mono text-[10px] tracking-[0.2em] uppercase">
        {project.scene.readout}
      </text>
      <text x={200} y={398} textAnchor="middle" className="ga-credits fill-mist font-display text-[30px] font-extrabold">
        000
      </text>
    </svg>
  );
}

function atmStory(root: Element): Story {
  const q = gsap.utils.selector(root);
  const shape = q(".ga-shape");
  const creditsEl = q(".ga-credits")[0];
  const credits = { v: 0 };

  const story = gsap
    .timeline({ paused: true, defaults: { ease: EASE.enter } })
    .fromTo(shape, { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.32, ease: EASE.move })
    // Scan
    .fromTo(q(".ga-scan"), { y: 0, opacity: 0 }, { y: 200, opacity: 1, duration: 0.26, ease: "none" }, 0.3)
    .to(q(".ga-scan"), { opacity: 0, duration: 0.04 }, 0.56)
    .fromTo(q(".ga-accepted"), { opacity: 0, y: -6 }, { opacity: 1, y: 0, duration: 0.1 }, 0.55)
    // Plastic becomes a leaf
    .set(shape, { strokeDasharray: "none" }, 0.6)
    .to(shape, { morphSVG: LEAF, stroke: "#52f2a0", fill: "rgba(82,242,160,0.12)", duration: 0.28, ease: EASE.move }, 0.6)
    .fromTo(q(".ga-midrib"), { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.14 }, 0.84)
    // Reward
    .to(
      credits,
      {
        v: 50,
        duration: 0.36,
        ease: "power1.out",
        snap: { v: 5 },
        onUpdate: () => {
          creditsEl.textContent = String(credits.v).padStart(3, "0");
        },
      },
      0.62,
    )
    .fromTo(q(".ga-plus"), { opacity: 0, y: 10 }, { opacity: 1, y: -14, duration: 0.12, stagger: 0.08 }, 0.64)
    .to(q(".ga-plus"), { opacity: 0, duration: 0.1, stagger: 0.08 }, 0.78);

  return { story, still: () => story.progress(1) };
}

/* ─────────────────────────────────── registry ─────────────────────────────────── */

export const VISUALS: Record<string, { Visual: (p: { project: Project }) => React.JSX.Element; build: (root: Element) => Story }> = {
  sparksense: { Visual: SparkGauge, build: sparkStory },
  "women-safety-band": { Visual: PulseBand, build: bandStory },
  "green-atm": { Visual: GreenAtm, build: atmStory },
};
