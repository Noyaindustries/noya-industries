"use client";

import { createRoot, type Root } from "react-dom/client";
import { useEffect } from "react";
import { NoyaLandingContactForm } from "./NoyaLandingContactForm";

type LuxPreset = "soft" | "showroom";

const LUX_PRESET_KEY = "noya-lux-preset";

function isLuxPreset(value: string | null): value is LuxPreset {
  return value === "soft" || value === "showroom";
}

function shimPole(el: HTMLElement, e: MouseEvent) {
  const r = el.getBoundingClientRect();
  el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
  el.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
}

function countUp(el: HTMLElement, target: number, suffix: string) {
  let start: number | null = null;
  const dur = 1800;
  const step = (ts: number) => {
    if (start === null) start = ts;
    const p = Math.min((ts - start) / dur, 1);
    const eased = 1 - (1 - p) ** 4;
    el.textContent = `${Math.round(eased * target)}${suffix}`;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export function NoyaLandingClient() {
  useEffect(() => {
    let root: Root | null = null;
    const mountEl = document.getElementById("noya-landing-contact-root");
    if (mountEl) {
      const mode =
        mountEl.getAttribute("data-form-mode") === "recruitment"
          ? "recruitment"
          : "contact";
      root = createRoot(mountEl);
      root.render(<NoyaLandingContactForm mode={mode} />);
    }

    const cv = document.getElementById("world") as HTMLCanvasElement | null;
    const cx = cv?.getContext("2d", { alpha: true });
    let W = 0;
    let H = 0;
    let T = 0;
    let rafId = 0;
    let running = true;
    let scrollY = 0;

    const GOLD: readonly [number, number, number] = [184, 110, 10];
    const COBALT: readonly [number, number, number] = [30, 85, 150];

    const ORBS = [
      { bx: 0.08, by: 0.06, r: 0.62, c: GOLD, a: 0.095, s: 0.0001, p: 0 },
      { bx: 0.92, by: 0.88, r: 0.52, c: COBALT, a: 0.1, s: 0.00017, p: 2.4 },
      { bx: 0.48, by: 0.48, r: 0.72, c: GOLD, a: 0.055, s: 0.000075, p: 4.2 },
      { bx: 0.12, by: 0.82, r: 0.4, c: COBALT, a: 0.082, s: 0.00022, p: 1.1 },
      { bx: 0.88, by: 0.12, r: 0.46, c: GOLD, a: 0.072, s: 0.00015, p: 3.1 },
      { bx: 0.55, by: 0.96, r: 0.3, c: COBALT, a: 0.065, s: 0.00024, p: 5.3 },
      { bx: 0.72, by: 0.22, r: 0.34, c: GOLD, a: 0.05, s: 0.00019, p: 1.7 },
      { bx: 0.28, by: 0.62, r: 0.36, c: COBALT, a: 0.058, s: 0.00012, p: 4.9 },
    ];

    const GLINES = Array.from({ length: 14 }, () => ({
      x1: Math.random(),
      y1: Math.random(),
      x2: Math.random(),
      y2: Math.random(),
      s: 0.00003 + Math.random() * 0.00006,
      p: Math.random() * Math.PI * 2,
      a: 0.014 + Math.random() * 0.022,
      c: Math.random() > 0.5 ? GOLD : COBALT,
    }));

    function seedDots() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      return Array.from({ length: 96 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() * 1.15 + 0.35,
        a: Math.random() * 0.22 + 0.08,
        c: Math.random() > 0.52 ? GOLD : COBALT,
      }));
    }

    let DOTS = seedDots();

    function resize() {
      if (!cv || !cx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      cv.style.width = `${W}px`;
      cv.style.height = `${H}px`;
      cx.setTransform(dpr, 0, 0, dpr, 0, 0);
      for (const d of DOTS) {
        d.x = Math.min(d.x, W - 4);
        d.y = Math.min(d.y, H - 4);
        d.x = Math.max(d.x, 4);
        d.y = Math.max(d.y, 4);
      }
    }

    function paint() {
      if (!running || !cx || !cv) return;
      T++;
      cx.clearRect(0, 0, W, H);

      const parallax = scrollY * 0.045;

      ORBS.forEach((o) => {
        const t = T * o.s;
        const ox = (o.bx + Math.sin(t + o.p) * 0.13) * W;
        const oy = (o.by + Math.cos(t * 0.78 + o.p) * 0.1) * H - parallax * (0.4 + o.r * 0.35);
        const R = o.r * Math.min(W, H) * 0.68;
        const g = cx.createRadialGradient(ox, oy, 0, ox, oy, R);
        g.addColorStop(0, `rgba(${o.c[0]},${o.c[1]},${o.c[2]},${o.a})`);
        g.addColorStop(0.38, `rgba(${o.c[0]},${o.c[1]},${o.c[2]},${o.a * 0.32})`);
        g.addColorStop(0.72, `rgba(${o.c[0]},${o.c[1]},${o.c[2]},${o.a * 0.08})`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        cx.beginPath();
        cx.arc(ox, oy, R, 0, Math.PI * 2);
        cx.fillStyle = g;
        cx.fill();
      });

      GLINES.forEach((l) => {
        const t = T * l.s + l.p;
        const x1 = (l.x1 + Math.sin(t) * 0.055) * W;
        const y1 = (l.y1 + Math.cos(t * 0.8) * 0.055) * H - parallax * 0.25;
        const x2 = (l.x2 + Math.sin(t + 1.8) * 0.055) * W;
        const y2 = (l.y2 + Math.cos(t * 0.9 + 1.4) * 0.055) * H - parallax * 0.25;
        cx.beginPath();
        cx.moveTo(x1, y1);
        cx.lineTo(x2, y2);
        cx.strokeStyle = `rgba(${l.c[0]},${l.c[1]},${l.c[2]},${l.a})`;
        cx.lineWidth = 0.42;
        cx.stroke();
      });

      DOTS.forEach((d) => {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0 || d.x > W) d.vx *= -1;
        if (d.y < 0 || d.y > H) d.vy *= -1;
        cx.beginPath();
        cx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        cx.fillStyle = `rgba(${d.c[0]},${d.c[1]},${d.c[2]},${d.a})`;
        cx.fill();
      });

      const linkMax = 102;
      for (let i = 0; i < DOTS.length; i++) {
        for (let j = i + 1; j < DOTS.length; j++) {
          const dist = Math.hypot(DOTS[i].x - DOTS[j].x, DOTS[i].y - DOTS[j].y);
          if (dist >= linkMax) continue;
          const f = 1 - dist / linkMax;
          const same =
            DOTS[i].c[0] === DOTS[j].c[0] &&
            DOTS[i].c[1] === DOTS[j].c[1] &&
            DOTS[i].c[2] === DOTS[j].c[2];
          const cc = same ? DOTS[i].c : GOLD;
          const base = same ? 0.075 : 0.042;
          cx.beginPath();
          cx.moveTo(DOTS[i].x, DOTS[i].y);
          cx.lineTo(DOTS[j].x, DOTS[j].y);
          cx.strokeStyle = `rgba(${cc[0]},${cc[1]},${cc[2]},${base * f})`;
          cx.lineWidth = same ? 0.32 : 0.22;
          cx.stroke();
        }
      }

      rafId = requestAnimationFrame(paint);
    }

    if (cv && cx) {
      resize();
      window.addEventListener("resize", resize);
      rafId = requestAnimationFrame(paint);
    }

    const aurora = document.getElementById("aurora");
    const placeAurora = (clientX: number, clientY: number) => {
      if (aurora) {
        aurora.style.transform = `translate(${clientX}px,${clientY}px)`;
      }
    };
    placeAurora(window.innerWidth / 2, window.innerHeight * 0.38);
    const onMove = (e: MouseEvent) => {
      placeAurora(e.clientX, e.clientY);
    };
    document.addEventListener("mousemove", onMove);

    const onScrollBg = () => {
      scrollY = window.scrollY;
    };
    const onScroll = () => {
      scrollY = window.scrollY;
      const nav = document.getElementById("nav");
      if (nav) nav.classList.toggle("scrolled", scrollY > 60);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const luxToggle = document.querySelector<HTMLElement>("[data-lux-toggle]");
    const luxLabel = document.querySelector<HTMLElement>("[data-lux-label]");
    const body = document.body;

    const applyLuxPreset = (preset: LuxPreset) => {
      body.setAttribute("data-lux-preset", preset);
      if (luxLabel) {
        luxLabel.textContent = preset === "showroom" ? "Showroom" : "Soft";
      }
    };

    let activePreset: LuxPreset = "showroom";
    const bodyPreset = body.getAttribute("data-lux-preset");
    if (isLuxPreset(bodyPreset)) activePreset = bodyPreset;

    const storedPreset = localStorage.getItem(LUX_PRESET_KEY);
    if (isLuxPreset(storedPreset)) activePreset = storedPreset;
    applyLuxPreset(activePreset);

    const onLuxToggleClick = () => {
      activePreset = activePreset === "showroom" ? "soft" : "showroom";
      applyLuxPreset(activePreset);
      localStorage.setItem(LUX_PRESET_KEY, activePreset);
    };
    luxToggle?.addEventListener("click", onLuxToggleClick);

    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("in");
        });
      },
      { threshold: 0.08 },
    );
    document.querySelectorAll(".rv, .rs").forEach((el) => revealObs.observe(el));

    const statObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const specs: [string, number, string][] = [
            ["st0", 100, "+"],
            ["st1", 5, " ans"],
            ["st2", 4, ""],
            ["st3", 24, "h"],
          ];
          specs.forEach(([id, v, s]) => {
            const elStat = document.getElementById(id);
            if (elStat) countUp(elStat, v, s);
          });
          statObs.unobserve(e.target);
        });
      },
      { threshold: 0.5 },
    );
    const sg = document.querySelector(".stats-grid");
    if (sg) statObs.observe(sg);

    const onPolesMove = (e: Event) => {
      if (!(e instanceof MouseEvent)) return;
      const t = e.target as HTMLElement | null;
      const pole = t?.closest?.(".pole");
      if (pole instanceof HTMLElement) shimPole(pole, e);
    };
    const polesGrid = document.querySelector(".poles-grid");
    polesGrid?.addEventListener("mousemove", onPolesMove);

    const onScrollClick = (e: MouseEvent) => {
      const t = (e.target as HTMLElement).closest("[data-scroll-to]");
      if (!t) return;
      const id = t.getAttribute("data-scroll-to");
      if (!id) return;
      e.preventDefault();
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    };
    document.addEventListener("click", onScrollClick);

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      root?.unmount();
      window.removeEventListener("resize", resize);
      document.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
      revealObs.disconnect();
      statObs.disconnect();
      polesGrid?.removeEventListener("mousemove", onPolesMove);
      document.removeEventListener("click", onScrollClick);
      luxToggle?.removeEventListener("click", onLuxToggleClick);
    };
  }, []);

  return null;
}
