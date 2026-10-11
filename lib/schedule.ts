import { ScrollTrigger } from "./gsap";

/*
 * Below-the-fold chapters build their timelines/ScrollTriggers one per task instead of all
 * inside the hydration commit — no single long task, so the main thread stays responsive
 * during load (the preloader covers this window anyway). Jobs run in enqueue order, which is
 * DOM order, so pins are still created top-to-bottom. One refresh runs once the queue drains
 * and webfonts are in.
 */

interface Job {
  run: () => void;
  cancelled: boolean;
}

const queue: Job[] = [];
let pumping = false;
let ran = 0;

type PostTask = (cb: () => void, opts?: { priority?: string }) => Promise<unknown>;

function nextTask(fn: () => void) {
  // Call as a method — postTask throws "Illegal invocation" when detached from `scheduler`.
  const scheduler = (globalThis as { scheduler?: { postTask?: PostTask } }).scheduler;
  if (scheduler?.postTask) scheduler.postTask(fn, { priority: "user-visible" });
  else setTimeout(fn, 0);
}

/** Wraps work in a User Timing measure — visible in the DevTools Performance panel. */
function timed(name: string, fn: () => void) {
  const start = performance.now();
  fn();
  performance.measure(name, { start, end: performance.now() });
}

function pump() {
  const job = queue.shift();
  if (job && !job.cancelled) timed(`signal:setup #${++ran}`, job.run);
  if (queue.length) {
    nextTask(pump);
    return;
  }
  pumping = false;
  document.fonts.ready.then(() => timed("signal:refresh", () => ScrollTrigger.refresh()));
}

/** Queue an animation setup. Returns a cancel function for effect cleanup. */
export function deferSetup(run: () => void): () => void {
  const job: Job = { run, cancelled: false };
  queue.push(job);
  if (!pumping) {
    pumping = true;
    nextTask(pump);
  }
  return () => {
    job.cancelled = true;
  };
}
