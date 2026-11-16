// Shared by every plate: seeded noise, the data loader, and one frame loop
// that only draws the plates currently on screen.
window.Base = (function () {
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  function rng(seed) {
    let s = seed >>> 0;
    return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  }
  const gauss = (r) => Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(2 * Math.PI * r());
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Data ships as scripts (data/*.js), loaded with <script> tags rather than fetch(),
  // so the page also works when index.html is opened straight from disk.
  const ver = ((document.currentScript && document.currentScript.src.match(/\?v=\d+/)) || [""])[0];
  const loading = {};
  function data(name) {
    return (loading[name] = loading[name] || new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = `data/${name}.js${ver}`;
      s.onload = () => resolve(window.__data[name]);
      s.onerror = () => reject(new Error(`data/${name}.js did not load`));
      document.head.appendChild(s);
    }));
  }

  const live = new Set();
  const seen = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const p = e.target.__plate;
      if (!p) continue;
      if (e.isIntersecting) { live.add(p); p.dirty = true; } else live.delete(p);
    }
  }, { rootMargin: "100px" });

  // plate(el, { size(p), draw(t, p) }): p.W, p.H in CSS px; canvases are sized for the screen's density
  function plate(el, opts) {
    const p = { el, W: 0, H: 0, dpr: 1, dirty: true, draw: opts.draw };
    el.__plate = p;
    const fit = () => {
      const W = el.clientWidth, H = el.clientHeight;
      if (!W || !H) return;
      p.W = W; p.H = H; p.dpr = Math.min(devicePixelRatio || 1, 2);
      if (el.tagName === "CANVAS") { el.width = Math.round(W * p.dpr); el.height = Math.round(H * p.dpr); }
      if (opts.size) opts.size(p);
      p.dirty = true;
    };
    new ResizeObserver(fit).observe(el);
    seen.observe(el);
    fit();
    return p;
  }

  requestAnimationFrame(function loop(t) {
    for (const p of live) {
      if (!p.W || (reduceMotion && !p.dirty)) continue;
      p.dirty = false;
      try { p.draw(t, p); } catch (e) { /* one plate failing must not stop the others */ }
    }
    requestAnimationFrame(loop);
  });

  // the index lights the work being looked at
  addEventListener("DOMContentLoaded", () => {
    const links = [...document.querySelectorAll(".rail ol a")];
    const targets = links.map((a) => document.getElementById(a.getAttribute("href").slice(1))).filter(Boolean);
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        links.forEach((a) => a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id));
      }
    }, { rootMargin: "-35% 0px -60% 0px" });
    targets.forEach((t) => io.observe(t));
  });

  return { clamp, rng, gauss, reduceMotion, data, plate };
})();
