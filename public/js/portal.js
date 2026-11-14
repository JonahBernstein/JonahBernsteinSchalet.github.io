// The gate. A single pale-blue sphere turns inside a broken mandala,
// under a weather of ruled lines, arcs and shards. Click the sphere to fall in.
(function () {
  const portal = document.getElementById("portal");
  const root = document.documentElement;
  if (!portal) return;
  if (!root.classList.contains("gated")) { portal.remove(); return; }

  const canvas = document.getElementById("portal-canvas");
  const hit = document.getElementById("portal-sphere");
  const btn = document.getElementById("portal-enter");
  const ctx = canvas.getContext("2d");
  const { clamp, rng, gauss } = Scroll;
  const ease = (x) => x * x * (3 - 2 * x);
  const TAU = Math.PI * 2;

  const DEEP = "12,20,19", BONE = "236,230,214", HAZE = "169,188,198", GOLD = "232,217,166";
  const QUILT = [[169, 188, 198], [111, 147, 163], [46, 106, 105], [31, 74, 76], [232, 217, 166], [138, 74, 43], [217, 184, 210], [63, 100, 115], [201, 178, 124]];
  const SHARDS = [HAZE, HAZE, "111,147,163", "46,106,105", GOLD, "138,74,43", "217,184,210", BONE];
  const NL = 16; // meridians only: lines of longitude, no grid
  const TILT = 0.42, ROLL = -0.22;
  const cT = Math.cos(TILT), sT = Math.sin(TILT), cR = Math.cos(ROLL), sR = Math.sin(ROLL);
  const LIGHT = (() => { const l = Math.hypot(0.45, 0.55, 0.7); return [-0.45 / l, 0.55 / l, 0.7 / l]; })();

  let W = 0, H = 0, dpr = 1, cx = 0, cy = 0, R = 100, far = 1000;
  let ground = null, rings = null, buckets = null;
  let t0 = 0, lastT = 0, leaveAt = 0, done = false;
  let yaw = 0, spin = 0, hot = 0, hotTarget = 0, mx = 0, my = 0, pmx = 0, pmy = 0;

  /* ——— the still layer: everything ruled, flung or stamped ——— */
  function buildGround() {
    const r = rng(1879), pick = (a) => a[Math.floor(r() * a.length)];
    ground = document.createElement("canvas");
    ground.width = Math.round(W * dpr); ground.height = Math.round(H * dpr);
    const g = ground.getContext("2d");
    g.scale(dpr, dpr);
    g.lineCap = "round"; g.lineJoin = "round";
    const dens = clamp((W * H) / 1.3e6, 0.5, 1.4);
    const seg = (x1, y1, x2, y2, col, a, w) => {
      g.strokeStyle = `rgba(${col},${a})`; g.lineWidth = w;
      g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
    };
    // keeps shards and signs out of the mandala's heart
    const away = (x, y, min) => {
      const d = Math.hypot(x - cx, y - cy) || 1;
      return d >= min ? [x, y] : [cx + ((x - cx) / d) * min, cy + ((y - cy) / d) * min];
    };

    // faint planes, like sheets of tracing paper
    for (let k = 0; k < 4; k++) {
      g.fillStyle = `rgba(${r() < 0.5 ? HAZE : BONE},${0.025 + r() * 0.035})`;
      g.beginPath();
      for (let i = 0; i < 4; i++) g.lineTo(W * (-0.2 + r() * 1.4), H * (-0.2 + r() * 1.4));
      g.closePath(); g.fill();
    }

    // perspective fans: bundles of lines sharing a vanishing point
    const aims = [];
    for (let k = 0; k < 6; k++) {
      const ang = r() * TAU, dist = far * (0.25 + r() * 0.55);
      const vx = cx + Math.cos(ang) * dist, vy = cy + Math.sin(ang) * dist;
      const aim = Math.atan2(cy - vy, cx - vx) + (r() - 0.5) * 1.1;
      const spread = 0.16 + r() * 0.4, n = Math.round((22 + r() * 34) * dens);
      aims.push(aim);
      for (let i = 0; i < n; i++) {
        const a = aim + (r() - 0.5) * spread, c = Math.cos(a), s = Math.sin(a);
        const s0 = far * (0.04 + r() * 0.4), s1 = s0 + far * (0.15 + r() * 0.9);
        seg(vx + c * s0, vy + s * s0, vx + c * s1, vy + s * s1, BONE, 0.06 + r() * 0.22, r() < 0.12 ? 1.2 : 0.55);
      }
    }

    // ruled bundles, like staves or scaffolding
    for (let k = 0; k < 7; k++) {
      const x = W * r(), y = H * r(), a = pick(aims) + (r() < 0.5 ? 0 : Math.PI / 2) + (r() - 0.5) * 0.1;
      const c = Math.cos(a), s = Math.sin(a), n = 5 + Math.floor(r() * 9), gap = 3 + r() * 6, len = far * (0.08 + r() * 0.34);
      const al = 0.1 + r() * 0.2;
      for (let i = 0; i < n; i++) {
        const ox = -s * gap * i, oy = c * gap * i, j = r() * len * 0.2;
        seg(x + ox + c * j, y + oy + s * j, x + ox + c * len, y + oy + s * len, BONE, al, 0.55);
      }
    }

    // sweeping arcs, some in concentric sets
    for (let k = 0; k < Math.round(22 * dens); k++) {
      const ox = W * (-0.2 + r() * 1.4), oy = H * (-0.2 + r() * 1.4), rad = far * (0.06 + r() * 0.6);
      const a0 = r() * TAU, sw = 0.25 + r() * 1.3, sets = r() < 0.3 ? 3 + Math.floor(r() * 4) : 1, gap = 4 + r() * 8;
      g.strokeStyle = `rgba(${r() < 0.2 ? HAZE : BONE},${0.08 + r() * 0.2})`; g.lineWidth = 0.6;
      for (let i = 0; i < sets; i++) { g.beginPath(); g.arc(ox, oy, rad + i * gap, a0, a0 + sw); g.stroke(); }
    }

    // shards of flat colour
    for (let k = 0; k < Math.round(12 * dens) + 3; k++) {
      const [x, y] = away(W * r(), H * r(), R * (2.3 + r()));
      const a = r() < 0.6 ? pick(aims) + (r() - 0.5) * 0.2 : r() * TAU;
      const len = 40 + r() * r() * 420, wid = 2 + r() * r() * 34, tp = 0.2 + r() * 0.8;
      const c = Math.cos(a), s = Math.sin(a), nx = -s, ny = c, col = pick(SHARDS);
      g.beginPath();
      g.moveTo(x + (nx * wid) / 2, y + (ny * wid) / 2);
      g.lineTo(x + c * len + (nx * wid * tp) / 2, y + s * len + (ny * wid * tp) / 2);
      g.lineTo(x + c * len - (nx * wid * tp) / 2, y + s * len - (ny * wid * tp) / 2);
      g.lineTo(x - (nx * wid) / 2, y - (ny * wid) / 2);
      g.closePath();
      if (r() < 0.25) { g.strokeStyle = `rgba(${col},.7)`; g.lineWidth = 0.8; g.stroke(); }
      else { g.fillStyle = `rgba(${col},${0.45 + r() * 0.45})`; g.fill(); }
    }

    // swarms of flecks
    for (let k = 0; k < Math.round(12 * dens); k++) {
      const ox = W * r(), oy = H * r(), a = r() * TAU, c = Math.cos(a), s = Math.sin(a);
      const n = 25 + r() * 70, sp = 20 + r() * 60;
      g.strokeStyle = `rgba(${BONE},${0.2 + r() * 0.4})`; g.lineWidth = 0.8;
      g.beginPath();
      for (let i = 0; i < n; i++) {
        const al = gauss(r) * sp * 3, ac = gauss(r) * sp * 0.5, l = 2 + r() * 10, aa = a + (r() - 0.5) * 0.3;
        const x = ox + c * al - s * ac, y = oy + s * al + c * ac;
        g.moveTo(x, y); g.lineTo(x + Math.cos(aa) * l, y + Math.sin(aa) * l);
      }
      g.stroke();
    }

    // Klee's signs: arrows, a moon, a stair, a magic square, a fermata, a line out walking
    for (let k = 0; k < 6; k++) {
      const [x, y] = away(W * (0.08 + r() * 0.84), H * (0.1 + r() * 0.8), R * 3);
      const a = k < 3 ? Math.atan2(cy - y, cx - x) + (r() - 0.5) * 0.3 : r() * TAU; // half of them point at the sphere
      const len = 34 + r() * 70, c = Math.cos(a), s = Math.sin(a), hx = x + c * len, hy = y + s * len;
      g.strokeStyle = g.fillStyle = r() < 0.3 ? "rgba(138,74,43,.95)" : `rgba(${BONE},.85)`;
      g.lineWidth = 1.8;
      g.beginPath(); g.moveTo(x, y); g.lineTo(hx, hy); g.stroke();
      g.beginPath();
      g.moveTo(hx + c * 7, hy + s * 7); g.lineTo(hx - c * 5 - s * 6, hy - s * 5 + c * 6); g.lineTo(hx - c * 5 + s * 6, hy - s * 5 - c * 6);
      g.closePath(); g.fill();
    }
    {
      const rr = clamp(R * 0.16, 10, 22), m = document.createElement("canvas");
      m.width = m.height = Math.ceil((rr * 2 + 2) * dpr);
      const q = m.getContext("2d");
      q.scale(dpr, dpr);
      q.fillStyle = `rgb(${GOLD})`; q.beginPath(); q.arc(rr + 1, rr + 1, rr, 0, TAU); q.fill();
      q.globalCompositeOperation = "destination-out";
      q.beginPath(); q.arc(rr + 1 + rr * 0.45, rr + 1 - rr * 0.15, rr * 0.92, 0, TAU); q.fill();
      g.drawImage(m, W * 0.8 - rr, H * 0.17 - rr, m.width / dpr, m.height / dpr);
    }
    {
      let x = W * 0.16, y = H * 0.25;
      const st = clamp(R * 0.09, 7, 13);
      g.strokeStyle = `rgba(${BONE},.55)`; g.lineWidth = 1;
      g.beginPath(); g.moveTo(x, y);
      for (let i = 0; i < 7; i++) { x += st; g.lineTo(x, y); y -= st; g.lineTo(x, y); }
      g.stroke();
    }
    {
      const s = clamp(R * 0.085, 7, 13), x0 = W * 0.1, y0 = H * 0.72;
      for (let j = 0; j < 4; j++) for (let i = 0; i < 5; i++) {
        if (r() < 0.15) continue;
        g.fillStyle = `rgba(${pick(QUILT)},.85)`;
        g.fillRect(x0 + i * (s + 2) + (r() - 0.5) * 1.5, y0 + j * (s + 2) + (r() - 0.5) * 1.5, s, s);
      }
    }
    {
      const x = W * 0.88, y = H * 0.66;
      g.strokeStyle = g.fillStyle = `rgba(${BONE},.7)`; g.lineWidth = 1.4;
      g.beginPath(); g.arc(x, y, 12, Math.PI, TAU); g.stroke();
      g.beginPath(); g.arc(x, y - 3, 2, 0, TAU); g.fill();
    }
    {
      let x = W * 0.06, y = H * 0.9, a = -0.25;
      const st = Math.max(7, W / 75), loopAt = 18 + Math.floor(r() * 10);
      g.strokeStyle = `rgba(${BONE},.6)`; g.lineWidth = 1.1;
      g.beginPath(); g.moveTo(x, y);
      for (let i = 0; i < 70; i++) {
        if (i >= loopAt && i < loopAt + 12) a -= TAU / 12;
        else a += (r() - 0.5) * 0.7 + (-0.15 - a) * 0.08;
        x += Math.cos(a) * st; y += Math.sin(a) * st;
        g.lineTo(x, y);
      }
      g.stroke();
    }
    g.strokeStyle = `rgba(${BONE},.6)`; g.lineWidth = 0.9;
    for (let k = 0; k < 7; k++) {
      const [x, y] = away(W * r(), H * r(), R * 2.8);
      g.beginPath();
      for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI + 0.3; g.moveTo(x - Math.cos(a) * 5, y - Math.sin(a) * 5); g.lineTo(x + Math.cos(a) * 5, y + Math.sin(a) * 5); }
      g.stroke();
    }

    // hush the heart, the word and the corners
    const hush = (x, y, r0, r1, a) => {
      const gr = g.createRadialGradient(x, y, r0, x, y, r1);
      gr.addColorStop(0, `rgba(${DEEP},${a})`); gr.addColorStop(1, `rgba(${DEEP},0)`);
      g.fillStyle = gr; g.fillRect(0, 0, W, H);
    };
    hush(cx, cy, R * 1.1, R * 3.1, 0.86);
    hush(cx, H - Math.max(54, H * 0.085), 10, 150, 0.8);
    const gr = g.createRadialGradient(cx, cy, far * 0.3, cx, cy, far * 0.6);
    gr.addColorStop(0, "rgba(4,8,8,0)"); gr.addColorStop(1, "rgba(4,8,8,.78)");
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
  }

  /* ——— the mandala: rings with pieces missing, each turning at its own rate ——— */
  function buildRings() {
    const r = rng(40);
    const keep = (n, p) => Array.from({ length: n }, () => r() > p);
    rings = [
      { kind: "ticks", rad: 1.3, n: 96, len: 0.05, long: 8, a: 0.7, w: 0.7, speed: 0.05, on: keep(96, 0.12) },
      { kind: "petals", rad: 1.1, n: 12, a: 0.3, w: 0.7, speed: -0.03, on: keep(12, 0.17) },
      { kind: "star", rad: 2.1, n: 16, k: 5, a: 0.32, w: 0.6, speed: 0.02, on: keep(16, 0.2) },
      { kind: "ticks", rad: 2.14, n: 144, len: 0.03, long: 9, a: 0.55, w: 0.6, speed: 0.02, on: keep(144, 0.2) },
      { kind: "beads", rad: 2.56, n: 36, a: 0.6, w: 0.7, speed: -0.025, on: keep(36, 0.3), fill: Array.from({ length: 36 }, () => (r() < 0.22 ? (r() < 0.4 ? GOLD : HAZE) : null)) },
      { kind: "arcs", rad: 2.72, n: 9, a: 0.45, w: 0.6, speed: 0.015, on: keep(9, 0.3) },
      { kind: "rays", rad: 2.9, n: 48, a: 0.3, w: 0.5, speed: 0.008, on: keep(48, 0.25), len: Array.from({ length: 48 }, () => 0.2 + r() * r() * 2.6) },
    ];
    rings.forEach((g, i) => { g.phase = r() * TAU; g.delay = 500 + i * 220; });
  }

  function drawRings(t, k) {
    ctx.save();
    ctx.translate(cx + pmx * 5, cy + pmy * 5);
    for (const g of rings) {
      const f = ease(clamp((t - g.delay) / 1500));
      if (f <= 0) continue;
      const rot = g.phase + spin * g.speed, rad = g.rad * R, n = g.n, m = Math.ceil(n * f);
      ctx.strokeStyle = `rgba(${BONE},${g.a * k})`; ctx.lineWidth = g.w;
      ctx.beginPath();
      for (let i = 0; i < m; i++) {
        if (!g.on[i]) continue;
        const a = rot + (i / n) * TAU, c = Math.cos(a), s = Math.sin(a);
        if (g.kind === "ticks") {
          const L = R * g.len * (i % g.long === 0 ? 2.6 : 1);
          ctx.moveTo(c * rad, s * rad); ctx.lineTo(c * (rad + L), s * (rad + L));
        } else if (g.kind === "petals") {
          const rho = R * 0.9;
          ctx.moveTo(c * rad + rho, s * rad); ctx.arc(c * rad, s * rad, rho, 0, TAU);
        } else if (g.kind === "star") {
          const b = rot + ((i + g.k) / n) * TAU;
          ctx.moveTo(c * rad, s * rad); ctx.lineTo(Math.cos(b) * rad, Math.sin(b) * rad);
        } else if (g.kind === "beads") {
          const br = Math.max(2, R * 0.03);
          ctx.moveTo(c * rad + br, s * rad); ctx.arc(c * rad, s * rad, br, 0, TAU);
        } else if (g.kind === "arcs") {
          const span = (TAU / n) * 0.72;
          ctx.moveTo(c * rad, s * rad); ctx.arc(0, 0, rad, a, a + span);
          ctx.moveTo(c * (rad + 5), s * (rad + 5)); ctx.arc(0, 0, rad + 5, a, a + span * 0.5);
        } else {
          const L = g.len[i] * R;
          ctx.moveTo(c * rad, s * rad); ctx.lineTo(c * (rad + L), s * (rad + L));
        }
      }
      ctx.stroke();
      if (g.kind === "beads") {
        const br = Math.max(2, R * 0.03);
        for (let i = 0; i < m; i++) {
          if (!g.on[i] || !g.fill[i]) continue;
          const a = rot + (i / n) * TAU;
          ctx.fillStyle = `rgba(${g.fill[i]},${0.9 * k})`;
          ctx.beginPath(); ctx.arc(Math.cos(a) * rad, Math.sin(a) * rad, br, 0, TAU); ctx.fill();
        }
      }
    }
    ctx.restore();
  }

  /* ——— dashes in orbit: an armillary of tilted tracks ——— */
  function buildMarks() {
    const r = rng(7);
    const planes = Array.from({ length: 5 }, () => { const tilt = r() * Math.PI; return { c: Math.cos(tilt), s: Math.sin(tilt), e: 0.28 + r() * 0.7 }; });
    const top = (far * 0.55) / R;
    const tracks = Array.from({ length: 16 }, (_, i) => R * (1.22 + Math.pow((i + r()) / 16, 1.6) * (top - 1.22)));
    const styles = [];
    for (const col of [BONE, BONE, HAZE, GOLD]) for (const a of [0.2, 0.38, 0.6]) styles.push({ col, a, w: a > 0.5 ? 1 : 0.7, list: [] });
    const n = Math.round(clamp((W * H) / 1500, 300, 950));
    for (let i = 0; i < n; i++) {
      const rho = tracks[Math.floor(r() * tracks.length)] * (1 + gauss(r) * 0.012);
      const b = styles[Math.floor(Math.pow(r(), 0.8) * styles.length)];
      b.list.push({ pl: planes[Math.floor(r() * planes.length)], rho, th: r() * TAU, om: 0.14 * Math.pow((1.4 * R) / rho, 1.2) * (0.7 + r() * 0.6), len: 3 + r() * 13 });
    }
    buckets = styles;
  }

  function drawMarks(front, mul) {
    if (mul <= 0) return;
    for (const b of buckets) {
      ctx.strokeStyle = `rgba(${b.col},${b.a * mul})`; ctx.lineWidth = b.w;
      ctx.beginPath();
      for (const m of b.list) {
        const th = m.th + spin * m.om, sn = Math.sin(th);
        if (sn > 0 !== front) continue;
        const cs = Math.cos(th), pl = m.pl;
        const x = m.rho * cs, y = m.rho * pl.e * sn;
        let tx = -sn, ty = pl.e * cs;
        const tl = m.len / 2 / Math.hypot(tx, ty);
        tx *= tl; ty *= tl;
        const X = cx + x * pl.c - y * pl.s, Y = cy + x * pl.s + y * pl.c;
        const TX = tx * pl.c - ty * pl.s, TY = tx * pl.s + ty * pl.c;
        ctx.moveTo(X - TX, Y - TY); ctx.lineTo(X + TX, Y + TY);
      }
      ctx.stroke();
    }
  }

  /* ——— the sphere: one colour, lit from the upper left, engraved with lines of longitude ——— */
  const v = [0, 0, 0];
  function P(lon, lat) {
    const cl = Math.cos(lat), x = cl * Math.cos(lon), y = Math.sin(lat), z = cl * Math.sin(lon);
    const y1 = y * cT - z * sT;
    v[0] = x * cR - y1 * sR; v[1] = x * sR + y1 * cR; v[2] = y * sT + z * cT;
  }
  // one curve on the sphere, drawn only where it faces us
  function curve(f, n) {
    let pen = false;
    for (let k = 0; k <= n; k++) {
      f(k / n);
      if (v[2] <= 0) { pen = false; continue; }
      if (pen) ctx.lineTo(cx + v[0] * R, cy - v[1] * R); else ctx.moveTo(cx + v[0] * R, cy - v[1] * R);
      pen = true;
    }
  }
  function drawSphere(a, fade) {
    const al = a * (1 - fade);
    let g = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 1.7);
    g.addColorStop(0, `rgba(${HAZE},${(0.16 + 0.16 * hot) * al})`); g.addColorStop(1, `rgba(${HAZE},0)`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * 1.7, 0, TAU); ctx.fill();
    // a dark body first, so whatever passes behind stays hidden while the colour fades in
    ctx.fillStyle = "#070b0c"; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fill();
    g = ctx.createRadialGradient(cx + LIGHT[0] * R * 0.62, cy - LIGHT[1] * R * 0.62, R * 0.05, cx, cy, R * 1.28);
    g.addColorStop(0, `rgba(214,225,231,${al})`);
    g.addColorStop(0.35, `rgba(${HAZE},${al})`);
    g.addColorStop(0.7, `rgba(74,98,110,${al})`);
    g.addColorStop(1, `rgba(14,24,29,${al})`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fill();

    ctx.strokeStyle = `rgba(10,18,20,${0.3 * al})`; ctx.lineWidth = 0.8;
    ctx.beginPath();
    for (let i = 0; i < NL; i++) { const lon = (i / NL) * TAU + yaw; curve((q) => P(lon, (q - 0.5) * Math.PI), 40); }
    ctx.stroke();

    ctx.strokeStyle = `rgba(${HAZE},${(0.5 + 0.35 * hot) * al})`; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
    if (fade > 0) { ctx.fillStyle = `rgba(${DEEP},${fade})`; ctx.beginPath(); ctx.arc(cx, cy, R + 1, 0, TAU); ctx.fill(); }
  }

  /* ——— frame ——— */
  // a drawing must never be what keeps someone out: on any failure, open the site
  function frame(now) {
    try { paint(now); } catch (e) { finish(); }
  }
  function paint(now) {
    if (done) return;
    // laid out at zero size (a hidden tab or pane): wait for a real one
    if (!ground || !ground.width || !ground.height) {
      size();
      if (!reduceMotion || !ground.width) requestAnimationFrame(frame);
      return;
    }
    if (!t0) t0 = reduceMotion ? now - 9000 : now;
    const t = now - t0, dt = Math.min(50, now - (lastT || now));
    lastT = now;
    const u = leaveAt ? clamp((now - leaveAt) / 1500) : 0;
    hot += (hotTarget - hot) * 0.08;
    pmx += (mx - pmx) * 0.06; pmy += (my - pmy) * 0.06;
    const rush = 1 + u * u * 14;
    yaw += dt * 0.00014 * (1 + hot * 2.2) * rush;
    spin += dt * 0.001 * (1 + hot * 0.7) * rush;

    const s = Math.exp(Math.pow(u, 2.2) * Math.log((far / R) * 0.8)); // the fall into the sphere
    const k = 1 - ease(clamp(u / 0.75));

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = `rgb(${DEEP})`; ctx.fillRect(0, 0, W, H);
    ctx.translate(cx, cy); ctx.scale(s, s); ctx.translate(-cx, -cy);
    ctx.lineCap = "round";

    // the ground opens outward from the sphere, like a drawing being made
    const open = 1 - Math.pow(1 - clamp((t - 200) / 2600), 3);
    if (open > 0 && k > 0) {
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, far * 0.62 * open + 1, 0, TAU); ctx.clip();
      ctx.globalAlpha = k;
      ctx.drawImage(ground, -20 - pmx * 10, -20 - pmy * 10, W + 40, H + 40);
      ctx.restore();
    }
    drawRings(t, k);
    const ma = clamp((t - 1200) / 1400) * k;
    drawMarks(false, ma);
    drawSphere(clamp(t / 900), ease(clamp((u - 0.15) / 0.55)));
    drawMarks(true, ma);

    if (u > 0.8) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = `rgba(${DEEP},${clamp((u - 0.8) / 0.2)})`; ctx.fillRect(0, 0, W, H);
    }
    if (u >= 1) return finish();
    if (!reduceMotion) requestAnimationFrame(frame);
  }

  function size() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = portal.clientWidth; H = portal.clientHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    cx = W / 2; cy = H * 0.47;
    R = clamp(Math.min(W, H) * 0.16, 58, 170);
    far = Math.hypot(W, H);
    portal.style.setProperty("--px", cx + "px");
    portal.style.setProperty("--py", cy + "px");
    portal.style.setProperty("--pd", R * 2 + "px");
    buildGround();
    buildMarks();
    if (reduceMotion && ground.width) requestAnimationFrame(frame);
  }

  function enter() {
    if (leaveAt || done) return;
    portal.classList.add("leaving");
    if (reduceMotion) return finish();
    leaveAt = performance.now();
  }
  function finish() {
    done = true;
    portal.classList.add("gone");
    root.classList.remove("gated");
    removeEventListener("keydown", onKey);
    setTimeout(() => portal.remove(), 900);
  }
  function onKey(e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    enter();
  }

  hit.addEventListener("click", enter);
  btn.addEventListener("click", enter);
  addEventListener("keydown", onKey);
  for (const el of [hit, btn]) {
    el.addEventListener("pointerenter", () => { hotTarget = 1; portal.classList.add("hot"); });
    el.addEventListener("pointerleave", () => { hotTarget = 0; portal.classList.remove("hot"); });
  }
  portal.addEventListener("pointermove", (e) => { mx = (e.clientX / W) * 2 - 1; my = (e.clientY / H) * 2 - 1; });
  addEventListener("resize", () => { if (done) return; clearTimeout(size.t); size.t = setTimeout(() => { try { size(); } catch (e) { finish(); } }, 150); });
  setTimeout(() => portal.classList.add("ready"), reduceMotion ? 0 : 2400);

  scrollTo(0, 0);
  buildRings();
  try { size(); } catch (e) { finish(); }
  requestAnimationFrame(frame);
})();
