"use client";

import { EASE, gsap, MQ, type MQConditions, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { deferSetup } from "@/lib/schedule";

/*
 * The connective tissue between chapters (renders nothing):
 *  - seams: each chapter opens with an ECG line that "draws" (compositor wipe) as you cross into it;
 *  - decode: chapter labels resolve from noise like an incoming signal;
 *  - art: optional artwork opens with a clip-path reveal and settles from a slight zoom.
 */

const H = 56;
const BASE = 36;
const GLYPHS = "01<>/\\_-+=#%~";

/** Flat line with one heartbeat at the centre, in real pixels. Returns the path and the R-peak. */
function seamPath(w: number) {
  const c = w / 2;
  const d =
    `M0 ${BASE} H${c - 40} Q${c - 33} ${BASE - 7} ${c - 26} ${BASE} H${c - 18}` +
    ` L${c - 12} ${BASE + 7} L${c - 4} ${BASE - 30} L${c + 4} ${BASE + 16} L${c + 10} ${BASE}` +
    ` H${c + 20} Q${c + 30} ${BASE - 10} ${c + 40} ${BASE} H${w}`;
  return { d, peak: [c - 4, BASE - 30] as const };
}

function decode(el: HTMLElement) {
  const text = el.dataset.text ?? el.textContent ?? "";
  el.dataset.text = text;
  const state = { p: 0 };
  return gsap.to(state, {
    p: 1,
    duration: 0.8,
    ease: "none",
    overwrite: true,
    onUpdate: () => {
      const shown = Math.floor(state.p * text.length);
      el.textContent = [...text]
        .map((ch, i) => (i < shown || ch === " " ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0]))
        .join("");
    },
    onComplete: () => {
      el.textContent = text;
    },
  });
}

export default function Connective() {
  useGSAP((_, contextSafe) =>
    deferSetup(
      contextSafe!(() => {
        const seams = gsap.utils.toArray<HTMLElement>(".seam");

        // Geometry first (and on every refresh, before measurements), so DrawSVG can re-measure.
        const layout = () =>
          seams.forEach((seam) => {
            const svgs = seam.querySelectorAll<SVGSVGElement>(".seam-svg");
            const w = Math.max(320, Math.round(svgs[0].clientWidth));
            const { d, peak } = seamPath(w);
            svgs.forEach((svg) => svg.setAttribute("viewBox", `0 0 ${w} ${H}`));
            seam.querySelectorAll(".seam-path").forEach((p) => p.setAttribute("d", d));
            const beat = seam.querySelector<HTMLElement>(".seam-beat")!;
            beat.style.left = `${peak[0]}px`;
            beat.style.top = `${peak[1]}px`;
          });
        layout();
        ScrollTrigger.addEventListener("refreshInit", layout);

        const mm = gsap.matchMedia();
        mm.add(MQ, (ctx) => {
          const { reduced } = ctx.conditions as MQConditions;

          if (reduced) {
            gsap.set(".seam-beat", { opacity: 1 });
            return;
          }

          seams.forEach((seam) => {
            gsap
              .timeline({
                defaults: { ease: "none" },
                scrollTrigger: { trigger: seam, start: "top 92%", end: "top 40%", scrub: true },
              })
              // Wipe: the window slides in while its contents slide back — the line appears to draw.
              .fromTo(seam.querySelector(".seam-wipe"), { xPercent: -100 }, { xPercent: 0, duration: 1 }, 0)
              .fromTo(seam.querySelector(".seam-wipe-inner"), { xPercent: 100 }, { xPercent: 0, duration: 1 }, 0)
              .fromTo(seam.querySelector(".seam-beat"), { opacity: 0, scale: 0.2 }, { opacity: 1, scale: 1, duration: 0.08 }, 0.48)
              .to(seam.querySelector(".seam-from"), { opacity: 0.25, duration: 0.5 }, 0.2)
              .fromTo(seam.querySelector(".seam-to"), { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: 0.3, ease: EASE.enter }, 0.6);
          });

          gsap.utils.toArray<HTMLElement>("[data-decode]").forEach((el) => {
            ScrollTrigger.create({ trigger: el, start: "top 90%", onEnter: () => decode(el) });
          });

          gsap.utils.toArray<HTMLElement>(".art[data-reveal]").forEach((art) => {
            gsap
              .timeline({
                defaults: { ease: "none" },
                scrollTrigger: { trigger: art, start: "top bottom", end: "top 25%", scrub: true },
              })
              .fromTo(art, { clipPath: "inset(14% 10% 14% 10% round 28px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 1 }, 0)
              .fromTo(art.querySelector(".art-img"), { scale: 1.2 }, { scale: 1, duration: 1 }, 0);
          });

          return () => {
            gsap.utils.toArray<HTMLElement>("[data-decode]").forEach((el) => {
              if (el.dataset.text) el.textContent = el.dataset.text;
            });
          };
        });

        return () => ScrollTrigger.removeEventListener("refreshInit", layout);
      }),
    ),
  );

  return null;
}

