import { gsap } from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, DrawSVGPlugin, MotionPathPlugin, MorphSVGPlugin);
}

/** One motion language for the whole site. */
export const EASE = {
  /** Things arriving. */
  enter: "power3.out",
  /** Things moving between states / sections. */
  move: "power2.inOut",
  /** Hero-only: fast attack, long settle. */
  hero: "expo.out",
} as const;

export const DUR = {
  fast: 0.4,
  base: 0.8,
  slow: 1.2,
  hero: 1.6,
} as const;

export const STAGGER = {
  /** SplitText line/word reveals. */
  text: 0.04,
  /** Cards, chips, list items. */
  item: 0.08,
} as const;

/**
 * gsap.matchMedia() conditions. Use as:
 *   mm.add(MQ, (ctx) => { const { desktop, mobile, reduced } = ctx.conditions! })
 * Horizontal pinning is desktop-only (>= 768px).
 */
export const MQ = {
  desktop: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
  mobile: "(max-width: 767.98px) and (prefers-reduced-motion: no-preference)",
  reduced: "(prefers-reduced-motion: reduce)",
} as const;

export type MQConditions = { [K in keyof typeof MQ]: boolean };

gsap.defaults({ ease: EASE.enter, duration: DUR.base });

export { gsap, ScrollTrigger, SplitText, DrawSVGPlugin, MotionPathPlugin, MorphSVGPlugin, useGSAP };
