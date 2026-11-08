// 06 · seven years of burning across South and Southeast Asia, built up month
// by month with the scroll. NASA FIRMS MODIS fire pixel-days (measured), from
// the rice_husk_ash fire-maps project, re-binned to 0.25° (data/firms-ssea.*).
(function () {
  const section = document.getElementById("fires");
  const canvas = document.getElementById("fire-map");
  const ctx = canvas.getContext("2d");
  const label = document.getElementById("fire-month");
  const { clamp, progress, near } = Scroll;
  const BOX = [[60, -11], [142, 38]];
  const STOPS = [[90, 32, 16], [200, 96, 40], [240, 170, 80], [255, 246, 222]]; // ember → orange → white heat

  let meta = null, cells = null, counts = null, land = null;
  let cum = null, grid = null, gimg = null, k = -1, built = -1;
  let W = 0, H = 0, dpr = 1, projection = null, rect = null, bars = null;

  function color(v) {
    const t = v * (STOPS.length - 1), i = Math.min(STOPS.length - 2, Math.floor(t)), f = t - i;
    return STOPS[i].map((c, j) => c + (STOPS[i + 1][j] - c) * f);
  }

  function size() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    const narrow = W < 860;
    const barH = narrow ? 54 : 70;
    const area = narrow
      ? [[12, H * 0.3], [W - 12, H - barH - 40]]
      : [[W * 0.35, 70], [W - 48, H - barH - 50]];
    projection = d3.geoEquirectangular().fitExtent(area, {
      type: "MultiPoint", coordinates: [BOX[0], BOX[1], [BOX[0][0], BOX[1][1]], [BOX[1][0], BOX[0][1]]],
    });
    const a = projection([BOX[0][0], BOX[1][1]]), b = projection([BOX[1][0], BOX[0][1]]);
    rect = { x: a[0], y: a[1], w: b[0] - a[0], h: b[1] - a[1] };
    bars = { x: rect.x, y: H - barH - 22, w: rect.w, h: barH };
    k = -1;
  }

  // running total of every fire up to month m (rebuilt from zero when scrolling back)
  function accumulate(m) {
    if (m < built) { cum.fill(0); built = -1; }
    for (let i = meta.offsets[built + 1]; i < meta.offsets[m + 1]; i++) cum[cells[i]] += counts[i];
    built = m;
    const d = gimg.data, nx = meta.nx, ny = meta.ny, top = Math.log10(36000);
    for (let c = 0; c < nx * ny; c++) {
      const v = cum[c];
      const o = ((ny - 1 - Math.floor(c / nx)) * nx + (c % nx)) * 4;
      if (!v) { d[o + 3] = 0; continue; }
      const t = clamp(Math.log10(v + 1) / top);
      const [r, g, b] = color(t);
      d[o] = r; d[o + 1] = g; d[o + 2] = b; d[o + 3] = 70 + 185 * t;
    }
    grid.getContext("2d").putImageData(gimg, 0, 0);
  }

  function draw(m) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    if (land) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(rect.x, rect.y, rect.w, rect.h);
      ctx.clip();
      ctx.beginPath();
      d3.geoPath(projection, ctx)(land);
      ctx.fillStyle = "rgba(235,229,212,.035)";
      ctx.fill();
      ctx.strokeStyle = "rgba(235,229,212,.22)";
      ctx.lineWidth = 0.6;
      ctx.stroke();
      ctx.restore();
    }
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(grid, rect.x, rect.y, rect.w, rect.h);

    // the monthly totals, lit up to now
    const max = Math.max(...meta.monthly), bw = bars.w / meta.months;
    for (let i = 0; i < meta.months; i++) {
      const h = (meta.monthly[i] / max) * bars.h;
      ctx.fillStyle = i === m ? "#fff3d6" : i < m ? "rgba(231,161,74,.85)" : "rgba(235,229,212,.14)";
      ctx.fillRect(bars.x + i * bw + 1, bars.y + bars.h - h, bw - 2, h);
    }
    ctx.fillStyle = "rgba(235,229,212,.5)";
    ctx.font = "11px 'Courier Prime', monospace";
    for (let y = 0; y < 7; y++) ctx.fillText(2019 + y, bars.x + y * 12 * bw, bars.y + bars.h + 16);
  }

  Scroll.on(() => {
    if (!meta || !near(section, 0)) return;
    const m = Math.round(clamp((progress(section) - 0.05) / 0.85) * (meta.months - 1));
    if (m === k) return;
    k = m;
    accumulate(m);
    draw(m);
    label.textContent = `${2019 + Math.floor(m / 12)}·${String((m % 12) + 1).padStart(2, "0")}`;
  });

  Promise.all([
    fetch("data/firms-ssea.json").then((r) => r.json()),
    fetch("data/firms-ssea.bin").then((r) => r.arrayBuffer()),
    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/land-50m.json").then((r) => r.json()).catch(() => null),
  ]).then(([m, buf, topo]) => {
    meta = m;
    cells = new Uint16Array(buf, 0, m.rows);
    counts = new Uint16Array(buf, m.rows * 2, m.rows);
    cum = new Float32Array(m.nx * m.ny);
    grid = document.createElement("canvas");
    grid.width = m.nx; grid.height = m.ny;
    gimg = grid.getContext("2d").createImageData(m.nx, m.ny);
    if (topo && window.topojson) land = topojson.feature(topo, topo.objects.land);
    size();
  });
  addEventListener("resize", () => { clearTimeout(size.t); size.t = setTimeout(size, 150); });
})();
