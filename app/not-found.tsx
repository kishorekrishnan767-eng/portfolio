import type { Metadata } from "next";
import Link from "next/link";
import Plankton from "@/components/Hero/Plankton";
import Magnetic from "@/components/ui/Magnetic";
import { site } from "@/data/content";

export const metadata: Metadata = {
  title: `Signal lost — ${site.name}`,
};

/** 404 — the signal drops. A flatline tries to beat, fails, and draws again. */
export default function NotFound() {
  return (
    <main id="main" tabIndex={-1} className="relative flex min-h-svh flex-col justify-center overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 opacity-50">
        <Plankton />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ backgroundImage: "radial-gradient(120% 80% at 50% 0%, transparent 40%, rgb(4 7 13 / 0.9))" }}
      />

      <div className="shell relative">
        <p className="label text-fog">
          <span className="text-cyan">404</span>&ensp;—&ensp;no carrier
        </p>
        <h1 className="mt-6 font-display text-hero font-extrabold text-mist">
          Signal <em className="font-serif font-normal text-cyan glow-cyan">lost</em>
        </h1>
        <p className="mt-6 max-w-md text-lead text-fog">
          Nothing is transmitting on this frequency. The page you were looking for never existed, or it went quiet.
        </p>
        <div className="mt-12">
          <Magnetic>
            <Link
              href="/"
              data-cursor="link"
              className="btn-lift group inline-flex items-center gap-3 rounded-full border border-cyan/60 bg-cyan/10 px-7 py-4 text-mist transition-colors duration-500 ease-enter hover:bg-cyan hover:text-abyss"
            >
              <span data-magnetic-inner className="inline-flex items-center gap-3 text-sm font-semibold tracking-wide">
                <span aria-hidden="true" className="transition-transform duration-500 ease-enter group-hover:-translate-x-1">
                  ←
                </span>
                Return to the first signal
              </span>
            </Link>
          </Magnetic>
        </div>
      </div>

      <svg
        aria-hidden="true"
        className="relative mt-16 h-24 w-full"
        viewBox="0 0 1400 120"
        preserveAspectRatio="none"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path className="stroke-fog/15" strokeWidth={1.5} d="M0 70 H1400" />
        <path
          className="lost-trace stroke-cyan"
          strokeWidth={2}
          pathLength={1}
          d="M0 70 H560 L576 70 L584 62 L592 76 L600 70 H680 L690 66 L698 72 L704 70 H1400"
        />
      </svg>
    </main>
  );
}
