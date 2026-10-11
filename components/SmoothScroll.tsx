"use client";

import { gsap, useGSAP } from "@/lib/gsap";
import { initLenis } from "@/lib/lenis";

/**
 * Mounts Lenis (motion-allowed only). Renders nothing.
 * The post-font ScrollTrigger.refresh() lives in lib/schedule.ts, after deferred setups finish.
 */
export default function SmoothScroll() {
  useGSAP(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";

    const mm = gsap.matchMedia();
    // Reduced motion gets native scrolling; matchMedia tears Lenis down live if the setting flips.
    mm.add("(prefers-reduced-motion: no-preference)", () => initLenis());

    return () => mm.revert();
  });

  return null;
}
