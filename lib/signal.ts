/**
 * Tiny cross-component signals. Kept outside React state on purpose:
 * animation code subscribes directly, so nothing re-renders mid-scroll.
 */

type Listener<T> = (value: T) => void;

function channel<T>(initial: T) {
  let value = initial;
  const listeners = new Set<Listener<T>>();
  return {
    get: () => value,
    set(next: T) {
      if (next === value) return;
      value = next;
      listeners.forEach((fn) => fn(next));
    },
    /** Calls immediately with the current value, then on every change. */
    subscribe(fn: Listener<T>) {
      listeners.add(fn);
      fn(value);
      return () => {
        listeners.delete(fn);
      };
    },
  };
}

/** Flips to true the moment the preloader curtain starts to open. */
export const booted = channel(false);

/**
 * Runs `fn` once boot happens (immediately if it already has).
 * Returns an unsubscribe for effect cleanup.
 */
export function whenBooted(fn: () => void) {
  let done = false;
  return booted.subscribe((isBooted) => {
    if (!isBooted || done) return;
    done = true;
    fn();
  });
}

/** Index into `chapters` (data/content.ts) of the chapter nearest the viewport centre. */
export const activeChapter = channel(0);
