"use client";

import { useRef } from "react";
import Magnetic from "@/components/ui/Magnetic";
import { chapters, skills } from "@/data/content";
import { DUR, EASE, gsap, MQ, type MQConditions, ScrollTrigger, STAGGER, useGSAP } from "@/lib/gsap";
import { deferSetup } from "@/lib/schedule";
import { fadeIn, revealText } from "@/lib/reveal";
import Seam from "@/components/Seam";
import Kicker from "./Kicker";

const chapter = chapters[2];
/** Marquee cruising speed, px per second. */
const SPEED = 70;

function MarqueeRow({ items, outline = false }: { items: readonly string[]; outline?: boolean }) {
  // Each half holds the list twice so one half always overflows the widest viewport.
  const half = [...items, ...items];
  return (
    <div className="wb-row overflow-hidden py-[0.06em]">
      <div className="wb-skew">
        <div className="wb-track flex w-max will-change-transform">
          {[0, 1].map((h) => (
            <div key={h} className="flex shrink-0 items-center">
              {half.map((item, i) => (
                <span key={`${h}-${i}`} className="flex items-center">
                  <span
                    className={`px-[0.3em] font-display text-display font-extrabold whitespace-nowrap ${
                      outline && i % 2 === 0 ? "text-outline" : "text-mist"
                    }`}
                  >
                    {item}
                  </span>
                  <span aria-hidden="true" className="size-[0.6rem] shrink-0 rounded-full bg-fog/30 md:size-3" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Oscilloscope behind the marquees: two periodic waves; each track half holds whole periods,
   so a -50% loop is seamless. */
const WAVE_W = 2400;
function wave(period: number, amp: number, mid = 100) {
  let d = `M0 ${mid} Q${period / 4} ${mid - amp} ${period / 2} ${mid}`;
  for (let x = period; x <= WAVE_W; x += period / 2) d += ` T${x} ${mid}`;
  return d;
}
const WAVE_A = wave(200, 36);
const WAVE_B = wave(300, 20);

function Scope() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -inset-y-20">
      <div className="wb-grid absolute inset-0" />
      <div className="absolute inset-x-0 top-1/2 h-48 -translate-y-1/2 overflow-hidden">
        {/* Both layers are promoted: drift (x) and amplitude (scaleY) never repaint the SVG. */}
        <div className="wb-wave-amp h-full will-change-transform">
        <div className="wb-wave-track h-full w-[200%] will-change-transform">
          <svg className="size-full" viewBox={`0 0 ${WAVE_W} 200`} preserveAspectRatio="none" fill="none">
            <line x1={0} y1={100} x2={WAVE_W} y2={100} className="stroke-fog/10" vectorEffect="non-scaling-stroke" />
            <g className="wb-wave">
              <path d={WAVE_A} className="stroke-cyan/35" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
              <path d={WAVE_B} className="stroke-violet/35" strokeWidth={1.25} vectorEffect="non-scaling-stroke" />
            </g>
          </svg>
        </div>
        </div>
      </div>
    </div>
  );
}

/** Logo for each skill, served from public/skills (Devicon / Simple Icons). */
const LOGOS: Record<string, string> = {
  C: "c",
  "C++": "cplusplus",
  Java: "java",
  Python: "python",
  JavaScript: "javascript",
  HTML: "html5",
  CSS: "css3",
  Dart: "dart",
  Flutter: "flutter",
  Firebase: "firebase",
  Supabase: "supabase",
  React: "react",
  "Next.js": "nextjs",
  "Node.js": "nodejs",
  OpenCV: "opencv",
  Arduino: "arduino",
  ESP32: "espressif",
  "Raspberry Pi Pico": "raspberrypi",
};

/** Full class strings so Tailwind can see them. `rgb` feeds the panel wash and the tile glow. */
const ACCENTS = {
  amber: { rgb: "255 181 71", text: "text-amber", bar: "bg-amber", badge: "border-amber/40 bg-amber/10 text-amber" },
  violet: { rgb: "139 92 255", text: "text-violet", bar: "bg-violet", badge: "border-violet/40 bg-violet/10 text-violet" },
} as const;

function CodeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6">
      <path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function SkillPanel({
  group,
  items,
  accent,
  icon,
  cols,
  offset = 0,
}: {
  group: { kicker: string; label: string; blurb: string };
  items: readonly string[];
  accent: keyof typeof ACCENTS;
  icon: React.ReactNode;
  cols: string;
  offset?: number;
}) {
  const id = `wb-${group.label.toLowerCase().replace(/\W+/g, "-")}`;
  const a = ACCENTS[accent];
  return (
    <div
      role="group"
      aria-labelledby={id}
      style={{
        backgroundImage: `radial-gradient(60rem circle at 0% 0%, rgb(${a.rgb} / 0.09), transparent 55%)`,
        ["--glow-rgb" as string]: a.rgb,
      }}
      className="wb-panel grid gap-8 rounded-[1.75rem] border border-fog/15 bg-navy/40 p-6 md:p-8 lg:grid-cols-[17rem_1px_minmax(0,1fr)] lg:gap-10 lg:p-10"
    >
      <div className="flex flex-col">
        <span aria-hidden="true" className={`grid size-12 place-items-center rounded-xl border ${a.badge}`}>
          {icon}
        </span>
        <p className="label mt-5 text-fog">{group.kicker}</p>
        <h3 id={id} className="mt-3 font-sans text-[clamp(1.75rem,2.6vw,2.5rem)] leading-tight font-bold tracking-tight text-mist">
          {group.label} <span className={`whitespace-nowrap tabular-nums ${a.text}`}>({String(items.length).padStart(2, "0")})</span>
        </h3>
        <span aria-hidden="true" className={`mt-5 h-[3px] w-12 rounded-full ${a.bar}`} />
        <p className="mt-5 max-w-[16rem] text-fog">{group.blurb}</p>
      </div>

      <span aria-hidden="true" className="hidden bg-fog/15 lg:block" />

      <ul className={`grid content-center gap-3 md:gap-4 ${cols}`}>
        {items.map((s, i) => (
          <li key={s} className="wb-chip">
            <Magnetic strength={0.12} className="size-full">
              <span
                data-cursor="link"
                className="chip relative flex h-full flex-col items-center gap-3 overflow-hidden rounded-2xl border border-fog/15 bg-abyss/50 px-3 pt-9 pb-5"
              >
                <span aria-hidden="true" className="chip-glow pointer-events-none absolute inset-0 rounded-2xl" />
                <span aria-hidden="true" className="label absolute top-3 left-3 text-fog/50 tabular-nums">
                  {String(offset + i + 1).padStart(2, "0")}
                </span>
                <span
                  aria-hidden="true"
                  data-magnetic-inner
                  className="relative grid size-14 place-items-center rounded-full bg-navy/80"
                >
                  <img src={`/skills/${LOGOS[s]}.svg`} alt="" width={36} height={36} loading="lazy" className="size-9" />
                </span>
                <span className="relative text-center font-sans text-[0.95rem] font-semibold text-mist">{s}</span>
              </span>
            </Magnetic>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Workbench() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    (_, contextSafe) =>
      // Built in its own task after hydration (see lib/schedule.ts).
      deferSetup(
        contextSafe!(() => {
          const section = root.current!;
          const mm = gsap.matchMedia();

          mm.add(MQ, (ctx) => {
            const { reduced } = ctx.conditions as MQConditions;

            if (reduced) {
              fadeIn(".wb-head");
              fadeIn(".wb-chips");
              return;
            }

            revealText(".wb-title");
            gsap.from(".wb-sub", {
              opacity: 0,
              y: 20,
              duration: DUR.base,
              ease: EASE.enter,
              scrollTrigger: { trigger: ".wb-sub", start: "top 88%", toggleActions: "play none none reverse" },
            });

            // Marquees: row 0 drifts left, row 1 right. Seamless because each track is two identical halves.
            const loops = gsap.utils.toArray<HTMLElement>(".wb-track").map((track, i) => {
              const duration = track.scrollWidth / 2 / SPEED;
              return i % 2 === 0
                ? gsap.to(track, { xPercent: -50, ease: "none", duration, repeat: -1 })
                : gsap.fromTo(track, { xPercent: -50 }, { xPercent: 0, ease: "none", duration, repeat: -1 });
            });

            // Scroll velocity → skew + speed boost; scrolling up runs the rows backwards.
            const skewEls = gsap.utils.toArray<HTMLElement>(".wb-skew");
            const setSkew = gsap.quickSetter(skewEls, "skewX", "deg");
            const clampSkew = gsap.utils.clamp(-12, 12);
            const skew = { v: 0 };
            const speed = { v: 1 };
            // Hovering the rows eases them to a stop so a name can be read.
            const hover = { v: 1 };
            const applySpeed = () => loops.forEach((t) => t.timeScale(speed.v * hover.v));

            ScrollTrigger.create({
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              onToggle: (self) => loops.forEach((t) => t.paused(!self.isActive)),
              onUpdate: (self) => {
                const v = self.getVelocity();
                const s = clampSkew(v / -280);
                if (Math.abs(s) > Math.abs(skew.v)) {
                  skew.v = s;
                  gsap.to(skew, { v: 0, duration: 0.9, ease: EASE.enter, overwrite: true, onUpdate: () => setSkew(skew.v) });
                }
                const direction = self.direction;
                const boost = direction * (1 + Math.min(Math.abs(v) / 300, 5));
                if (Math.abs(boost) > Math.abs(speed.v) || Math.sign(boost) !== Math.sign(speed.v)) {
                  // Ramp (through zero when reversing), then settle back to cruising speed.
                  gsap.to(speed, {
                    v: boost,
                    duration: 0.3,
                    ease: "power2.out",
                    overwrite: true,
                    onUpdate: applySpeed,
                    onComplete: () => {
                      gsap.to(speed, { v: direction, duration: 1.2, ease: EASE.move, overwrite: true, onUpdate: applySpeed });
                    },
                  });
                }
              },
            });

            // Oscilloscope: drifts while visible; amplitude swells with scroll speed and pointer proximity.
            const marquees = section.querySelector<HTMLElement>(".wb-marquees")!;
            const waveLoop = gsap.to(".wb-wave-track", { xPercent: -50, ease: "none", duration: 9, repeat: -1 });
            const ampTo = gsap.quickTo(".wb-wave-amp", "scaleY", { duration: 0.6, ease: EASE.enter });
            const vel = { v: 0 };
            let near = 0;
            const applyAmp = () => ampTo(1 + Math.max(vel.v, near) * 0.8);
            ScrollTrigger.create({
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              onToggle: (self) => waveLoop.paused(!self.isActive),
              onUpdate: (self) => {
                const a = Math.min(Math.abs(self.getVelocity()) / 1200, 1.6);
                if (a > vel.v) {
                  vel.v = a;
                  gsap.to(vel, { v: 0, duration: 1.2, ease: EASE.enter, overwrite: true, onUpdate: applyAmp });
                }
              },
            });
            const onScopeMove = (e: PointerEvent) => {
              const r = marquees.getBoundingClientRect();
              const dy = Math.abs(e.clientY - (r.top + r.height / 2)) / (r.height / 2);
              near = (1 - Math.min(dy, 1)) * 1.3;
              applyAmp();
            };
            const onScopeLeave = () => {
              near = 0;
              applyAmp();
            };
            const onRowsEnter = () => gsap.to(hover, { v: 0, duration: 0.6, ease: EASE.move, overwrite: true, onUpdate: applySpeed });
            const onRowsLeave = () => gsap.to(hover, { v: 1, duration: 0.9, ease: EASE.move, overwrite: true, onUpdate: applySpeed });
            marquees.addEventListener("pointermove", onScopeMove, { passive: true });
            marquees.addEventListener("pointerleave", onScopeLeave);
            marquees.addEventListener("pointerenter", onRowsEnter);
            marquees.addEventListener("pointerleave", onRowsLeave);

            // Panels rise first, then their tiles.
            gsap.from(".wb-panel", {
              y: 48,
              opacity: 0,
              duration: DUR.base,
              ease: EASE.enter,
              stagger: STAGGER.item,
              scrollTrigger: { trigger: ".wb-chips", start: "top 85%", toggleActions: "play none none reverse" },
            });

            // Chips: staggered rise, reversible.
            gsap.from(".wb-chip", {
              y: 28,
              opacity: 0,
              duration: DUR.base,
              ease: EASE.enter,
              stagger: 0.035,
              scrollTrigger: { trigger: ".wb-chips", start: "top 85%", toggleActions: "play none none reverse" },
            });

            // Icons pop in one after another, just behind their tiles.
            gsap.from(".wb-chip [data-magnetic-inner]", {
              scale: 0.4,
              opacity: 0,
              duration: DUR.base,
              ease: EASE.hero,
              stagger: 0.035,
              delay: 0.2,
              scrollTrigger: { trigger: ".wb-chips", start: "top 85%", toggleActions: "play none none reverse" },
            });

            // Glow follows the pointer inside each chip (CSS vars → radial gradient), fades out slowly = trail.
            const chipsEl = section.querySelector<HTMLElement>(".wb-chips")!;
            const onMove = (e: PointerEvent) => {
              const chip = (e.target as Element).closest<HTMLElement>(".chip");
              if (!chip) return;
              const r = chip.getBoundingClientRect();
              chip.style.setProperty("--mx", `${e.clientX - r.left}px`);
              chip.style.setProperty("--my", `${e.clientY - r.top}px`);
            };
            chipsEl.addEventListener("pointermove", onMove, { passive: true });
            return () => {
              chipsEl.removeEventListener("pointermove", onMove);
              marquees.removeEventListener("pointermove", onScopeMove);
              marquees.removeEventListener("pointerleave", onScopeLeave);
              marquees.removeEventListener("pointerenter", onRowsEnter);
              marquees.removeEventListener("pointerleave", onRowsLeave);
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
      data-chapter="2"
      aria-labelledby="workbench-title"
      className="relative overflow-hidden pb-32 md:pb-48"
    >
      <Seam from={chapters[1]} to={chapter} />
      <div className="wb-head shell grid gap-8 md:grid-cols-12 md:gap-10">
        <Kicker chapter={chapter} className="md:col-span-3 md:pt-4" />
        <div className="md:col-span-9">
          <h2 id="workbench-title" className="wb-title font-display text-display font-extrabold text-mist">
            {skills.heading}
          </h2>
          <p className="wb-sub mt-6 max-w-xl text-lead text-fog">{skills.sub}</p>
        </div>
      </div>

      <div aria-hidden="true" className="wb-marquees relative mt-16 md:mt-28">
        <Scope />
        <div className="relative">
          <MarqueeRow items={skills.languages} />
          <MarqueeRow items={skills.tools} outline />
        </div>
      </div>

      <div className="wb-chips shell mt-20 flex flex-col gap-6 md:mt-32 md:gap-8">
        <SkillPanel
          group={skills.groups.languages}
          items={skills.languages}
          accent="amber"
          icon={<CodeIcon />}
          cols="grid-cols-2 sm:grid-cols-4 2xl:grid-cols-8"
        />
        <SkillPanel
          group={skills.groups.tools}
          items={skills.tools}
          accent="violet"
          icon={<GearIcon />}
          cols="grid-cols-2 sm:grid-cols-3 xl:grid-cols-5"
          offset={skills.languages.length}
        />
      </div>
    </section>
  );
}
