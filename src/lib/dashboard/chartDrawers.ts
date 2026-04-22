/** Dessin canvas pour le dashboard (Infinite Core) — rendu hi-DPI & finitions luxe. */

const GOLD = "#c97706";
const GOLD_SOFT = "#e8b84a";
const COBALT = "#2460a7";
const COBALT_SOFT = "#4a8ee8";
const EMERALD_SOFT = "#34d399";
const VIOLET_SOFT = "#a78bfa";
const INK_MUTED = "rgba(94, 90, 104, 0.88)";
const GRID = "rgba(20, 18, 26, 0.045)";
const GRID_STRONG = "rgba(20, 18, 26, 0.075)";

type Pad = { t: number; r: number; b: number; l: number };

function setupHiDpi(
  canvas: HTMLCanvasElement,
): { ctx: CanvasRenderingContext2D; W: number; H: number } | null {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const rect = canvas.getBoundingClientRect();
  const W = Math.max(rect.width, 1);
  const H = Math.max(rect.height, 1);
  const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, W, H };
}

function drawPlotVignette(
  ctx: CanvasRenderingContext2D,
  pad: Pad,
  W: number,
  H: number,
) {
  const x = pad.l - 6;
  const y = pad.t - 4;
  const w = W - pad.l - pad.r + 12;
  const h = H - pad.t - pad.b + 8;
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, "rgba(255, 252, 246, 0.95)");
  g.addColorStop(0.45, "rgba(252, 248, 238, 0.55)");
  g.addColorStop(1, "rgba(244, 238, 224, 0.35)");
  ctx.fillStyle = g;
  ctx.beginPath();
  const r = 12;
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(0, 0, 0, 0.055)";
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawHorizontalGrid(
  ctx: CanvasRenderingContext2D,
  pad: Pad,
  cw: number,
  ch: number,
  steps: number,
  max: number,
) {
  for (let i = 0; i <= steps; i++) {
    const y = pad.t + ch * (1 - i / steps);
    ctx.beginPath();
    ctx.moveTo(pad.l, y);
    ctx.lineTo(pad.l + cw, y);
    ctx.strokeStyle = i === 0 || i === steps ? GRID_STRONG : GRID;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = INK_MUTED;
    ctx.font = "9px var(--font-dm-mono), DM Mono, monospace";
    ctx.textAlign = "right";
    ctx.fillText(`${Math.round((max / steps) * i) / 1000}K`, pad.l - 8, y + 3);
  }
}

export function drawRevChart(canvas: HTMLCanvasElement | null) {
  if (!canvas) return;
  const setup = setupHiDpi(canvas);
  if (!setup) return;
  const { ctx, W, H } = setup;
  const data = [7200, 9100, 8400, 11200, 10600, 12400];
  const months = ["Nov", "Déc", "Jan", "Fév", "Mar", "Avr"];
  const pad: Pad = { t: 22, r: 18, b: 38, l: 48 };
  const cw = W - pad.l - pad.r;
  const ch = H - pad.t - pad.b;
  const max = Math.max(...data) * 1.12;
  ctx.clearRect(0, 0, W, H);
  drawPlotVignette(ctx, pad, W, H);
  drawHorizontalGrid(ctx, pad, cw, ch, 4, max);

  const gap = cw / data.length;
  const bw = Math.min((cw / data.length) * 0.52, 36);
  data.forEach((v, i) => {
    const x = pad.l + gap * i + gap / 2 - bw / 2;
    const bh = ch * (v / max);
    const y = pad.t + ch - bh;
    const g = ctx.createLinearGradient(0, y, 0, y + bh);
    g.addColorStop(0, "rgba(255, 236, 200, 0.98)");
    g.addColorStop(0.35, GOLD_SOFT);
    g.addColorStop(0.72, GOLD);
    g.addColorStop(1, "rgba(201, 119, 6, 0.28)");
    ctx.fillStyle = g;
    const r = 5;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + bw - r, y);
    ctx.quadraticCurveTo(x + bw, y, x + bw, y + r);
    ctx.lineTo(x + bw, y + bh - 1);
    ctx.lineTo(x, y + bh - 1);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
    /* reflet supérieur */
    const rh = Math.min(5, Math.max(2, bh * 0.12));
    if (bw > 8 && rh >= 2) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
      roundRectPath(ctx, x + 2, y + 1, bw - 4, rh, 2);
      ctx.fill();
    }
    ctx.shadowColor = "rgba(201, 119, 6, 0.35)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = goldInk();
    ctx.font = "bold 9px var(--font-dm-mono), DM Mono, monospace";
    ctx.textAlign = "center";
    ctx.fillText(`${(v / 1000).toFixed(1)}K`, x + bw / 2, y - 6);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = INK_MUTED;
    ctx.font = "9px var(--font-dm-mono), DM Mono, monospace";
    ctx.fillText(months[i], x + bw / 2, H - pad.b + 14);
  });
}

