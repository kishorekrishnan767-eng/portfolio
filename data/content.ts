/**
 * SIGNAL — every word on the site lives here.
 * Lines marked DRAFT were written to fill the story and need Kishore's sign-off.
 * Lines marked TODO are missing facts.
 */

export type Depth = "abyss" | "navy";
export type Accent = "cyan" | "violet" | "amber" | "leaf";

export interface Chapter {
  /** DOM id of the <section>, used by nav + scrollTo. */
  id: string;
  /** Mono HUD numeral ("00", "I"...). */
  numeral: string;
  /** Short nav label. */
  label: string;
  /** Chapter heading. */
  title: string;
  /** Background the page tweens to while this chapter is active. */
  depth: Depth;
}

export const site = {
  name: "Kishore Krishnan",
  title: "Kishore Krishnan — I give machines a pulse",
  description:
    "Portfolio of Kishore Krishnan — full-stack, IoT and machine-learning builder. BCA student at SRM Institute of Science and Technology.",
  /** Fallback only — on Vercel the production URL is picked up automatically (app/layout.tsx). */
  url: "https://kishorekrishnan.vercel.app",
  concept: "Every system starts with a signal.",
} as const;

export const chapters: readonly Chapter[] = [
  { id: "prologue", numeral: "00", label: "Prologue", title: "Prologue", depth: "abyss" },
  { id: "curiosity", numeral: "I", label: "Curiosity", title: "The Curiosity", depth: "navy" },
  { id: "workbench", numeral: "II", label: "Workbench", title: "The Workbench", depth: "abyss" },
  { id: "problems", numeral: "III", label: "Problems", title: "The Problems", depth: "navy" },
  { id: "proof", numeral: "IV", label: "Proof", title: "The Proof", depth: "abyss" },
  { id: "now", numeral: "V", label: "Now", title: "The Now", depth: "navy" },
  { id: "connect", numeral: "∞", label: "Connect", title: "Epilogue", depth: "abyss" },
] as const;

export const preloader = {
  status: ["no signal", "calibrating", "signal acquired"],
  /** aria-live text announced once boot completes. */
  doneAnnouncement: "Signal acquired. Page loaded.",
} as const;

export const hero = {
  eyebrow: "Every system starts with a signal",
  name: "Kishore Krishnan",
  /** Rendered as: before + <em>accent</em> + after */
  line: { before: "I give machines a ", accent: "pulse", after: "." },
  disciplines: ["Full Stack", "IoT", "Machine Learning"],
  ctas: {
    primary: { label: "View My Work", href: "#problems" },
    // Rendered only when public/resume.pdf exists (checked at build time).
    secondary: { label: "Download Resume", href: "/resume.pdf" },
  },
  scrollCue: "Scroll to follow the signal",
} as const;

export const about = {
  heading: "Wired to wonder", // DRAFT
  // DRAFT — the word-by-word scrubbed paragraph. Keep it ~50–70 words.
  paragraph:
    "It started with a blinking LED and a question: what else could I make listen? Since then I've been building at the seam where hardware meets software — sensors that read danger before it happens, wearables that call for help, machines that reward the right choice. I write the code, wire the circuits, and keep going until the system has a pulse.",
  /** Word in the paragraph set in Instrument Serif italic. */
  accent: "pulse",
  /** Words that flash cyan as the reader reaches them. */
  emphasis: ["hardware", "software", "machines"],
  education: {
    institution: "SRM Institute of Science and Technology",
    degree: "BCA",
    year: "2nd Year",
  },
  stats: [
    { value: 8.1, decimals: 1, suffix: "", label: "CGPA" },
    { value: 3, decimals: 0, suffix: "", label: "Projects" },
    { value: 2, decimals: 0, suffix: "", label: "Hackathons" },
    { value: 1, decimals: 0, suffix: "", label: "Internship" },
  ],
} as const;

export const skills = {
  heading: "Tools I reach for",
  sub: "Languages I think in. Hardware and frameworks I build with.", // DRAFT
  groups: {
    languages: { kicker: "Tech stack", label: "Languages", blurb: "Core programming languages I work with." },
    tools: {
      kicker: "Tools & platforms",
      label: "Tools & Platforms",
      blurb: "Frameworks, libraries and platforms I use for development.",
    },
  },
  // TODO: Kishore to confirm both lists.
  languages: ["C", "C++", "Java", "Python", "JavaScript", "HTML", "CSS", "Dart"],
  tools: [
    "Flutter",
    "Firebase",
    "Supabase",
    "React",
    "Next.js",
    "Node.js",
    "OpenCV",
    "Arduino",
    "ESP32",
    "Raspberry Pi Pico",
  ],
} as const;

