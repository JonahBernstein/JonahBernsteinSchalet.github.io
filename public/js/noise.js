// Noise. What a tracer-based estimator reports when nothing dissolved.
// With zero true dissolution the apparent dissolved fraction is ≈ δ·C_bl / (m·C_f)
// (Obsidian: solid-phase-mrv-bayesian/measurement-phase-false-positives.md):
// a between-round shift δ divided by the tracer signal m. As m → 0 it diverges.
// Assumed for the drawing: C_bl/C_f = 0.6, δ ~ N(0, 1%), lab noise N(0, 0.03),
// credit threshold 0.1. Every point is a simulated zero-dissolution plot.
(function () {
  const svg = document.getElementById("noise-plot");
  if (!svg) return;
  const { clamp, rng, gauss } = Base;
  const NS = "http://www.w3.org/2000/svg";
  const K = 0.6, SD = 0.01, LAB = 0.03, THR = 0.1, MMAX = 0.12, N = 1100;
  const YMIN = -1, YMAX = 1.4;
  const L = 70, R = 970, T = 52, B = 500;
  const X = (m) => L + (m / MMAX) * (R - L);
  const Y = (f) => B - ((clamp(f, YMIN, YMAX) - YMIN) / (YMAX - YMIN)) * (B - T);
  const el = (tag, attrs, parent = svg) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent.appendChild(e); return e; };
  const ink = "#191815", hot = "#b4532a";

  const r = rng(909);
  const pts = Array.from({ length: N }, () => {
    const m = 0.0015 + MMAX * Math.pow(r(), 1.7);
    const f = (gauss(r) * SD * K) / m + gauss(r) * LAB;
    return { m, f, out: f > YMAX || f < YMIN };
  });

  el("line", { x1: L, x2: R, y1: Y(0), y2: Y(0), stroke: ink, "stroke-opacity": 0.35, "stroke-width": 0.8 });
  el("line", { x1: L, x2: L, y1: T, y2: B, stroke: ink, "stroke-width": 0.8 });
  el("line", { x1: L, x2: R, y1: B, y2: B, stroke: ink, "stroke-width": 0.8 });
  [0, 0.03, 0.06, 0.09, 0.12].forEach((m) => {
    el("text", { x: X(m), y: B + 20, "font-size": 12, "text-anchor": "middle", fill: ink, opacity: 0.6 }).textContent = m;
  });
  [-1, -0.5, 0, 0.5, 1].forEach((f) => {
    el("text", { x: L - 10, y: Y(f) + 4, "font-size": 12, "text-anchor": "end", fill: ink, opacity: 0.6 }).textContent = f;
  });
  el("text", { x: R, y: B + 44, "font-size": 13, "text-anchor": "end", fill: ink, opacity: 0.8 }).textContent = "tracer signal (feedstock : soil mass ratio)";
  el("text", { x: L, y: 24, "font-size": 13, fill: ink, opacity: 0.8 }).textContent = "apparent dissolution, when nothing dissolved";

  // the credit threshold, and the hyperbolas the noise lives inside (1 and 2 sd of the shift)
  el("line", { x1: L, x2: R, y1: Y(THR), y2: Y(THR), stroke: hot, "stroke-width": 1.2, "stroke-dasharray": "6 5" });
  el("text", { x: R, y: Y(THR) - 8, "font-size": 12, "text-anchor": "end", fill: hot }).textContent = "credit threshold";
  const env = el("g", { fill: "none", stroke: ink, "stroke-width": 0.8 });
  for (const k of [1, 2, -1, -2]) {
    let d = "";
    for (let i = 0; i <= 200; i++) {
      const m = 0.0008 + (MMAX - 0.0008) * Math.pow(i / 200, 2);
      d += (i ? "L" : "M") + X(m).toFixed(1) + "," + Y((k * SD * K) / m).toFixed(1);
    }
    el("path", { d, "stroke-opacity": Math.abs(k) === 1 ? 0.6 : 0.3, "stroke-dasharray": Math.abs(k) === 1 ? "" : "3 4" }, env);
  }
  const dots = el("g", {});
  for (const pt of pts) {
    const credited = pt.f > THR;
    el(pt.out ? "path" : "circle", pt.out
      ? { d: `M${X(pt.m) - 3},${Y(pt.f)}l3,${pt.f > 0 ? -6 : 6}l3,${pt.f > 0 ? 6 : -6}`, fill: credited ? hot : ink, opacity: credited ? 0.9 : 0.4 }
      : { cx: X(pt.m), cy: Y(pt.f), r: credited ? 2.6 : 2, fill: credited ? hot : ink, opacity: credited ? 0.9 : 0.4 }, dots);
  }
})();
