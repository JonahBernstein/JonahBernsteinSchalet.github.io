// One rAF loop for the whole page. Modules register a tick(t) and read
// their own section's scroll progress with Scroll.progress(el).
(function () {
  const ticks = [];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  // 0 when the section's top meets the viewport top, 1 when its bottom meets the viewport bottom
  function progress(el) {
    const r = el.getBoundingClientRect();
    const span = r.height - innerHeight;
    return span <= 0 ? clamp(-r.top / innerHeight) : clamp(-r.top / span);
  }
  function near(el, margin = 1) {
    const r = el.getBoundingClientRect();
    return r.bottom > -innerHeight * margin && r.top < innerHeight * (1 + margin);
  }

  // deterministic noise so the page looks the same on every load
  function rng(seed) {
    let s = seed >>> 0;
    return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  }
  function gauss(r) {
    return Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(2 * Math.PI * r());
  }

  window.Scroll = { progress, near, clamp, rng, gauss, on: (fn) => ticks.push(fn) };
  window.reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  requestAnimationFrame(function loop(t) {
    for (const fn of ticks) fn(t);
    requestAnimationFrame(loop);
  });

  /* ——— core log + nav ——— */
  const tick = document.querySelector(".core-tick");
  const scaleLabel = document.getElementById("core-scale");
  const scaled = [...document.querySelectorAll("[data-scale]")];
  const navLinks = [...document.querySelectorAll(".chrome nav a")];
  let lastScale = "";
  Scroll.on(() => {
    const max = document.documentElement.scrollHeight - innerHeight;
    tick.style.top = (clamp(scrollY / max) * 100) + "%";
    let current = scaled[0];
    for (const s of scaled) if (s.getBoundingClientRect().top < innerHeight * 0.5) current = s;
    if (current.dataset.scale !== lastScale) {
      lastScale = current.dataset.scale;
      scaleLabel.textContent = lastScale;
      navLinks.forEach((a) => a.classList.toggle("on", a.getAttribute("href") === "#" + current.id));
    }
  });

  /* ——— a line taken for a walk ——— */
  const walk = document.querySelector(".walk");
  const path = document.getElementById("walk-path");
  let walkLen = 0;
  function buildWalk() {
    const H = document.documentElement.scrollHeight, W = innerWidth;
    walk.setAttribute("height", H);
    walk.setAttribute("viewBox", `0 0 ${W} ${H}`);
    walk.style.height = H + "px";
    const r = rng(7);
    let x = W * 0.86, y = 0, vx = 0;
    let d = `M${x.toFixed(1)},0`;
    while (y < H) {
      const step = 60 + r() * 110;
      vx = vx * 0.7 + (r() - 0.5) * W * 0.09;
      // drift back toward the right margin so it rarely crosses text
      vx += (W * 0.84 - x) * 0.08;
      const nx = clamp(x + vx, W * 0.05, W * 0.985);
      const ny = y + step;
      if (r() < 0.06) {
        // a Klee loop
        const s = 30 + r() * 50;
        d += ` C${(x + s).toFixed(1)},${(y + s * 1.6).toFixed(1)} ${(x - s * 1.4).toFixed(1)},${(y + s * 1.4).toFixed(1)} ${x.toFixed(1)},${(y + s * 0.4).toFixed(1)}`;
        y += s * 0.4;
      }
      d += ` C${x.toFixed(1)},${(y + step * 0.55).toFixed(1)} ${nx.toFixed(1)},${(ny - step * 0.55).toFixed(1)} ${nx.toFixed(1)},${ny.toFixed(1)}`;
      x = nx; y = ny;
    }
    path.setAttribute("d", d);
    walkLen = path.getTotalLength();
    path.style.strokeDasharray = walkLen;
  }
  Scroll.on(() => {
    if (!walkLen) return;
    const H = document.documentElement.scrollHeight;
    const f = clamp((scrollY + innerHeight * 0.72) / H);
    path.style.strokeDashoffset = walkLen * (1 - f);
  });

  /* ——— photographs peeled into strata ——— */
  const strata = [...document.querySelectorAll(".strata")].map((fig, k) => {
    const stage = fig.querySelector(".strata-stage");
    const vertical = fig.dataset.dir === "y";
    const n = vertical ? 9 : 7;
    const r = rng(31 + k);
    const strips = [];
    for (let i = 0; i < n; i++) {
      const s = document.createElement("div");
      s.style.backgroundImage = `url(${fig.dataset.img})`;
      stage.appendChild(s);
      strips.push({ el: s, amp: (r() - 0.5) * 2, lag: r() * 0.3 });
    }
    const img = new Image();
    const item = { fig, stage, strips, vertical, n, aspect: 1.508 };
    img.onload = () => { item.aspect = img.width / img.height; layout(item); };
    img.src = fig.dataset.img;
    return item;
  });
  function layout(it) {
    const W = it.stage.clientWidth, H = it.stage.clientHeight;
    // cover
    let bw = W, bh = W / it.aspect;
    if (bh < H) { bh = H; bw = H * it.aspect; }
    const ox = (W - bw) / 2, oy = (H - bh) / 2;
    it.strips.forEach((s, i) => {
      const st = s.el.style;
      st.backgroundSize = `${bw}px ${bh}px`;
      if (it.vertical) {
        const w = W / it.n;
        st.left = i * w + "px"; st.width = Math.ceil(w) + 1 + "px";
        st.backgroundPosition = `${ox - i * w}px ${oy}px`;
      } else {
        const h = H / it.n;
        st.top = i * h + "px"; st.height = Math.ceil(h) + 1 + "px";
        st.backgroundPosition = `${ox}px ${oy - i * h}px`;
      }
    });
  }
  Scroll.on(() => {
    for (const it of strata) {
      if (!near(it.fig, 0.2)) continue;
      const p = progress(it.fig);
      it.strips.forEach((s) => {
        // aligned at the middle of the scroll, sheared apart either side
        const raw = (p - 0.5) * 2;
        const d = Math.max(0, Math.abs(raw) - 0.14) / 0.86;
        const amt = Math.sign(raw) * Math.pow(d, 1.3 + s.lag * 3) * s.amp;
        s.el.style.transform = it.vertical
          ? `translateY(${amt * 55}vh)`
          : `translateX(${amt * 70}vw)`;
      });
    }
  });

  function onResize() {
    buildWalk();
    strata.forEach(layout);
  }
  addEventListener("resize", () => { clearTimeout(onResize.t); onResize.t = setTimeout(onResize, 150); });
  addEventListener("load", onResize);
  if (document.readyState === "complete") onResize();
})();
