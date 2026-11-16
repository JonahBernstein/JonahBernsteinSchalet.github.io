// The backing. The world's river centerlines (Natural Earth), fixed behind the
// page with a slow pulse moving along them. The page covers all but its edges;
// past the last work the page ends and the map draws back to show the whole world.
(function () {
  const { plate, clamp, rng, reduceMotion } = Base;
  const outro = document.querySelector(".outro");
  const NEAR = 1.9; // how far in the map sits while the page lies over it
  const INK = "25,24,21", BLUE = "63,100,115";
  const SOURCES = [
    "https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_50m_rivers_lake_centerlines.geojson",
    "https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_110m_rivers_lake_centerlines.geojson",
  ];
  // by Natural Earth scalerank: trunk rivers, then the rest
  const GROUPS = [
    { max: 3, w: 0.95, a: 0.62, len: 15, gap: 210, speed: 0.02 },
    { max: 6, w: 0.6, a: 0.46, len: 10, gap: 170, speed: 0.016 },
    { max: 99, w: 0.4, a: 0.34, len: 7, gap: 130, speed: 0.012 },
  ];

  async function loadWorld() {
    for (const url of SOURCES) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        return (await res.json()).features.filter((f) => f.geometry);
      } catch (e) { /* try the next one */ }
    }
    return null;
  }

  const canvas = document.getElementById("rivers-world");
  if (!canvas) return;
  loadWorld().then((feats) => {
    if (!feats) { canvas.parentNode.remove(); return; } // no map rather than a made-up one
    const ctx = canvas.getContext("2d");
    const all = { type: "FeatureCollection", features: feats };
    let paths = null, lines = [], flow = 0, last = 0;
    plate(canvas, {
      size(p) {
        // cover the box: fit the width, and if that leaves the map too short, fit the height and let the sides run off
        const proj = d3.geoEqualEarth().fitExtent([[10, 22], [p.W - 10, p.H * 0.9]], all);
        const [[, y0], [, y1]] = d3.geoPath(proj).bounds(all);
        if (y1 - y0 < p.H * 0.6) {
          proj.fitHeight(p.H * 0.8, all);
          const [[x0], [x1]] = d3.geoPath(proj).bounds(all), tr = proj.translate();
          proj.translate([tr[0] + (p.W - (x0 + x1)) / 2 - (x1 - x0) * 0.1, tr[1] + p.H * 0.06]); // lean toward Africa and Asia
        }
        paths = GROUPS.map(() => new Path2D());
        const gen = GROUPS.map((g, i) => d3.geoPath(proj, paths[i]));
        // each river also as a measured line, so a pulse can travel it on its own clock
        const r = rng(31);
        lines = [];
        for (const f of feats) {
          const gi = GROUPS.findIndex((g) => (f.properties.scalerank ?? 5) <= g.max);
          gen[gi](f);
          const parts = f.geometry.type === "LineString" ? [f.geometry.coordinates] : f.geometry.type === "MultiLineString" ? f.geometry.coordinates : [];
          for (const part of parts) {
            const pts = part.map((c) => proj(c)), cum = [0];
            let broken = false;
            for (let i = 1; i < pts.length; i++) {
              const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
              if (d > p.W / 3) broken = true; // a line that wraps round the edge of the map
              cum.push(cum[i - 1] + d);
            }
            const L = cum[cum.length - 1];
            if (broken || L < 4) continue;
            lines.push({ gi, pts, cum, L, period: L + GROUPS[gi].gap * (0.6 + r() * 0.8), phase: r() });
          }
        }
      },
      draw(t, p) {
        const dt = Math.min(50, t - last || 16);
        last = t;
        if (!reduceMotion) flow += dt;
        // Under the page the map sits close, so the river country of the Americas and of Asia
        // falls on the two edges. As the page ends, it draws back until the whole world is in view.
        const out = outro ? clamp(1 - outro.getBoundingClientRect().top / innerHeight) : 1;
        const e = out * out * (3 - 2 * out);
        const z = p.W < 700 ? 1 : Math.exp(Math.log(NEAR) * (1 - e));
        ctx.setTransform(p.dpr, 0, 0, p.dpr, 0, 0);
        ctx.clearRect(0, 0, p.W, p.H);
        ctx.translate(p.W / 2, p.H / 2); ctx.scale(z, z); ctx.translate(-p.W / 2, -p.H / 2);
        ctx.lineCap = "round"; ctx.lineJoin = "round";
        GROUPS.forEach((g, i) => {
          ctx.strokeStyle = `rgba(${INK},${g.a})`; ctx.lineWidth = g.w / Math.sqrt(z);
          ctx.stroke(paths[i]);
        });
        // one pulse per river, each starting at its own moment
        ctx.strokeStyle = `rgba(${BLUE},.95)`;
        GROUPS.forEach((g, gi) => {
          ctx.lineWidth = (g.w * 1.7) / Math.sqrt(z);
          ctx.beginPath();
          for (const ln of lines) {
            if (ln.gi !== gi) continue;
            const head = (flow * g.speed + ln.phase * ln.period) % ln.period, tail = head - g.len;
            if (tail > ln.L || head < 0) continue;
            const a = Math.max(0, tail), b = Math.min(ln.L, head), { pts, cum } = ln;
            let i = 1;
            while (cum[i] < a) i++;
            let f = (a - cum[i - 1]) / (cum[i] - cum[i - 1] || 1);
            ctx.moveTo(pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f);
            while (cum[i] < b) { ctx.lineTo(pts[i][0], pts[i][1]); i++; }
            f = (b - cum[i - 1]) / (cum[i] - cum[i - 1] || 1);
            ctx.lineTo(pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f);
          }
          ctx.stroke();
        });
      },
    });
  });
})();
