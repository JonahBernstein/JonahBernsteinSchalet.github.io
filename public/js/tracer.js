// 05 · what a tracer-based estimator reports when nothing dissolved.
// With zero true dissolution the apparent dissolved fraction is ≈ δ·C_bl / (m·C_f)
// (see Obsidian: solid-phase-mrv-bayesian/measurement-phase-false-positives.md):
// a between-round shift δ divided by the tracer signal m. As m → 0 it diverges.
// Assumed for the drawing: C_bl/C_f = 0.6, δ ~ N(0, 1%), lab noise N(0, 0.03),
// credit threshold 0.1. Every point is a simulated zero-dissolution plot.
(function () {
  const section = document.getElementById("tracer");
  const svg = document.getElementById("tracer-plot");
  const { clamp, progress, near, rng, gauss } = Scroll;
  const NS = "http://www.w3.org/2000/svg";

  const K = 0.6, SD = 0.01, LAB = 0.03, THR = 0.1, MMAX = 0.12, N = 1100;
  const YMIN = -1, YMAX = 1.4;
  const L = 70, R = 970, T = 20, B = 500;
  const X = (m) => L + (m / MMAX) * (R - L);
  const Y = (f) => B - ((clamp(f, YMIN, YMAX) - YMIN) / (YMAX - YMIN)) * (B - T);
  const el = (tag, attrs, parent = svg) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent.appendChild(e); return e; };
  const ink = "#191815", hot = "#d0802e";

  const r = rng(909);
  const pts = Array.from({ length: N }, () => {
    const m = 0.0015 + MMAX * Math.pow(r(), 1.7);
    const f = (gauss(r) * SD * K) / m + gauss(r) * LAB;
    return { m, f, out: f > YMAX || f < YMIN };
  }).sort((a, b) => b.m - a.m);

  // axes
  el("line", { x1: L, x2: R, y1: Y(0), y2: Y(0), stroke: ink, "stroke-opacity": 0.35 });
  el("line", { x1: L, x2: L, y1: T, y2: B, stroke: ink, "stroke-opacity": 0.6 });
  el("line", { x1: L, x2: R, y1: B, y2: B, stroke: ink, "stroke-opacity": 0.6 });
  [0, 0.03, 0.06, 0.09, 0.12].forEach((m) => {
    el("text", { x: X(m), y: B + 20, "font-size": 12, "text-anchor": "middle", fill: ink, opacity: 0.55 }).textContent = m;
  });
  [-1, -0.5, 0, 0.5, 1].forEach((f) => {
    el("text", { x: L - 10, y: Y(f) + 4, "font-size": 12, "text-anchor": "end", fill: ink, opacity: 0.55 }).textContent = f;
  });
  el("text", { x: R, y: B + 44, "font-size": 13, "text-anchor": "end", fill: ink, opacity: 0.75 }).textContent = "tracer signal  (feedstock : soil mass ratio)";
  el("text", { x: L + 8, y: T + 4, "font-size": 13, fill: ink, opacity: 0.75 }).textContent = "apparent dissolution, when nothing dissolved";

  // the credit threshold, and the hyperbolas the noise lives inside
  el("line", { x1: L, x2: R, y1: Y(THR), y2: Y(THR), stroke: hot, "stroke-width": 1.5, "stroke-dasharray": "6 5" });
  el("text", { x: R, y: Y(THR) - 8, "font-size": 12, "text-anchor": "end", fill: hot }).textContent = "credit threshold";
  const env = el("g", { fill: "none", stroke: ink, "stroke-width": 1 });
  for (const k of [1, 2, -1, -2]) {
    let d = "";
    for (let i = 0; i <= 200; i++) {
      const m = 0.0008 + (MMAX - 0.0008) * Math.pow(i / 200, 2);
      d += (i ? "L" : "M") + X(m).toFixed(1) + "," + Y((k * SD * K) / m).toFixed(1);
    }
    el("path", { d, "stroke-opacity": Math.abs(k) === 1 ? 0.5 : 0.25, "stroke-dasharray": Math.abs(k) === 1 ? "" : "3 4" }, env);
  }

  const dots = el("g", {});
  const marks = pts.map((pt) => {
    const credited = pt.f > THR;
    return el(pt.out ? "path" : "circle", pt.out
      ? { d: `M${X(pt.m) - 3},${Y(pt.f)}l3,${pt.f > 0 ? -6 : 6}l3,${pt.f > 0 ? 6 : -6}`, fill: credited ? hot : ink, opacity: 0 }
      : { cx: X(pt.m), cy: Y(pt.f), r: credited ? 3 : 2.2, fill: credited ? hot : ink, opacity: 0 }, dots);
  });

  // the sweep: plots appear from strong signal to vanishing signal
  let last = -1;
  Scroll.on(() => {
    if (!near(section, 0)) return;
    const p = progress(section);
    const n = Math.round(clamp((p - 0.06) / 0.8) * N);
    if (n === last) return;
    for (let i = Math.min(n, last < 0 ? 0 : last); i < Math.max(n, last < 0 ? 0 : last); i++) {
      const on = i < n, pt = pts[i];
      marks[i].setAttribute("opacity", on ? (pt.f > THR ? 0.95 : 0.4) : 0);
    }
    last = n;
  });
})();
