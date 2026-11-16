// Sulfur. A joint distribution to walk around. Toy model, synthetic points (not data):
//   ξ  sulfuric share of the acidity doing the weathering
//   f  carbonate share of the weathered cations
//   η  net CO2 drawdown per unit weathering, normalized (silicate + carbonic = 1)
// A slice travels along ξ and shows the spread of η inside it. Drag to turn.
(function () {
  const { plate, clamp, rng, gauss, reduceMotion } = Base;
  const canvas = document.getElementById("sulfur");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const readout = document.getElementById("sulfur-readout");
  const INK = "25,24,21", BLUE = "63,100,115";

  const model = (xi, f) => (1 - xi) * ((1 - f) * 1 + f * 0.5) + xi * (f * -0.5);
  const r = rng(77);
  const reflect = (v) => (v < 0 ? -v : v > 1 ? 2 - v : v);
  // a handful of "catchments", each a cloud in (ξ, f)
  const sites = Array.from({ length: 9 }, () => ({
    xi: r(), f: r(), sx: 0.04 + r() * 0.12, sf: 0.04 + r() * 0.14, rho: (r() - 0.5) * 1.4, n: 300 + r() * 600,
  }));
  const pts = [];
  for (const s of sites) {
    for (let i = 0; i < s.n; i++) {
      const a = gauss(r), b = gauss(r);
      const xi = reflect(s.xi + s.sx * a);
      const f = reflect(s.f + s.sf * (s.rho * a + Math.sqrt(Math.max(0, 1 - s.rho * s.rho)) * b));
      const eta = model(xi, f) + gauss(r) * 0.055;
      pts.push({ xi, eta, w: [(xi - 0.5) * 2, ((eta + 0.5) / 1.5) * 2 - 1, (f - 0.5) * 2] });
    }
  }

  let R = 1, cx = 0, cy = 0, yawOff = 0, pitchOff = 0, drag = null, clock = 0, last = 0;
  let cam = { cy: 1, sy: 0, cp: 1, sp: 0 };
  const out = [0, 0, 0];
  function P(x, y, z) {
    const x1 = x * cam.cy - z * cam.sy, z1 = x * cam.sy + z * cam.cy;
    const y2 = y * cam.cp - z1 * cam.sp, z2 = y * cam.sp + z1 * cam.cp;
    const k = 4.2 / (4.2 + z2);
    out[0] = cx + x1 * R * k; out[1] = cy - y2 * R * k; out[2] = k;
    return out;
  }
  const Q = (x, y, z) => { P(x, y, z); return [out[0], out[1]]; };
  const line = (a, b) => { ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); };

  const p0 = plate(canvas, {
    size(p) {
      R = Math.min(p.W * 0.25, p.H * 0.33);
      cx = p.W * 0.5; cy = p.H * 0.57;
    },
    draw(t, p) {
      const dt = Math.min(60, t - last || 16);
      last = t;
      if (!reduceMotion && !drag) { clock += dt; p.dirty = true; }
      // the slice goes out and back along ξ in 40 s; the view sways a little
      const u = 0.5 - 0.5 * Math.cos((clock / 40000) * 2 * Math.PI);
      const xs = 0.03 + u * 0.94, half = 0.035;
      const yaw = -0.62 + Math.sin(clock * 0.00011) * 0.22 + yawOff;
      const pitch = clamp(0.36 + pitchOff, -0.2, 1.2);
      cam = { cy: Math.cos(yaw), sy: Math.sin(yaw), cp: Math.cos(pitch), sp: Math.sin(pitch) };

      ctx.setTransform(p.dpr, 0, 0, p.dpr, 0, 0);
      ctx.clearRect(0, 0, p.W, p.H);
      ctx.lineWidth = 0.7; ctx.setLineDash([]);

      // floor and corner posts
      ctx.strokeStyle = `rgba(${INK},.3)`;
      const c = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
      for (let i = 0; i < 4; i++) line(Q(c[i][0], -1, c[i][1]), Q(c[(i + 1) % 4][0], -1, c[(i + 1) % 4][1]));
      ctx.setLineDash([2, 4]);
      for (const [x, z] of c) line(Q(x, -1, z), Q(x, 1, z));
      ctx.setLineDash([]);

      // the model surface, as a net
      ctx.strokeStyle = `rgba(${INK},.16)`; ctx.lineWidth = 0.6;
      for (let i = 0; i <= 10; i++) for (const dir of [0, 1]) {
        ctx.beginPath();
        for (let j = 0; j <= 20; j++) {
          const a = i / 10, b = j / 20, xi = dir ? a : b, f = dir ? b : a;
          P((xi - 0.5) * 2, ((model(xi, f) + 0.5) / 1.5) * 2 - 1, (f - 0.5) * 2);
          j ? ctx.lineTo(out[0], out[1]) : ctx.moveTo(out[0], out[1]);
        }
        ctx.stroke();
      }

      // axes and their names
      ctx.strokeStyle = `rgba(${INK},.85)`; ctx.fillStyle = `rgba(${INK},.85)`; ctx.lineWidth = 0.8;
      ctx.font = `${p.W < 520 ? 10 : 11.5}px 'Courier Prime', monospace`;
      const o = Q(-1, -1, -1);
      for (const [end, name] of [[Q(1.22, -1, -1), "ξ sulfuric share"], [Q(-1, -1, 1.26), "f carbonate share"], [Q(-1, 1.2, -1), "η net CO₂ drawdown"]]) {
        line(o, end);
        const w = ctx.measureText(name).width;
        ctx.fillText(name, clamp(end[0] + 6, 4, p.W - w - 4), end[1] + 4);
      }

      // the cloud, and the part of it inside the slice
      const bins = new Array(24).fill(0);
      let n = 0, sum = 0;
      ctx.fillStyle = `rgba(${INK},.3)`;
      for (const pt of pts) {
        if (Math.abs(pt.xi - xs) < half) continue;
        P(pt.w[0], pt.w[1], pt.w[2]);
        const s = 1.35 * out[2];
        ctx.fillRect(out[0] - s / 2, out[1] - s / 2, s, s);
      }
      const sx = (xs - 0.5) * 2;
      const q = [Q(sx, -1, -1), Q(sx, 1, -1), Q(sx, 1, 1), Q(sx, -1, 1)];
      ctx.fillStyle = `rgba(${BLUE},.07)`; ctx.strokeStyle = `rgba(${BLUE},.7)`;
      ctx.beginPath(); q.forEach((v, i) => (i ? ctx.lineTo(v[0], v[1]) : ctx.moveTo(v[0], v[1]))); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = `rgb(${BLUE})`;
      for (const pt of pts) {
        if (Math.abs(pt.xi - xs) >= half) continue;
        n++; sum += pt.eta;
        bins[clamp(Math.floor(((pt.eta + 0.5) / 1.5) * 24), 0, 23)]++;
        P(pt.w[0], pt.w[1], pt.w[2]);
        const s = 2.3 * out[2];
        ctx.fillRect(out[0] - s / 2, out[1] - s / 2, s, s);
      }
      // the spread of η inside the slice: bars growing from its back edge
      const maxb = Math.max(1, ...bins);
      ctx.strokeStyle = `rgb(${BLUE})`; ctx.lineWidth = 1.6;
      bins.forEach((b, i) => {
        if (!b) return;
        const y = ((i + 0.5) / 24) * 2 - 1;
        line(Q(sx, y, -1), Q(sx, y, -1 + (b / maxb) * 1.1));
      });
      readout.textContent = `ξ = ${xs.toFixed(2)} ± ${half}\nn = ${n}\nmean η = ${n ? (sum / n).toFixed(2) : "—"}`;
    },
  });

  canvas.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, y: e.clientY }; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener("pointermove", (e) => {
    if (!drag) return;
    yawOff += (e.clientX - drag.x) * 0.008; pitchOff += (e.clientY - drag.y) * 0.006;
    drag.x = e.clientX; drag.y = e.clientY;
    p0.dirty = true;
  });
  const end = () => { drag = null; p0.dirty = true; };
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", end);
})();
