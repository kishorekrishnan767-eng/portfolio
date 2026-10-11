"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const FINE_POINTER = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

/**
 * Pulls its child toward the pointer. Mark an inner element with `data-magnetic-inner`
 * to give it extra travel (parallax inside the button).
 */
export default function Magnetic({
  children,
  strength = 0.35,
  className = "",
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const root = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(FINE_POINTER, () => {
        const el = root.current!;
        const inner = el.querySelector<HTMLElement>("[data-magnetic-inner]");
        const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" });
        const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" });
        const ixTo = inner && gsap.quickTo(inner, "x", { duration: 0.6, ease: "power3.out" });
        const iyTo = inner && gsap.quickTo(inner, "y", { duration: 0.6, ease: "power3.out" });

        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          const dx = e.clientX - (r.left + r.width / 2);
          const dy = e.clientY - (r.top + r.height / 2);
          xTo(dx * strength);
          yTo(dy * strength);
          ixTo?.(dx * strength * 0.5);
          iyTo?.(dy * strength * 0.5);
        };
        const leave = () => {
          xTo(0);
          yTo(0);
          ixTo?.(0);
          iyTo?.(0);
        };

        el.addEventListener("pointermove", move);
        el.addEventListener("pointerleave", leave);
        return () => {
          el.removeEventListener("pointermove", move);
          el.removeEventListener("pointerleave", leave);
        };
      });
    },
    { scope: root },
  );

  return (
    <span ref={root} className={`inline-block ${className}`}>
      {children}
    </span>
  );
}
