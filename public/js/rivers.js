// River maps that fall from planetary scale into one place. Each map section
// shares the Natural Earth world rivers and adds its own detailed flowlines.
(function () {
  const { clamp, progress, near, rng } = Scroll;

  const SOURCES = [
    "https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_50m_rivers_lake_centerlines.geojson",
    "https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_110m_rivers_lake_centerlines.geojson",
  ];
  const GROUPS = [
    { max: 3, w: 1.5, dash: [22, 120], speed: 0.06 },
    { max: 6, w: 0.9, dash: [12, 80], speed: 0.045 },
    { max: 99, w: 0.55, dash: [7, 55], speed: 0.035 },
  ];
  const GOLD = hexRgb("#e8d9a6"), ORANGE = hexRgb("#e7a14a");

  function hexRgb(h) {
    const n = parseInt(h.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const mix = (a, b, f) => a.map((v, i) => Math.round(v + (b[i] - v) * f));
  const ease = (x) => x * x * (3 - 2 * x);

  async function loadWorld() {
    for (const url of SOURCES) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const geo = await res.json();
        return geo.features.filter((f) => f.geometry);
      } catch (e) { /* try the next one */ }
    }
    return fakeRivers();
  }

  // offline fallback: dendritic rivers grown from random mouths
  function fakeRivers() {
    const r = rng(11), out = [];
    function grow(lon, lat, ang, len, rank, depth) {
      const coords = [[lon, lat]];
      for (let i = 0; i < len; i++) {
        ang += (r() - 0.5) * 0.7;
        lon += Math.cos(ang) * 0.9; lat += Math.sin(ang) * 0.6;
        coords.push([lon, lat]);
        if (depth < 4 && r() < 0.12) grow(lon, lat, ang + (r() < 0.5 ? 1 : -1) * (0.6 + r()), len * 0.55, rank + 2, depth + 1);
      }
      out.push({ properties: { scalerank: rank }, geometry: { type: "LineString", coordinates: coords } });
    }
    for (let i = 0; i < 70; i++) grow(-170 + r() * 340, -45 + r() * 110, r() * 6.28, 18 + r() * 30, 1 + Math.floor(r() * 3), 0);
    return out;
  }
  const world = loadWorld();

  /*
   * opts.section, opts.canvas  where to draw
   * opts.detail                url of {main, trib, pin?} flowlines
   * opts.box                   [[lon, lat], [lon, lat]] the fall settles on
   * opts.from                  { center: [lon, lat], s } where the camera starts (default: whole world)
   * opts.fall                  [p0, p1] scroll span of the fall
   * opts.fadeIn / opts.fadeOut rgb arrays to fade from / into at the ends
   * opts.hero                  element to fade out as the fall begins
   */
  function riverZoom(opts) {
    const { section, canvas } = opts;
    const ctx = canvas.getContext("2d");
    const [f0, f1] = opts.fall || [0.05, 0.9];
    let W = 0, H = 0, dpr = 1, feats = null, detail = null;
    let paths = null, mainPath = null, tribPath = null, pin = null;
    let start = [0, 0], focus = [0, 0], s0 = 1, sMax = 1;
    let flow = 0, lastT = 0;

    function build() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      if (!feats) return;
      const narrow = W < 700;
      const projection = d3.geoEqualEarth().fitExtent(
        narrow ? [[-W * 0.9, H * 0.18], [W * 1.9, H * 0.82]] : [[-W * 0.04, H * 0.03], [W * 1.04, H * 0.97]],
        { type: "FeatureCollection", features: feats }
      );
      paths = GROUPS.map(() => new Path2D());
      const gen = GROUPS.map((g, i) => d3.geoPath(projection, paths[i]));
      for (const f of feats) {
        const rank = f.properties.scalerank ?? f.properties.rank ?? 5;
        gen[GROUPS.findIndex((g) => rank <= g.max)](f);
      }

      const [b0, b1] = opts.box;
      const a = projection(b0), b = projection(b1);
      focus = projection([(b0[0] + b1[0]) / 2, (b0[1] + b1[1]) / 2]);
      sMax = Math.min((W * 0.8) / Math.abs(b[0] - a[0]), (H * 0.82) / Math.abs(b[1] - a[1]));
      s0 = opts.from ? opts.from.s : 1;
      start = opts.from ? projection(opts.from.center) : [W / 2, H / 2];

      if (detail) {
        mainPath = new Path2D(); tribPath = new Path2D();
        d3.geoPath(projection, mainPath)(detail.main);
        d3.geoPath(projection, tribPath)(detail.trib);
        pin = detail.pin ? projection(detail.pin) : null;
      }
    }

    function draw(t) {
      if (!paths || !near(section, 0.1)) return;
      const p = progress(section);

      if (opts.hero) {
        opts.hero.style.opacity = 1 - clamp(p / 0.08);
        opts.hero.style.transform = `translateY(${-clamp(p / 0.08) * 40}px)`;
      }
      const col = mix(GOLD, ORANGE, ease(clamp((p - f0) / (f1 - f0))));

      // logarithmic fall: the camera centres first, then keeps dropping
      const z = ease(clamp((p - f0) / (f1 - f0)));
      const s = Math.exp(Math.log(s0) + z * (Math.log(sMax) - Math.log(s0)));
      const cz = ease(clamp(z / 0.35));
      const cx = start[0] + (focus[0] - start[0]) * cz;
      const cy = start[1] + (focus[1] - start[1]) * cz;
      const worldA = 1 - clamp((z - 0.55) / 0.25); // the coarse world map gives way
      const localA = clamp((z - 0.5) / 0.3); // to the detailed flowlines

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.save();
      ctx.translate(W * 0.5, H * 0.5);
      ctx.scale(s, s);
      ctx.translate(-cx, -cy);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      const lw = (w) => (w * (1 + 0.35 * Math.log(s))) / s;

      // Dashes live in map space so zooming doesn't slide them along the rivers;
      // the flow is integrated per frame so its on-screen speed stays steady.
      const dt = Math.min(50, t - lastT || 16);
      lastT = t;
      flow = reduceMotion ? p * 4000 : flow + dt / s;

      if (worldA > 0) {
        ctx.globalCompositeOperation = "source-over";
        ctx.setLineDash([]);
        GROUPS.forEach((g, i) => {
          ctx.strokeStyle = `rgba(233,228,214,${(0.12 + 0.06 * (2 - i)) * worldA})`;
          ctx.lineWidth = lw(g.w);
          ctx.stroke(paths[i]);
        });
        ctx.globalCompositeOperation = "lighter";
        GROUPS.forEach((g, i) => {
          ctx.setLineDash(g.dash);
          ctx.lineDashOffset = -flow * g.speed;
          ctx.strokeStyle = `rgba(${col},${0.16 * worldA})`;
          ctx.lineWidth = lw(g.w * 4.5);
          ctx.stroke(paths[i]);
          ctx.strokeStyle = `rgba(${col},${0.85 * worldA})`;
          ctx.lineWidth = lw(g.w * 1.3);
          ctx.stroke(paths[i]);
        });
      }

      if (mainPath && localA > 0) {
        // sized for the bottom of the fall, in screen pixels at sMax
        const px = (v) => v / sMax;
        ctx.globalCompositeOperation = "source-over";
        ctx.setLineDash([]);
        ctx.strokeStyle = `rgba(233,228,214,${0.22 * localA})`;
        ctx.lineWidth = px(1);
        ctx.stroke(tribPath);
        ctx.strokeStyle = `rgba(233,228,214,${0.35 * localA})`;
        ctx.lineWidth = px(2);
        ctx.stroke(mainPath);
        ctx.globalCompositeOperation = "lighter";
        ctx.lineDashOffset = -flow * 0.045;
        ctx.setLineDash([px(10), px(46)]);
        ctx.strokeStyle = `rgba(${col},${0.8 * localA})`;
        ctx.lineWidth = px(1.3);
        ctx.stroke(tribPath);
        ctx.setLineDash([px(18), px(70)]);
        ctx.strokeStyle = `rgba(${ORANGE},${0.2 * localA})`;
        ctx.lineWidth = px(9);
        ctx.stroke(mainPath);
        ctx.strokeStyle = `rgba(${ORANGE},${0.95 * localA})`;
        ctx.lineWidth = px(2.6);
        ctx.stroke(mainPath);
      }
      ctx.restore();

      // the place itself: a pin that breathes
      if (pin && localA > 0.3) {
        const x = W * 0.5 + (pin[0] - cx) * s, y = H * 0.5 + (pin[1] - cy) * s;
        const a = clamp((localA - 0.3) / 0.4);
        ctx.globalCompositeOperation = "source-over";
        ctx.setLineDash([]);
        ctx.fillStyle = `rgba(255,248,230,${a})`;
        ctx.beginPath(); ctx.arc(x, y, 4, 0, 7); ctx.fill();
        ctx.strokeStyle = `rgba(231,161,74,${a})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(x, y, 12 + Math.sin(t * 0.004) * 3, 0, 7); ctx.stroke();
      }

      // seams: come out of the section above, dissolve into the one below
      ctx.globalCompositeOperation = "source-over";
      if (opts.fadeIn) {
        const a = 1 - ease(clamp(p / 0.06));
        if (a > 0) { ctx.fillStyle = `rgba(${opts.fadeIn},${a})`; ctx.fillRect(0, 0, W, H); }
      }
      if (opts.fadeOut) {
        const a = ease(clamp((p - 0.93) / 0.07));
        if (a > 0) { ctx.fillStyle = `rgba(${opts.fadeOut},${a})`; ctx.fillRect(0, 0, W, H); }
      }
    }

    Promise.all([
      world,
      opts.detail ? fetch(opts.detail).then((r) => (r.ok ? r.json() : null)).catch(() => null) : null,
    ]).then(([f, d]) => {
      feats = f;
      detail = d;
      build();
    });
    addEventListener("resize", () => { clearTimeout(build.t); build.t = setTimeout(build, 150); });
    build();
    Scroll.on(draw);
  }

  const INK = [25, 24, 21], PAPER = [238, 234, 225], UMBER = [21, 19, 15];
  const $ = (id) => document.getElementById(id);

  // 00 · the world, then New York
  riverZoom({
    section: $("surface"), canvas: $("rivers-ny"), hero: document.querySelector(".hero"),
    detail: "data/new-york.json",
    box: [[-74.35, 40.55], [-73.55, 41.45]],
    fall: [0.32, 0.9], fadeOut: INK,
  });
  // 02 · out of the strata, across the continent, into the Little Deschutes
  riverZoom({
    section: $("oregon"), canvas: $("rivers-or"),
    detail: "data/little-deschutes.json",
    box: [[-122.15, 43.26], [-121.4, 43.86]],
    from: { center: [-98, 40], s: 3.2 }, fall: [0.06, 0.9], fadeIn: INK, fadeOut: PAPER,
  });
  // 04 · halfway round the planet to central India, where the profile was photographed
  riverZoom({
    section: $("india"), canvas: $("rivers-in"),
    detail: "data/india.json",
    box: [[77.4, 20.5], [81.8, 23.7]],
    fall: [0.06, 0.9], fadeIn: UMBER, fadeOut: UMBER,
  });
})();
