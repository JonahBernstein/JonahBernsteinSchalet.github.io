// 02 · a 3D joint distribution you move through. Toy model, synthetic points:
//   ξ  sulfuric share of the acidity doing the weathering
//   f  carbonate share of the weathered cations
//   η  net CO2 drawdown per unit weathering, normalized (silicate + carbonic = 1)
(function () {
  const section = document.getElementById("acid");
  const canvas = document.getElementById("joint");
  const ctx = canvas.getContext("2d");
  const readout = document.getElementById("acid-readout");
  const { clamp, progress, near, rng, gauss } = Scroll;

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
      pts.push({ xi, f, eta });
    }
  }
  const outlier = { xi: 0.78, f: 0.15, eta: 0.97, star: true };
  const toWorld = (p) => [(p.xi - 0.5) * 2, ((p.eta + 0.5) / 1.5) * 2 - 1, (p.f - 0.5) * 2];
  for (const p of pts) p.w = toWorld(p);
  outlier.w = toWorld(outlier);
  const proj = new Float32Array(pts.length * 3);

  let W = 0, H = 0, dpr = 1, R = 1, cx = 0, cy = 0;
  let yawOff = 0, pitchOff = 0, drag = null, hover = -1;
  const pinned = [];

  function size() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    const narrow = W < 860;
    R = Math.min(W * (narrow ? 0.32 : 0.2), H * 0.25);
    cx = W * 0.5;
    cy = H * 0.55;
  }

  let cam = { cy: 1, sy: 0, cp: 1, sp: 0 };
  function project(w, out, o) {
    const x1 = w[0] * cam.cy - w[2] * cam.sy;
    const z1 = w[0] * cam.sy + w[2] * cam.cy;
    const y2 = w[1] * cam.cp - z1 * cam.sp;
    const z2 = w[1] * cam.sp + z1 * cam.cp;
    const k = 4.2 / (4.2 + z2);
    out[o] = cx + x1 * R * k;
    out[o + 1] = cy - y2 * R * k;
    out[o + 2] = k;
  }
  const tmp = new Float32Array(3);
  const P = (x, y, z) => { project([x, y, z], tmp, 0); return [tmp[0], tmp[1]]; };
  function line(a, b) { ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }

  function draw(t) {
    if (!near(section, 0)) return;
    const p = progress(section);
    const drift = reduceMotion ? 0 : Math.sin(t * 0.00012) * 0.06;
    const yaw = -0.75 + p * 1.7 + yawOff + drift;
    const pitch = clamp(0.48 - p * 0.28 + pitchOff, -0.2, 1.2);
    cam = { cy: Math.cos(yaw), sy: Math.sin(yaw), cp: Math.cos(pitch), sp: Math.sin(pitch) };
    const xs = 0.03 + clamp((p - 0.08) / 0.8) * 0.94; // the slice walks along ξ
    const half = 0.035;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 1;

    // floor box
    ctx.strokeStyle = "rgba(235,229,212,.18)";
    const c = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    for (let i = 0; i < 4; i++) line(P(c[i][0], -1, c[i][1]), P(c[(i + 1) % 4][0], -1, c[(i + 1) % 4][1]));
    for (const [x, z] of c) { ctx.setLineDash([2, 4]); line(P(x, -1, z), P(x, 1, z)); ctx.setLineDash([]); }

    // the model surface, as a net
    ctx.strokeStyle = "rgba(235,229,212,.13)";
    for (let i = 0; i <= 10; i++) {
      for (const dir of [0, 1]) {
        ctx.beginPath();
        for (let j = 0; j <= 20; j++) {
          const a = i / 10, b = j / 20;
          const xi = dir ? a : b, f = dir ? b : a;
          const q = P((xi - 0.5) * 2, ((model(xi, f) + 0.5) / 1.5) * 2 - 1, (f - 0.5) * 2);
          j ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]);
        }
        ctx.stroke();
      }
    }

    // axes and their names
    ctx.strokeStyle = "rgba(235,229,212,.75)";
    ctx.fillStyle = "rgba(235,229,212,.85)";
    ctx.font = "12px 'Courier Prime', monospace";
    const o = P(-1, -1, -1);
    const ax = [[P(1.25, -1, -1), "ξ  sulfuric share →"], [P(-1, -1, 1.3), "f  carbonate share →"], [P(-1, 1.25, -1), "η  net CO₂ drawdown ↑"]];
    for (const [end, label] of ax) { line(o, end); ctx.fillText(label, end[0] + 6, end[1] + 4); }

    // the slice plane
    const sx = (xs - 0.5) * 2;
    const q = [P(sx, -1, -1), P(sx, 1, -1), P(sx, 1, 1), P(sx, -1, 1)];
    ctx.fillStyle = "rgba(237,169,74,.07)";
    ctx.strokeStyle = "rgba(237,169,74,.55)";
    ctx.beginPath(); q.forEach((v, i) => (i ? ctx.lineTo(v[0], v[1]) : ctx.moveTo(v[0], v[1]))); ctx.closePath(); ctx.fill(); ctx.stroke();

    // the cloud
    ctx.globalCompositeOperation = "lighter";
    const bins = new Array(24).fill(0);
    let n = 0, sum = 0;
    for (let i = 0; i < pts.length; i++) {
      const pt = pts[i];
      project(pt.w, proj, i * 3);
      const inSlice = Math.abs(pt.xi - xs) < half;
      const k = proj[i * 3 + 2];
      if (inSlice) {
        n++; sum += pt.eta;
        bins[Math.min(23, Math.max(0, Math.floor(((pt.eta + 0.5) / 1.5) * 24)))]++;
        ctx.fillStyle = "rgba(237,169,74,.95)";
        const s = 2.6 * k;
        ctx.fillRect(proj[i * 3] - s / 2, proj[i * 3 + 1] - s / 2, s, s);
      } else {
        ctx.fillStyle = "rgba(217,193,63,.28)";
        const s = 1.6 * k;
        ctx.fillRect(proj[i * 3] - s / 2, proj[i * 3 + 1] - s / 2, s, s);
      }
    }
    ctx.globalCompositeOperation = "source-over";

    // p(η | ξ) drawn inside the slice: bars grow from the back wall
    const maxb = Math.max(1, ...bins);
    ctx.strokeStyle = "rgba(237,169,74,.9)";
    ctx.lineWidth = 2;
    bins.forEach((b, i) => {
      if (!b) return;
      const y = ((i + 0.5) / 24) * 2 - 1;
      line(P(sx, y, -1), P(sx, y, -1 + (b / maxb) * 1.1));
    });
    ctx.lineWidth = 1;

    // the point the model can't hold
    if (p > 0.8) {
      const a = clamp((p - 0.8) / 0.08);
      project(outlier.w, tmp, 0);
      ctx.strokeStyle = `rgba(237,169,74,${a})`;
      ctx.fillStyle = `rgba(255,248,230,${a})`;
      ctx.beginPath(); ctx.arc(tmp[0], tmp[1], 4, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(tmp[0], tmp[1], 11 + Math.sin(t * 0.004) * 2, 0, 7); ctx.stroke();
      ctx.font = `italic ${W < 600 ? 17 : 22}px 'Instrument Serif', serif`;
      const label = "x*";
      const lw = ctx.measureText(label).width;
      if (tmp[0] + 18 + lw > W - 12) ctx.fillText(label, clamp(tmp[0] - lw / 2, 12, W - 12 - lw), tmp[1] - 22);
      else ctx.fillText(label, tmp[0] + 18, tmp[1] - 10);
    }

    // pins and hover
    ctx.font = "11px 'Courier Prime', monospace";
    for (const i of pinned) mark(i, true);
    if (hover >= 0 && !pinned.includes(hover)) mark(hover, false);

    readout.textContent =
      `ξ = ${xs.toFixed(2)}   slice width ±${half}\n` +
      `n in slice = ${n}\n` +
      `E[η | ξ] = ${n ? (sum / n).toFixed(2) : "—"}`;
  }

  function mark(i, pin) {
    const x = proj[i * 3], y = proj[i * 3 + 1], pt = pts[i];
    ctx.strokeStyle = pin ? "#ebe5d4" : "rgba(235,229,212,.7)";
    ctx.beginPath(); ctx.arc(x, y, 6, 0, 7); ctx.stroke();
    if (pin) { line([x - 14, y], [x - 8, y]); line([x + 8, y], [x + 14, y]); line([x, y - 14], [x, y - 8]); line([x, y + 8], [x, y + 14]); }
    ctx.fillStyle = "#ebe5d4";
    ctx.fillText(`ξ ${pt.xi.toFixed(2)}  f ${pt.f.toFixed(2)}  η ${pt.eta.toFixed(2)}`, x + 12, y - 8);
  }

  function nearest(mx, my) {
    let best = -1, bd = 144;
    for (let i = 0; i < pts.length; i++) {
      const dx = proj[i * 3] - mx, dy = proj[i * 3 + 1] - my, d = dx * dx + dy * dy;
      if (d < bd) { bd = d; best = i; }
    }
    return best;
  }
  const local = (e) => { const b = canvas.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };

  canvas.addEventListener("pointerdown", (e) => {
    drag = { x: e.clientX, y: e.clientY, moved: 0 };
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (drag) {
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      drag.moved += Math.abs(dx) + Math.abs(dy);
      yawOff += dx * 0.008; pitchOff += dy * 0.006;
      drag.x = e.clientX; drag.y = e.clientY;
    } else {
      const [mx, my] = local(e);
      hover = nearest(mx, my);
    }
  });
  canvas.addEventListener("pointerup", (e) => {
    if (drag && drag.moved < 5) {
      const [mx, my] = local(e);
      const i = nearest(mx, my);
      if (i >= 0) {
        const at = pinned.indexOf(i);
        at >= 0 ? pinned.splice(at, 1) : pinned.push(i);
        if (pinned.length > 6) pinned.shift();
      }
    }
    drag = null;
  });
  canvas.addEventListener("pointerleave", () => (hover = -1));

  size();
  addEventListener("resize", size);
  Scroll.on(draw);
})();
