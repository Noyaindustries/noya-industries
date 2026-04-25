/**
 * Sons d’interface très courts (Web Audio API), volume bas.
 * Respecte prefers-reduced-motion : pas de son ni d’animation sonore.
 */

let audioCtx: AudioContext | null = null;
let lastFocusSound = 0;
const FOCUS_THROTTLE_MS = 220;

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function resumeUiAudio(): void {
  if (typeof window === "undefined" || prefersReducedMotion()) return;
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    if (!audioCtx) audioCtx = new AC();
    if (audioCtx.state === "suspended") void audioCtx.resume();
  } catch {
    /* ignore */
  }
}

function getCtx(): AudioContext | null {
  if (prefersReducedMotion()) return null;
  resumeUiAudio();
  return audioCtx;
}

function tone(
  freq: number,
  durationSec: number,
  volume: number,
  type: OscillatorType = "sine",
  when = 0,
): void {
  const ctx = getCtx();
  if (!ctx) return;
  const t0 = ctx.currentTime + when;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(volume, t0 + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0008, t0 + durationSec);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + durationSec + 0.02);
}

/** Focus / entrée dans un champ */
export function playFieldFocus(): void {
  if (prefersReducedMotion()) return;
  const now = typeof performance !== "undefined" ? performance.now() : Date.now();
  if (now - lastFocusSound < FOCUS_THROTTLE_MS) return;
  lastFocusSound = now;
  tone(1320, 0.038, 0.028, "sine");
}

/** Ouverture de la modale */
export function playModalOpen(): void {
  if (prefersReducedMotion()) return;
  tone(523.25, 0.07, 0.035, "sine", 0);
  tone(783.99, 0.09, 0.03, "sine", 0.06);
}

/** Étape suivante validée */
export function playStepAdvance(): void {
  if (prefersReducedMotion()) return;
  tone(659.25, 0.085, 0.038, "triangle", 0);
  tone(880, 0.1, 0.032, "triangle", 0.08);
}

/** Retour à l’étape précédente */
export function playStepBack(): void {
  if (prefersReducedMotion()) return;
  tone(587.33, 0.09, 0.034, "sine", 0);
}

/** Case à cocher / tuile */
export function playToggle(): void {
  if (prefersReducedMotion()) return;
  tone(1046.5, 0.045, 0.03, "sine");
}

/** Liste déroulante */
export function playSelect(): void {
  if (prefersReducedMotion()) return;
  tone(880, 0.04, 0.022, "sine");
}

/** Erreur de validation courte */
export function playSoftError(): void {
  if (prefersReducedMotion()) return;
  tone(220, 0.1, 0.04, "sine", 0);
  tone(185, 0.12, 0.032, "sine", 0.07);
}

/** Envoi réussi */
export function playSuccess(): void {
  if (prefersReducedMotion()) return;
  tone(523.25, 0.1, 0.034, "triangle", 0);
  tone(659.25, 0.1, 0.03, "triangle", 0.1);
  tone(783.99, 0.14, 0.028, "triangle", 0.2);
}