export interface Project {
  id: string;
  index: string;
  name: string;
  role: string;
  accent: Accent;
  /** Secondary tint for the scene's gradient. */
  accent2?: Accent;
  /** One-line hook (from the brief). */
  tagline: string;
  /** DRAFT — the problem in human terms. */
  problem: string;
  /** DRAFT — what was built. */
  built: string;
  stack: string[];
  /** Short mono readouts for the scene's micro-story. */
  scene: { readout: string; alert: string };
  /** DRAFT — hardware → software path, animated under the visual (4 stages). */
  flow: [string, string, string, string];
}

export const projects = {
  heading: "Problems worth a pulse",
  sub: "Three problems. Three systems. Each one built to sense something before it's too late.", // DRAFT
  hint: "Keep scrolling",
  labels: { problem: "The problem", built: "What I built", role: "Role", stack: "Stack" },
  list: [
    {
      id: "sparksense",
      index: "01",
      name: "SparkSense",
      role: "Hardware Lead",
      accent: "amber",
      tagline: "Predicts explosion risks in firecracker industries before they occur.",
      problem:
        "In firecracker units, unsafe conditions build quietly — and by the time anyone notices, it's already too late.",
      built:
        "A sensor node on a Raspberry Pi Pico that streams live readings to a Python risk model, with warnings pushed to a Flutter app before the threshold is crossed.",
      stack: ["Flutter", "Raspberry Pi Pico", "Python"],
      scene: { readout: "risk index", alert: "threshold breached — evacuate" },
      flow: ["Sensors", "Pico", "Risk model", "Flutter app"],
    },
    {
      id: "women-safety-band",
      index: "02",
      name: "Women Safety Band",
      role: "Team Lead",
      accent: "violet",
      accent2: "cyan",
      tagline: "Real-time health monitoring with emergency alerts for women's safety.",
      problem:
        "When someone is in danger, every second spent unlocking a phone and calling for help is a second lost.",
      built:
        "A wearable band that monitors vitals in real time and, on a distress trigger, fires an emergency alert with context to trusted contacts through Firebase.",
      stack: ["Arduino", "OpenCV", "Firebase", "C++"],
      scene: { readout: "heart rate", alert: "emergency alert dispatched" },
      flow: ["Vitals", "Arduino", "Firebase", "Alert"],
    },
    {
      id: "green-atm",
      index: "03",
      name: "Green ATM",
      role: "Hardware Developer",
      accent: "leaf",
      accent2: "cyan",
      tagline: "Reward-based plastic recycling to incentivize sustainable behavior.",
      problem: "Most people want to recycle — they just don't have a reason to do it right now.",
      built:
        "A reverse-vending machine that uses computer vision to recognise plastic bottles and credits the user instantly, turning every deposit into a reward.",
      stack: ["ML", "Firebase", "OpenCV", "Flutter", "Arduino"],
      scene: { readout: "credits earned", alert: "bottle accepted" },
      flow: ["Camera", "OpenCV + ML", "Firebase", "Flutter app"],
    },
  ] satisfies Project[],
} as const;

export interface Achievement {
  title: string;
  org: string;
  year: string;
  tag?: string;
}

export const achievements = {
  heading: "Signals on record",
  list: [
    { title: "Student Ambassador", org: "SDG EduTech Expo, SRM", year: "2024", tag: "Leadership" },
    { title: "Anveshan Hackathon", org: "Zonal & National Participant", year: "2024", tag: "Hackathon" },
    { title: "24-Hour Hackathon", org: "Rajalakshmi Engineering College", year: "2024", tag: "Hackathon" },
    { title: "AI-ML Virtual Internship", org: "AICTE × Google", year: "2024", tag: "Internship" },
    { title: "AI Tools Challenge", org: "University of London", year: "2024", tag: "Certification" },
    { title: "Java Enterprise Edition", org: "Udemy", year: "2023", tag: "Certification" },
  ] satisfies Achievement[],
} as const;

export const now = {
  company: "LiveWires Digital Solutions",
  role: "Intern", // TODO: exact title?
  focus: "Full-stack & embedded systems",
  status: "status: building",
  // DRAFT
  blurb:
    "Right now I'm shipping across the whole stack at LiveWires — from firmware on the board to the interface on the screen.",
} as const;

export const connect = {
  heading: { before: "Let's ", accent: "connect" },
  // DRAFT
  sub: "Have a problem that needs a pulse? I'm listening.",
  email: "kishorekrishnans2007@gmail.com",
  links: [
    { label: "GitHub", handle: "kishorekrishnan767-eng", href: "https://github.com/kishorekrishnan767-eng" },
    // TODO: exact LinkedIn profile URL
    // TODO: paste the profile URL — links with an empty href are not rendered.
    { label: "LinkedIn", handle: "Kishore Krishnan", href: "" },
  ],
  marquee: "Open to the next opportunity",
  footer: `© ${new Date().getFullYear()} Kishore Krishnan. Built with a pulse.`,
} as const;
