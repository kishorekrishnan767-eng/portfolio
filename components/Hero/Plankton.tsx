"use client";

import { useRef } from "react";
import { gsap, MQ, useGSAP } from "@/lib/gsap";

interface Particle {
  x: number;
  y: number;
  /** Depth 0.25 (far) … 1 (near): drives size, speed, parallax. */
  z: number;
  size: number;
  alpha: number;
  phase: number;
  sprite: HTMLCanvasElement;
  /** Displacement from pointer repulsion, eased back to 0. */
  ox: number;
  oy: number;
}

const SPRITE_PX = 64;
const REPEL_RADIUS = 140;

/** Pre-rendered soft glow, drawn with drawImage — far cheaper than per-frame gradients. */
function makeSprite(rgb: string) {
  const c = document.createElement("canvas");
  c.width = c.height = SPRITE_PX;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, `rgb(${rgb} / 1)`);
  grad.addColorStop(0.18, `rgb(${rgb} / 0.85)`);
  grad.addColorStop(0.45, `rgb(${rgb} / 0.18)`);
  grad.addColorStop(1, `rgb(${rgb} / 0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, SPRITE_PX, SPRITE_PX);
  return c;
}

export default function Plankton({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useGSAP(() => {
    const canvas = canvasRef.current!;
    const ctx2d = canvas.getContext("2d", { alpha: true })!;
    const sprites = {
      cyan: makeSprite("61 245 214"),
      violet: makeSprite("139 92 255"),
      mist: makeSprite("232 241 245"),
    };

    let w = 0;
    let h = 0;
    let particles: Particle[] = [];

    const pickSprite = () => {
      const r = Math.random();
      return r < 0.72 ? sprites.cyan : r < 0.86 ? sprites.violet : sprites.mist;
    };

    const seed = () => {
      const area = w * h;
      const count = Math.round(gsap.utils.clamp(36, 140, area / 10000));
      particles = Array.from({ length: count }, () => {
        const z = gsap.utils.random(0.25, 1);
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          z,
          size: (2.5 + Math.random() * 7) * z,
          alpha: gsap.utils.random(0.12, 0.65) * (0.4 + z * 0.6),
          phase: Math.random() * Math.PI * 2,
          sprite: pickSprite(),
          ox: 0,
          oy: 0,
        };
      });
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      const rect = canvas.getBoundingClientRect();
      const changed = Math.abs(rect.width - w) > 1 || Math.abs(rect.height - h) > 80;
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Mobile toolbars nudge height constantly; only reseed on real changes.
      if (changed || !particles.length) seed();
    };

    // Pointer: normalised parallax (-1…1) eased via quickTo, plus raw local position for repulsion.
    const parallax = { x: 0, y: 0 };
    const pxTo = gsap.quickTo(parallax, "x", { duration: 1.6, ease: "power3.out" });
    const pyTo = gsap.quickTo(parallax, "y", { duration: 1.6, ease: "power3.out" });
    const pointer = { x: -9999, y: -9999 };

    let time = 0;
    const draw = (dt: number, animate: boolean) => {
      ctx2d.clearRect(0, 0, w, h);
      ctx2d.globalCompositeOperation = "lighter";
      time += 0.016 * dt;

      for (const p of particles) {
        if (animate) {
          p.y -= (0.08 + p.z * 0.22) * dt;
          p.x += Math.sin(time * 0.35 + p.phase) * 0.12 * p.z * dt;
          if (p.y < -20) {
            p.y = h + 20;
            p.x = Math.random() * w;
          }
          if (p.x < -20) p.x = w + 20;
          else if (p.x > w + 20) p.x = -20;

          // Repulsion — near particles react more strongly.
          const px = p.x + parallax.x * 26 * p.z;
          const py = p.y + parallax.y * 18 * p.z;
          const dx = px - pointer.x;
          const dy = py - pointer.y;
          const d2 = dx * dx + dy * dy;
          let tx = 0;
          let ty = 0;
          if (d2 < REPEL_RADIUS * REPEL_RADIUS) {
            const d = Math.sqrt(d2) || 1;
            const f = (1 - d / REPEL_RADIUS) * 34 * p.z;
            tx = (dx / d) * f;
            ty = (dy / d) * f;
          }
          p.ox += (tx - p.ox) * 0.06 * dt;
          p.oy += (ty - p.oy) * 0.06 * dt;
        }

        const twinkle = 0.65 + 0.35 * Math.sin(time * 1.4 + p.phase * 3);
        ctx2d.globalAlpha = p.alpha * twinkle;
        const s = p.size * 4;
        ctx2d.drawImage(
          p.sprite,
          p.x + parallax.x * 26 * p.z + p.ox - s / 2,
          p.y + parallax.y * 18 * p.z + p.oy - s / 2,
          s,
          s,
        );
      }
      ctx2d.globalAlpha = 1;
    };

    let running = false;
    let visible = true;
    const ro = new ResizeObserver(() => {
      resize();
      if (!running) draw(0, false);
    });
    ro.observe(canvas);
    resize();

    const tick = () => draw(Math.min(gsap.ticker.deltaRatio(60), 3), true);

    const mm = gsap.matchMedia();
    mm.add({ motion: "(prefers-reduced-motion: no-preference)", reduced: MQ.reduced }, (ctx) => {
      if (ctx.conditions!.reduced) {
        draw(0, false);
        return;
      }

      const start = () => {
        if (running || !visible) return;
        running = true;
        gsap.ticker.add(tick);
      };
      const stop = () => {
        running = false;
        gsap.ticker.remove(tick);
      };

      const io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
        else stop();
      });
      io.observe(canvas);

      const onMove = (e: PointerEvent) => {
        const r = canvas.getBoundingClientRect();
        pointer.x = e.clientX - r.left;
        pointer.y = e.clientY - r.top;
        pxTo((e.clientX / window.innerWidth) * 2 - 1);
        pyTo((e.clientY / window.innerHeight) * 2 - 1);
      };
      const onLeave = () => {
        pointer.x = pointer.y = -9999;
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);

      start();
      return () => {
        stop();
        io.disconnect();
        window.removeEventListener("pointermove", onMove);
        document.documentElement.removeEventListener("pointerleave", onLeave);
      };
    });

    return () => {
      ro.disconnect();
      mm.revert();
    };
  });

  return <canvas ref={canvasRef} aria-hidden="true" className={`pointer-events-none size-full ${className}`} />;
}
