"use client";

import { useRef } from "react";
import { EASE, gsap, useGSAP } from "@/lib/gsap";
import { registerTransition } from "@/lib/navigate";

/**
 * The "signal reroute" curtain used for long in-page jumps (see lib/navigate.ts).
 * A cyan scan line sweeps down drawing the curtain, the destination chapter flashes,
 * the page jumps underneath, and the line sweeps on to reveal it. Clip-path + transforms only.
 */
export default function NavTransition() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const q = gsap.utils.selector(el);
      const [panel] = q(".nt-panel");
      const [line] = q(".nt-line");
      const [num] = q(".nt-num");
      const [title] = q(".nt-title");
      const words = q(".nt-word");
      const sweep = () => window.innerHeight;

      registerTransition(
        (label, jump) =>
          new Promise<void>((resolve) => {
            num.textContent = label.numeral;
            title.textContent = label.title;
            gsap
              .timeline({ onComplete: () => resolve() })
              .set(el, { visibility: "visible" })
              // Cover: curtain grows down behind the scan line.
              .fromTo(panel, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.55, ease: EASE.move }, 0)
              .fromTo(line, { y: 0, opacity: 1 }, { y: sweep, duration: 0.55, ease: EASE.move }, 0)
              .fromTo(words, { yPercent: 110 }, { yPercent: 0, duration: 0.5, ease: EASE.enter, stagger: 0.06 }, 0.3)
              // Jump while covered.
              .call(jump, [], 0.7)
              // Reveal: the line sweeps on and the curtain lifts behind it.
              .to(words, { yPercent: -110, duration: 0.35, ease: "power2.in", stagger: 0.04 }, 1.0)
              .fromTo(
                panel,
                { clipPath: "inset(0% 0% 0% 0%)" },
                { clipPath: "inset(100% 0% 0% 0%)", duration: 0.6, ease: EASE.move, immediateRender: false },
                1.2,
              )
              .fromTo(line, { y: 0 }, { y: sweep, duration: 0.6, ease: EASE.move, immediateRender: false }, 1.2)
              .to(line, { opacity: 0, duration: 0.15 }, 1.65)
              .set(el, { visibility: "hidden" });
          }),
      );
      return () => registerTransition(null);
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      aria-hidden="true"
      className="invisible fixed inset-0"
      style={{ zIndex: "calc(var(--z-cursor) - 5)" }}
    >
      <div className="nt-panel absolute inset-0 bg-abyss" style={{ clipPath: "inset(0% 0% 100% 0%)" }}>
        <div
          className="absolute inset-0"
          style={{ backgroundImage: "radial-gradient(60% 50% at 50% 50%, rgb(61 245 214 / 0.06), transparent 70%)" }}
        />
        <div className="shell relative flex h-full flex-col justify-center">
          <p className="label overflow-hidden text-fog">
            <span className="nt-word block">rerouting signal</span>
          </p>
          <p className="mt-4 overflow-hidden font-display text-display font-extrabold leading-none text-cyan">
            <span className="nt-word nt-num block glow-cyan" />
          </p>
          <p className="mt-2 overflow-hidden pb-[0.1em] font-display text-title font-extrabold text-mist">
            <span className="nt-word nt-title block" />
          </p>
        </div>
      </div>
      <div className="nt-line absolute inset-x-0 top-0 h-px bg-cyan" style={{ boxShadow: "var(--glow-cyan)" }} />
    </div>
  );
}
