// Rice, burning. Seven years of fire across South and Southeast Asia, added up
// month by month. NASA FIRMS MODIS fire pixel-days (measured), from the
// rice_husk_ash fire-maps project, re-binned to 0.25° (data/firms-ssea.js).
// It plays on its own; move across the plate to choose the month yourself.
(function () {
  const { plate, data, clamp, reduceMotion } = Base;
  const canvas = document.getElementById("fires");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const label = document.getElementById("fires-month");
  const BOX = [[60, -11], [142, 38]];
  const INK = "25,24,21", RUST = "180,83,42";
  const STOPS = [[229, 201, 158], [205, 132, 62], [156, 62, 28], [46, 18, 10]]; // few fires → many

  let meta = null, cells = null, counts = null, land = null;
  let cum = null, grid = null, gimg = null, built = -1, shown = -1;
  let projection = null, rect = null, bars = null;
  let clock = 0, last = 0, held = null;

  const color = (v) => {
    const t = v * (STOPS.length - 1), i = Math.min(STOPS.length - 2, Math.floor(t)), f = t - i;
    return STOPS[i].map((c, j) => c + (STOPS[i + 1][j] - c) * f);
  };

  // running total of every fire up to month m (rebuilt from zero when going back)
  function accumulate(m) {
    if (m < built) { cum.fill(0); built = -1; }
    for (let i = meta.offsets[built + 1]; i < meta.offsets[m + 1]; i++) cum[cells[i]] += counts[i];
    built = m;
    const d = gimg.data, nx = meta.nx, ny = meta.ny, top = Math.log10(36000);
    for (let c = 0; c < nx * ny; c++) {
      const v = cum[c], o = ((ny - 1 - Math.floor(c / nx)) * nx + (c % nx)) * 4;
      if (!v) { d[o + 3] = 0; continue; }
      const t = clamp(Math.log10(v + 1) / top);
      const [r, g, b] = color(t);
      d[o] = r; d[o + 1] = g; d[o + 2] = b; d[o + 3] = 90 + 165 * t;
    }
    grid.getContext("2d").putImageData(gimg, 0, 0);
  }

  function draw(t, p) {
    p.dirty = true; // keep the clock running while on screen
    const dt = Math.min(60, t - last || 16);
    last = t;
    // one pass takes 34 s, then it rests on the full seven years before starting over
    const span = 34000, rest = 5000;
    if (held === null && !reduceMotion) clock = (clock + dt) % (span + rest);
    const frac = held !== null ? held : reduceMotion ? 1 : clamp(clock / span);
    const m = Math.round(frac * (meta.months - 1));
    if (m === shown) return;
    shown = m;
    accumulate(m);

    ctx.setTransform(p.dpr, 0, 0, p.dpr, 0, 0);
    ctx.clearRect(0, 0, p.W, p.H);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(grid, rect.x, rect.y, rect.w, rect.h);
    if (land) {
      ctx.save();
      ctx.beginPath(); ctx.rect(rect.x, rect.y, rect.w, rect.h); ctx.clip();
      ctx.beginPath();
      d3.geoPath(projection, ctx)(land);
      ctx.strokeStyle = `rgba(${INK},.5)`; ctx.lineWidth = 0.5;
      ctx.stroke();
      ctx.restore();
    }
    // each month's total, inked up to now
    const max = Math.max(...meta.monthly), bw = bars.w / meta.months;
    for (let i = 0; i < meta.months; i++) {
      const h = (meta.monthly[i] / max) * bars.h;
      ctx.fillStyle = i === m ? `rgb(${RUST})` : i < m ? `rgba(${INK},.82)` : `rgba(${INK},.13)`;
      ctx.fillRect(bars.x + i * bw + 0.5, bars.y + bars.h - h, Math.max(1, bw - 1.5), h);
    }
    ctx.fillStyle = `rgba(${INK},.6)`;
    ctx.font = "11px 'Courier Prime', monospace";
    for (let y = 0; y < 7; y++) ctx.fillText(2019 + y, bars.x + y * 12 * bw, bars.y + bars.h + 15);
    label.textContent = `${2019 + Math.floor(m / 12)}·${String((m % 12) + 1).padStart(2, "0")}`;
  }

  Promise.all([
    data("firms-ssea"),
    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/land-50m.json").then((r) => r.json()).catch(() => null),
  ]).then(([d, topo]) => {
    meta = d.meta;
    const raw = atob(d.b64), bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
    d.b64 = null;
    cells = new Uint16Array(bytes.buffer, 0, meta.rows);
    counts = new Uint16Array(bytes.buffer, meta.rows * 2, meta.rows);
    cum = new Float32Array(meta.nx * meta.ny);
    grid = document.createElement("canvas");
    grid.width = meta.nx; grid.height = meta.ny;
    gimg = grid.getContext("2d").createImageData(meta.nx, meta.ny);
    if (topo && window.topojson) land = topojson.feature(topo, topo.objects.land);

    plate(canvas, {
      size(p) {
        const pad = Math.max(10, p.W * 0.018), barH = clamp(p.H * 0.1, 30, 58);
        projection = d3.geoEquirectangular().fitExtent([[pad, pad + 26], [p.W - pad, p.H - barH - 34 - pad]], {
          type: "MultiPoint", coordinates: [BOX[0], BOX[1], [BOX[0][0], BOX[1][1]], [BOX[1][0], BOX[0][1]]],
        });
        const a = projection([BOX[0][0], BOX[1][1]]), b = projection([BOX[1][0], BOX[0][1]]);
        rect = { x: a[0], y: a[1], w: b[0] - a[0], h: b[1] - a[1] };
        bars = { x: rect.x, y: p.H - barH - 22 - pad * 0.4, w: rect.w, h: barH };
        shown = -1;
      },
      draw,
    });
    const at = (e) => { const b = canvas.getBoundingClientRect(); held = clamp((e.clientX - b.left - bars.x) / bars.w); };
    canvas.addEventListener("pointermove", at);
    canvas.addEventListener("pointerdown", at);
    canvas.addEventListener("pointerleave", () => { if (held !== null) { clock = held * 34000; held = null; } });
  }).catch(() => canvas.closest("figure").classList.add("missing"));
})();
