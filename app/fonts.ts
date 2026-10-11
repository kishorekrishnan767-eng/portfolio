import { Instrument_Serif, JetBrains_Mono, Manrope, Syne } from "next/font/google";

/** Display — names, chapter titles. */
const syne = Syne({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-syne",
  display: "swap",
});

/** Emotional accent words only ("pulse", "connect"). */
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  variable: "--font-instrument-serif",
  display: "swap",
});

/** Body copy. */
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

/** Labels, counters, HUD. */
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const fontVariables = [syne, instrumentSerif, manrope, jetbrainsMono]
  .map((f) => f.variable)
  .join(" ");