function goldInk(): string {
  return "#7a5520";
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawDonutRingSegment(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r0: number,
  r1: number,
  a0: number,
  a1: number,
  c0: string,
  c1: string,
) {
  const mid = (a0 + a1) / 2;
  const gx = cx + Math.cos(mid) * (r1 * 0.35);
  const gy = cy + Math.sin(mid) * (r1 * 0.35);
  const g = ctx.createRadialGradient(gx, gy, r0 * 0.4, cx, cy, r1 * 1.05);
  g.addColorStop(0, c0);
  g.addColorStop(0.55, c1);
  g.addColorStop(1, withAlpha(c1, 0.75));
  ctx.beginPath();
  ctx.arc(cx, cy, r1, a0, a1);
  ctx.arc(cx, cy, r0, a1, a0, true);
  ctx.closePath();
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
  ctx.lineWidth = 1;
  ctx.stroke();
}

function withAlpha(hex: string, a: number): string {
  if (hex.startsWith("rgba") || hex.startsWith("rgb")) return hex;
  const h = hex.slice(1);
  if (h.length === 6) {
    const n = parseInt(h, 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    return `rgba(${r},${g},${b},${a})`;
  }
  return hex;
}

export function drawDonut(canvas: HTMLCanvasElement | null) {
  if (!canvas) return;
  const setup = setupHiDpi(canvas);
  if (!setup) return;
  const { ctx, W, H } = setup;
  const S = Math.min(W, H);
  const k = S / 120;
  const cx = W / 2;
  const cy = H / 2;
  const r1 = 50 * k;
  const r0 = 31 * k;
  const data: { v: number; c0: string; c1: string }[] = [
    { v: 42, c0: "#fff4d6", c1: GOLD_SOFT },
    { v: 31, c0: "#dbeafe", c1: COBALT_SOFT },
    { v: 18, c0: "#d1fae5", c1: EMERALD_SOFT },
    { v: 9, c0: "#ede9fe", c1: VIOLET_SOFT },
  ];
  let angle = -Math.PI / 2;
  ctx.clearRect(0, 0, W, H);
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, cy + r1 * 0.18, r1 * 0.88, r1 * 0.2, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0, 0, 0, 0.07)";
  ctx.filter = "blur(8px)";
  ctx.fill();
  ctx.restore();
  data.forEach((d) => {
    const a = (d.v / 100) * Math.PI * 2;
    drawDonutRingSegment(ctx, cx, cy, r0, r1, angle, angle + a, d.c0, d.c1);
    angle += a;
  });
  /* trou central — papier chaud */
  const hole = ctx.createRadialGradient(cx, cy - r0 * 0.2, 0, cx, cy, r0);
  hole.addColorStop(0, "#fffefb");
  hole.addColorStop(0.65, "#f4efe4");
  hole.addColorStop(1, "#e8e0d2");
  ctx.beginPath();
  ctx.arc(cx, cy, r0, 0, Math.PI * 2);
  ctx.fillStyle = hole;
  ctx.fill();
  ctx.strokeStyle = "rgba(0, 0, 0, 0.06)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = GOLD;
  ctx.font = `bold ${Math.max(12, 15 * k)}px var(--font-fraunces), Fraunces, serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(201, 119, 6, 0.25)";
  ctx.shadowBlur = 8;
  ctx.fillText("10M", cx, cy - 5 * k);
  ctx.shadowBlur = 0;
  ctx.fillStyle = INK_MUTED;
  ctx.font = `${Math.max(7, 8 * k)}px var(--font-dm-mono), DM Mono, monospace`;
  ctx.fillText("FCFA", cx, cy + 8 * k);
}

export function drawFinChart(canvas: HTMLCanvasElement | null) {
  if (!canvas) return;
  const setup = setupHiDpi(canvas);
  if (!setup) return;
  const { ctx, W, H } = setup;
  const rev = [5800, 7200, 8100, 9400, 10800, 12400];
  const cha = [3200, 3800, 4100, 4400, 5000, 5200];
  const months = ["Nov", "Déc", "Jan", "Fév", "Mar", "Avr"];
  const pad: Pad = { t: 26, r: 16, b: 38, l: 52 };
  const cw = W - pad.l - pad.r;
  const ch = H - pad.t - pad.b;
  const max = 14000;
  ctx.clearRect(0, 0, W, H);
  drawPlotVignette(ctx, pad, W, H);
  drawHorizontalGrid(ctx, pad, cw, ch, 4, max);

  function drawSeries(
    dataPts: number[],
    lineTop: string,
    lineBot: string,
    fillTop: string,
    fillBot: string,
  ) {
    const pts = dataPts.map((v, i) => ({
      x: pad.l + (cw / (dataPts.length - 1)) * i,
      y: pad.t + ch * (1 - v / max),
    }));
    const areaGrad = ctx.createLinearGradient(0, pad.t, 0, pad.t + ch);
    areaGrad.addColorStop(0, fillTop);
    areaGrad.addColorStop(1, fillBot);
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pad.t + ch);
    pts.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.lineTo(pts[pts.length - 1].x, pad.t + ch);
    ctx.closePath();
    ctx.fillStyle = areaGrad;
    ctx.fill();
    ctx.beginPath();
    pts.forEach((p, i) =>
      i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y),
    );
    ctx.strokeStyle = lineBot;
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalAlpha = 0.22;
    ctx.stroke();
    ctx.globalAlpha = 1;
    const lineGrad = ctx.createLinearGradient(pad.l, pad.t, pad.l + cw, pad.t);
    lineGrad.addColorStop(0, lineBot);
    lineGrad.addColorStop(0.5, lineTop);
    lineGrad.addColorStop(1, lineBot);
    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = 2.25;
    ctx.shadowColor =
      lineTop === GOLD_SOFT ? "rgba(201, 119, 6, 0.35)" : "rgba(36, 96, 167, 0.3)";
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.shadowBlur = 0;
    pts.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = lineTop;
      ctx.fill();
    });
  }

  drawSeries(
    cha,
    COBALT_SOFT,
    COBALT,
    "rgba(74, 142, 232, 0.18)",
    "rgba(36, 96, 167, 0.02)",
  );
  drawSeries(rev, GOLD_SOFT, GOLD, "rgba(232, 184, 74, 0.22)", "rgba(201, 119, 6, 0.02)");

  months.forEach((m, i) => {
    ctx.fillStyle = INK_MUTED;
    ctx.font = "9px var(--font-dm-mono), DM Mono, monospace";
    ctx.textAlign = "center";
    ctx.fillText(m, pad.l + (cw / (months.length - 1)) * i, H - pad.b + 14);
  });

  const lx = W - 108;
  const ly = 10;
  drawLegendSwatch(ctx, lx, ly, GOLD_SOFT, "Revenus");
  drawLegendSwatch(ctx, lx, ly + 14, COBALT_SOFT, "Charges");
}

function drawLegendSwatch(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  label: string,
) {
  const g = ctx.createLinearGradient(x, y, x + 18, y);
  g.addColorStop(0, color);
  g.addColorStop(1, withAlpha(color, 0.65));
  ctx.fillStyle = g;
  roundRectPath(ctx, x, y, 16, 4, 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(0, 0, 0, 0.08)";
  ctx.lineWidth = 0.5;
  ctx.stroke();
  ctx.fillStyle = INK_MUTED;
  ctx.font = "9px var(--font-dm-mono), DM Mono, monospace";
  ctx.textAlign = "left";
  ctx.fillText(label, x + 22, y + 4);
}
