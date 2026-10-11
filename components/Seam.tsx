import type { Chapter } from "@/data/content";

/**
 * The hand-off between two chapters: "I ──∿── II". The lit line is pre-drawn and revealed by a
 * compositor-only wipe (window slides in, contents counter-slide) — no per-frame repaint.
 * Geometry is rebuilt in real pixels and the wipe is scrubbed by components/Connective.tsx.
 */
export default function Seam({ from, to }: { from: Chapter; to: Chapter }) {
  return (
    <div aria-hidden="true" className="seam relative pb-16 pt-6 md:pb-24">
      <div className="shell label flex items-center justify-between">
        <span className="seam-from text-fog/50">
          {from.numeral} — {from.label}
        </span>
        <span className="seam-to text-cyan">
          {to.numeral} — {to.label}
        </span>
      </div>
      <div className="relative mt-3 h-14">
        <svg className="seam-svg absolute inset-0 size-full overflow-visible" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path className="seam-path stroke-fog/15" strokeWidth={1.25} />
        </svg>
        <div className="seam-wipe absolute inset-0 overflow-hidden will-change-transform">
          <div className="seam-wipe-inner absolute inset-0 will-change-transform">
            <svg className="seam-svg absolute inset-0 size-full overflow-visible" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path className="seam-path stroke-cyan" strokeWidth={1.75} style={{ filter: "drop-shadow(0 0 5px rgb(61 245 214 / 0.8))" }} />
            </svg>
          </div>
        </div>
        <span className="seam-beat absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan opacity-0" style={{ boxShadow: "var(--glow-cyan)" }} />
      </div>
    </div>
  );
}
