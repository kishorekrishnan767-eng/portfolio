import { existsSync } from "node:fs";
import path from "node:path";
import ChapterTracker from "@/components/ChapterTracker";
import Connective from "@/components/Connective";
import Curiosity from "@/components/Chapters/Curiosity";
import Epilogue from "@/components/Chapters/Epilogue";
import Now from "@/components/Chapters/Now";
import Problems from "@/components/Chapters/Problems/Problems";
import Proof from "@/components/Chapters/Proof";
import Workbench from "@/components/Chapters/Workbench";
import Cursor from "@/components/Cursor/Cursor";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero/Hero";
import Nav from "@/components/Nav/Nav";
import NavTransition from "@/components/NavTransition";
import Preloader from "@/components/Preloader/Preloader";
import Spine from "@/components/Spine/Spine";
import { findArt } from "@/lib/images";

// Static page: evaluated at build time, so the CTA appears as soon as the PDF is committed.
const hasResume = existsSync(path.join(process.cwd(), "public", "resume.pdf"));
// Optional artwork in public/images (see IMAGE-PROMPTS.md), also resolved at build time.
const art = findArt();

export default function Home() {
  return (
    <>
      <Preloader />
      <ChapterTracker />
      <Spine />
      <Nav />
      <main id="main" tabIndex={-1}>
        <Hero hasResume={hasResume} art={art["hero-abyss"]} />
        <Curiosity art={art["curiosity-pcb"]} />
        <Workbench />
        <Problems art={art} />
        <Proof />
        <Now art={art["now-board"]} />
        <Epilogue art={art["connect-globe"]} />
      </main>
      <Footer />
      {/* After every chapter: its deferred setup runs last, so seams measure below the pins. */}
      <Connective />
      <NavTransition />
      <Cursor />
    </>
  );
}
